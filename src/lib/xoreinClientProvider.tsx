import React, { createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { readShellRuntimeData, subscribeShellRuntimeData } from '@/data';
import { refreshRuntimeSnapshot, subscribeRuntimeEvents } from '@/lib/xoreinControl';
import type { XoreinRuntimeSnapshot } from '@/types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 0, retry: 1 },
  },
});

const XoreinRuntimeContext = createContext<XoreinRuntimeSnapshot | null>(null);

function XoreinRuntimeProvider({ children }: { children: React.ReactNode }) {
  const shellData = useSyncExternalStore(subscribeShellRuntimeData, readShellRuntimeData, readShellRuntimeData);
  const snapshot = shellData.runtimeSnapshot;
  const endpoint = snapshot?.control_endpoint?.trim() || snapshot?.settings?.control_endpoint?.trim() || '';

  useEffect(() => {
    if (!endpoint) {
      return;
    }
    return subscribeRuntimeEvents(snapshot, () => {
      refreshRuntimeSnapshot(snapshot, undefined);
    });
  // Re-subscribe only when the endpoint changes (not the whole snapshot object).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return (
    <XoreinRuntimeContext.Provider value={snapshot}>
      {children}
    </XoreinRuntimeContext.Provider>
  );
}

export function useRuntimeSnapshot(): XoreinRuntimeSnapshot | null {
  return useContext(XoreinRuntimeContext);
}

export function XoreinAppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <XoreinRuntimeProvider>
        {children}
      </XoreinRuntimeProvider>
    </QueryClientProvider>
  );
}
