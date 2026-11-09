import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { MediaControlAction, MediaSessionData } from '../../src/shared/types';

interface BridgeResponse {
  hasSession: boolean;
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  appId: string;
  batteryPercent: number;
  isCharging: boolean;
  hasBattery: boolean;
}

export class MediaService {
  private psWorker: ChildProcessWithoutNullStreams | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private lastSessionJson = '';
  private currentSession: MediaSessionData | null = null;
  private onMediaChange: (session: MediaSessionData | null, isNewTrack: boolean) => void;
  private onBatteryUpdate: (percent: number, isCharging: boolean, hasBattery: boolean) => void;
  private lastTrackKey = '';
  private stdoutBuffer = '';

  constructor(
    onMediaChange: (session: MediaSessionData | null, isNewTrack: boolean) => void,
    onBatteryUpdate: (percent: number, isCharging: boolean, hasBattery: boolean) => void
  ) {
    this.onMediaChange = onMediaChange;
    this.onBatteryUpdate = onBatteryUpdate;
  }

  public start(): void {
    this.initPersistentWorker();
    this.pollTimer = setInterval(() => {
      this.requestPoll();
    }, 2500);
    setTimeout(() => this.requestPoll(), 600);
  }

  private initPersistentWorker(): void {
    if (this.psWorker) return;

    const worker = spawn(
      'powershell.exe',
      ['-NoProfile', '-NoLogo', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', '-'],
      {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );
    this.psWorker = worker;

    const bootstrapScript = `
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.Runtime.WindowsRuntime -ErrorAction SilentlyContinue

$null = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]

Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class MediaKeySender {
    [DllImport("user32.dll")]
    public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
    public static void Tap(byte vk) {
        keybd_event(vk, 0, 0, UIntPtr.Zero);
        keybd_event(vk, 0, 2, UIntPtr.Zero);
    }
}
"@ -ErrorAction SilentlyContinue

$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1'
})[0]

function Await-WinRT($WinRtTask, $ResultType) {
    if ($null -eq $WinRtTask) { return $null }
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(800) | Out-Null
    return $netTask.Result
}

$script:mgr = $null
try {
    $script:mgr = Await-WinRT ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])
} catch {}

function Get-VNotchStatus {
    $pwr = [System.Windows.Forms.SystemInformation]::PowerStatus
    $batPct = [Math]::Round($pwr.BatteryLifePercent * 100)
    if ($batPct -gt 100 -or $batPct -lt 0) { $batPct = 100 }
    $hasBat = ($pwr.BatteryChargeStatus -ne [System.Windows.Forms.BatteryChargeStatus]::NoSystemBattery)
    $charging = ($pwr.PowerLineStatus -eq [System.Windows.Forms.PowerLineStatus]::Online)

    $res = @{
        hasSession = $false
        isPlaying = $false
        title = ""
        artist = ""
        album = ""
        appId = ""
        batteryPercent = $batPct
        isCharging = $charging
        hasBattery = $hasBat
    }

    try {
        if ($null -eq $script:mgr) {
            $script:mgr = Await-WinRT ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager]::RequestAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager])
        }
        if ($null -ne $script:mgr) {
            $session = $script:mgr.GetCurrentSession()
            if ($null -ne $session) {
                $info = $session.GetPlaybackInfo()
                $props = Await-WinRT ($session.TryGetMediaPropertiesAsync()) ([Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties])
                if ($null -ne $props -and $props.Title) {
                    $res.hasSession = $true
                    $res.isPlaying = ($info.PlaybackStatus -eq [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionPlaybackStatus]::Playing)
                    $res.title = [string]$props.Title
                    $res.artist = [string]$props.Artist
                    $res.album = [string]$props.AlbumTitle
                    $res.appId = [string]$session.SourceAppUserModelId
                }
            }
        }
    } catch {}

    $json = $res | ConvertTo-Json -Compress
    Write-Output "VNOTCH_JSON:$json"
}

function Invoke-VNotchMedia($cmd) {
    try {
        $session = if ($null -ne $script:mgr) { $script:mgr.GetCurrentSession() } else { $null }
        if ($cmd -eq "PLAYPAUSE") {
            if ($null -ne $session) { $null = $session.TryTogglePlayPauseAsync() }
            else { [MediaKeySender]::Tap(0xB3) }
        } elseif ($cmd -eq "NEXT") {
            if ($null -ne $session) { $null = $session.TrySkipNextAsync() }
            else { [MediaKeySender]::Tap(0xB0) }
        } elseif ($cmd -eq "PREV") {
            if ($null -ne $session) { $null = $session.TrySkipPreviousAsync() }
            else { [MediaKeySender]::Tap(0xB1) }
        }
    } catch {
        if ($cmd -eq "PLAYPAUSE") { [MediaKeySender]::Tap(0xB3) }
        elseif ($cmd -eq "NEXT") { [MediaKeySender]::Tap(0xB0) }
        elseif ($cmd -eq "PREV") { [MediaKeySender]::Tap(0xB1) }
    }
}
`;

    worker.stdin.write(bootstrapScript + '\n');

    worker.stdout.on('data', (chunk: Buffer) => {
      this.stdoutBuffer += chunk.toString('utf8');
      const lines = this.stdoutBuffer.split(/\r?\n/);
      this.stdoutBuffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VNOTCH_JSON:')) {
          const jsonPart = trimmed.slice('VNOTCH_JSON:'.length);
          this.handleBridgePayload(jsonPart);
        }
      }
    });

    worker.on('exit', () => {
      this.psWorker = null;
    });
  }

  private requestPoll(): void {
    if (!this.psWorker || !this.psWorker.stdin.writable) return;
    this.psWorker.stdin.write('Get-VNotchStatus\n');
  }

  private handleBridgePayload(jsonStr: string): void {
    try {
      const data = JSON.parse(jsonStr) as BridgeResponse;

      this.onBatteryUpdate(data.batteryPercent, data.isCharging, data.hasBattery);

      if (!data.hasSession || !data.title) {
        if (this.currentSession !== null) {
          this.currentSession = null;
          this.lastSessionJson = '';
          this.onMediaChange(null, false);
        }
        return;
      }

      const sourceType = this.detectSourceType(data.appId, data.artist, data.title);
      const nextSession: MediaSessionData = {
        isPlaying: data.isPlaying,
        title: data.title,
        artist: data.artist || this.formatSourceLabel(sourceType),
        album: data.album || undefined,
        appId: data.appId,
        sourceType,
      };

      const serialized = JSON.stringify(nextSession);
      if (serialized !== this.lastSessionJson) {
        const trackKey = `${nextSession.title}::${nextSession.artist}`;
        const isNewTrack = Boolean(this.lastTrackKey && this.lastTrackKey !== trackKey && nextSession.isPlaying);
        this.lastTrackKey = trackKey;
        this.lastSessionJson = serialized;
        this.currentSession = nextSession;
        this.onMediaChange(nextSession, isNewTrack);
      }
    } catch {
      // Ignore malformed lines
    }
  }

  private detectSourceType(
    appId: string,
    artist: string,
    title: string
  ): MediaSessionData['sourceType'] {
    const lower = `${appId} ${artist} ${title}`.toLowerCase();
    if (lower.includes('spotify')) return 'spotify';
    if (lower.includes('youtube')) return 'youtube';
    if (
      lower.includes('chrome') ||
      lower.includes('msedge') ||
      lower.includes('brave') ||
      lower.includes('firefox') ||
      lower.includes('opera')
    ) {
      return 'browser';
    }
    if (lower.includes('music') || lower.includes('vlc') || lower.includes('zune')) {
      return 'music';
    }
    return 'unknown';
  }

  private formatSourceLabel(source: MediaSessionData['sourceType']): string {
    switch (source) {
      case 'spotify':
        return 'Spotify';
      case 'youtube':
        return 'YouTube';
      case 'browser':
        return 'Web Media';
      case 'music':
        return 'Music Player';
      default:
        return 'System Audio';
    }
  }

  public async sendControl(action: MediaControlAction): Promise<boolean> {
    if (!this.psWorker || !this.psWorker.stdin.writable) return false;
    const cmd =
      action === 'play-pause' ? 'PLAYPAUSE' : action === 'next' ? 'NEXT' : 'PREV';
    this.psWorker.stdin.write(`Invoke-VNotchMedia "${cmd}"\n`);
    setTimeout(() => this.requestPoll(), 250);
    return true;
  }

  public getCurrentSession(): MediaSessionData | null {
    return this.currentSession;
  }

  public stop(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    if (this.psWorker) {
      try {
        this.psWorker.kill();
      } catch {}
      this.psWorker = null;
    }
  }
}
