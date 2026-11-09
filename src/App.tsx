import React, { useEffect } from 'react';
import { DynamicIsland } from './components/DynamicIsland';
import { useIslandStore } from './store/useIslandStore';

export const App: React.FC = () => {
  const setMedia = useIslandStore((s) => s.setMedia);
  const setSystem = useIslandStore((s) => s.setSystem);
  const triggerAlert = useIslandStore((s) => s.triggerAlert);
  const timerRunning = useIslandStore((s) => s.timerRunning);
  const tickTimer = useIslandStore((s) => s.tickTimer);

  // Connect Electron IPC listeners once on mount
  useEffect(() => {
    const api = window.vnotchAPI;
    if (!api) return;

    api.getInitialState().then((init) => {
      if (init.media) setMedia(init.media);
      if (init.system) setSystem(init.system);
    });

    const unsubMedia = api.onMediaUpdate((session) => {
      setMedia(session);
    });

    const unsubSystem = api.onSystemUpdate((stats) => {
      setSystem(stats);
    });

    const unsubAlert = api.onAlertEvent((alert) => {
      triggerAlert(alert);
    });

    return () => {
      unsubMedia();
      unsubSystem();
      unsubAlert();
    };
  }, [setMedia, setSystem, triggerAlert]);

  // Run 1s interval ONLY when Live Activity Timer is actively counting down
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, tickTimer]);

  return <DynamicIsland />;
};
