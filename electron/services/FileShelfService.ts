import { nativeImage, WebContents } from 'electron';
import fs from 'fs';

// Minimal 16x16 dark badge PNG data URL for native startDrag icon
const DRAG_ICON_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAADdJREFUOE9jZKAQMFKon2HUAIbRMGAYDQNQAJgwMjL+p6SkhG8wNjY+T0lJAdUNowaMGkBpAAD2hwMRbS6Z1wAAAABJRU5ErkJggg==';

export class FileShelfService {
  public startNativeFileDrag(webContents: WebContents, filePath: string): void {
    try {
      if (!filePath || !fs.existsSync(filePath)) return;
      const icon = nativeImage.createFromDataURL(DRAG_ICON_DATA_URL);
      webContents.startDrag({
        file: filePath,
        icon,
      });
    } catch {
      // Ignore if path is inaccessible
    }
  }
}
