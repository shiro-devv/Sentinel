import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type MapStyle = 'dark' | 'light' | 'satellite' | 'terrain';

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  mapStyle: MapStyle;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  playAlertSound: (severity: string) => void;
}

const defaultSettings: Settings = {
  darkMode: true,
  notifications: true,
  soundEnabled: true,
  autoRefresh: true,
  refreshInterval: 30,
  mapStyle: 'dark',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

// Audio context for generating sounds
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioContext;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.log('Audio not available');
  }
};

const playAlertSoundEffect = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      // Urgent descending tone
      playTone(880, 0.15, 'square');
      setTimeout(() => playTone(660, 0.15, 'square'), 150);
      setTimeout(() => playTone(440, 0.2, 'square'), 300);
      break;
    case 'HIGH':
      // Warning double beep
      playTone(660, 0.1, 'triangle');
      setTimeout(() => playTone(660, 0.1, 'triangle'), 150);
      break;
    case 'MEDIUM':
      // Single medium beep
      playTone(523, 0.15, 'sine');
      break;
    case 'LOW':
      // Soft low beep
      playTone(392, 0.1, 'sine');
      break;
    default:
      playTone(440, 0.1, 'sine');
  }
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sentinel-settings');
      if (saved) {
        try {
          return { ...defaultSettings, ...JSON.parse(saved) };
        } catch (e) {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  // Save to localStorage when settings change
  useEffect(() => {
    localStorage.setItem('sentinel-settings', JSON.stringify(settings));
  }, [settings]);

  // Apply dark/light mode to document
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('light-mode');
    }
  }, [settings.darkMode]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const playAlertSound = (severity: string) => {
    if (settings.soundEnabled) {
      playAlertSoundEffect(severity);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, playAlertSound }}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
