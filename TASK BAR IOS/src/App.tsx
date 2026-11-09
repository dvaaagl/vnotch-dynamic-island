import React, { useEffect } from 'react';
import { MacDock } from './components/MacDock';
import { useDockStore } from './store/useDockStore';

export const App: React.FC = () => {
  const setRunningApps = useDockStore((s) => s.setRunningApps);
  const setSystemStatus = useDockStore((s) => s.setSystemStatus);

  useEffect(() => {
    const api = window.dockAPI;
    if (!api) return;

    api.getInitialData().then((data) => {
      if (data.runningApps) setRunningApps(data.runningApps);
      if (data.systemStatus) setSystemStatus(data.systemStatus);
    });

    const unsubApps = api.onRunningAppsUpdate((apps) => {
      setRunningApps(apps);
    });

    const unsubStatus = api.onSystemStatusUpdate((status) => {
      setSystemStatus(status);
    });

    return () => {
      unsubApps();
      unsubStatus();
    };
  }, [setRunningApps, setSystemStatus]);

  return <MacDock />;
};
