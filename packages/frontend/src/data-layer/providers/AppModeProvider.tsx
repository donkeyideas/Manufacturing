import { createContext, useContext, useState, type ReactNode } from 'react';

type AppMode = 'demo' | 'live';

interface AppModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isDemo: boolean;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider');
  return ctx;
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  // Default to demo mode — switch to live when authenticated with real backend
  const [mode, setMode] = useState<AppMode>(() => {
    const envMode = import.meta.env.VITE_APP_MODE;
    if (envMode === 'live') return 'live';
    return 'demo';
  });

  return (
    <AppModeContext.Provider value={{ mode, setMode, isDemo: mode === 'demo' }}>
      {children}
    </AppModeContext.Provider>
  );
}
