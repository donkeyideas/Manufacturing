import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { IndustryType, IndustryProfile } from '@erp/shared';
import { getIndustryProfile } from '@erp/shared';

type AppMode = 'demo' | 'live';

interface AppModeContextValue {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  isDemo: boolean;
  industryType: IndustryType;
  setIndustryType: (type: IndustryType) => void;
  industryProfile: IndustryProfile;
}

const AppModeContext = createContext<AppModeContextValue | null>(null);

export function useAppMode() {
  const ctx = useContext(AppModeContext);
  if (!ctx) throw new Error('useAppMode must be used within AppModeProvider');
  return ctx;
}

export function useIndustry() {
  const { industryType, setIndustryType, industryProfile } = useAppMode();
  return { industryType, setIndustryType, industryProfile };
}

const STORAGE_KEY = 'erp-demo-industry';

function getInitialIndustry(): IndustryType {
  // Check URL param first
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlIndustry = params.get('industry');
    if (urlIndustry) return urlIndustry as IndustryType;
  }
  // Then localStorage
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored as IndustryType;
  }
  return 'general-manufacturing';
}

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>(() => {
    // Demo code access overrides env mode
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('force_demo') === 'true') {
      return 'demo';
    }
    const envMode = import.meta.env.VITE_APP_MODE;
    if (envMode === 'live') return 'live';
    return 'demo';
  });

  const [industryType, setIndustryTypeRaw] = useState<IndustryType>(getInitialIndustry);

  const setIndustryType = (type: IndustryType) => {
    setIndustryTypeRaw(type);
    try { localStorage.setItem(STORAGE_KEY, type); } catch {}
  };

  const industryProfile = useMemo(() => getIndustryProfile(industryType), [industryType]);

  return (
    <AppModeContext.Provider value={{ mode, setMode, isDemo: mode === 'demo', industryType, setIndustryType, industryProfile }}>
      {children}
    </AppModeContext.Provider>
  );
}
