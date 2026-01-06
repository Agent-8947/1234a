import { create } from 'zustand';

// Simplified store for production site (read-only + basic interactions)
interface ProductionState {
  contentBlocks: any[];
  globalSettings: any;
  currentLanguage: string;
  uiTheme: any;
  setCurrentLanguage: (lang: string) => void;
  toggleSiteTheme: () => void;
}

// Helper to get content blocks from state
const getContentBlocks = () => {
  const state = window.__DNA_STATE__;
  if (!state) return [];
  
  // Try pages.home first (new format)
  if (state.pages?.home) return state.pages.home;
  
  // Try pages[currentPage] (if currentPage is set)
  if (state.pages && state.currentPage) {
    return state.pages[state.currentPage] || [];
  }
  
  // Fallback to contentBlocks (old format)
  return state.contentBlocks || [];
};

export const useStore = create<ProductionState>((set, get) => ({
  contentBlocks: getContentBlocks(),
  globalSettings: window.__DNA_STATE__?.globalSettings || {},
  currentLanguage: window.__DNA_STATE__?.currentLanguage || window.__DNA_STATE__?.globalSettings?.GL12?.params?.[0]?.value || 'en',
  uiTheme: window.__DNA_STATE__?.uiTheme || {},
  
  // Language switcher
  setCurrentLanguage: (lang: string) => {
    set({ currentLanguage: lang });
  },
  
  // Theme toggle
  toggleSiteTheme: () => {
    const { globalSettings } = get();
    const currentMode = globalSettings['GL10']?.params[6]?.value || 'Dark';
    const newMode = currentMode === 'Light' ? 'Dark' : 'Light';
    
    // Update global settings
    if (globalSettings['GL10']) {
      globalSettings['GL10'].params[6].value = newMode;
    }
    
    // Update colors based on theme
    const isDark = newMode === 'Dark';
    if (globalSettings['GL02']) {
      globalSettings['GL02'].params[0].value = isDark ? '#1A1A1A' : '#FFFFFF';
      globalSettings['GL02'].params[1].value = isDark ? '#242424' : '#F3F4F6';
      globalSettings['GL02'].params[2].value = isDark ? '#60A5FA' : '#3B82F6';
      globalSettings['GL02'].params[3].value = isDark ? '#F9FAFB' : '#1A1A1A';
      globalSettings['GL02'].params[4].value = isDark ? '#9CA3AF' : '#6B7280';
      globalSettings['GL02'].params[5].value = isDark ? '#374151' : '#E5E7EB';
    }
    
    set({ globalSettings: { ...globalSettings } });
    
    // Update CSS variables
    const root = document.documentElement;
    root.setAttribute('data-theme', newMode.toLowerCase());
  }
}));

// Type declaration for window
declare global {
  interface Window {
    __DNA_STATE__: any;
  }
}
