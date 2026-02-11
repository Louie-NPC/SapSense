import { useCallback, useEffect, useRef, useState } from 'react';

// Sound types available in the app
export type SoundType = 'success' | 'error' | 'warning' | 'notification' | 'click';

// Volume levels
export type VolumeLevel = 0 | 0.25 | 0.5 | 0.75 | 1;

interface SoundSettings {
  enabled: boolean;
  volume: VolumeLevel;
}

// Create audio context for Web Audio API
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate different sound frequencies for different notification types
const soundFrequencies: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }[]> = {
  success: [
    { frequency: 523.25, duration: 0.1, type: 'sine' }, // C5
    { frequency: 659.25, duration: 0.1, type: 'sine' }, // E5
    { frequency: 783.99, duration: 0.15, type: 'sine' }, // G5
  ],
  error: [
    { frequency: 200, duration: 0.15, type: 'square' },
    { frequency: 150, duration: 0.2, type: 'square' },
  ],
  warning: [
    { frequency: 440, duration: 0.1, type: 'triangle' },
    { frequency: 440, duration: 0.1, type: 'triangle' },
    { frequency: 440, duration: 0.1, type: 'triangle' },
  ],
  notification: [
    { frequency: 880, duration: 0.08, type: 'sine' },
    { frequency: 1046.5, duration: 0.12, type: 'sine' },
  ],
  click: [
    { frequency: 1000, duration: 0.02, type: 'sine' },
  ],
};

// Play a single tone
const playTone = (
  ctx: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  startTime: number
): void => {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.value = frequency;

  // Fade in and out to avoid clicks
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.01);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
};

// Play a sequence of tones
const playSound = async (soundType: SoundType, volume: VolumeLevel): Promise<void> => {
  try {
    const ctx = getAudioContext();
    
    // Resume audio context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const tones = soundFrequencies[soundType];
    let currentTime = ctx.currentTime;

    for (const tone of tones) {
      playTone(ctx, tone.frequency, tone.duration, tone.type, volume, currentTime);
      currentTime += tone.duration;
    }
  } catch (error) {
    console.warn('Audio playback failed:', error);
  }
};

// Hook for managing sound settings
export const useSoundSettings = () => {
  const [settings, setSettings] = useState<SoundSettings>(() => {
    const saved = localStorage.getItem('soundSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { enabled: true, volume: 0.5 as VolumeLevel };
      }
    }
    return { enabled: true, volume: 0.5 as VolumeLevel };
  });

  const updateSettings = useCallback((newSettings: Partial<SoundSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('soundSettings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleSound = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);

  const setVolume = useCallback((volume: VolumeLevel) => {
    updateSettings({ volume });
  }, [updateSettings]);

  return {
    settings,
    toggleSound,
    setVolume,
    updateSettings,
  };
};

// Hook for playing notification sounds
export const useNotificationSound = () => {
  const settingsRef = useRef<SoundSettings>({ enabled: true, volume: 0.5 });

  // Sync with localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('soundSettings');
    if (saved) {
      try {
        settingsRef.current = JSON.parse(saved);
      } catch {
        // Keep defaults
      }
    }

    // Listen for storage changes (from other tabs/components)
    const handleStorageChange = () => {
      const saved = localStorage.getItem('soundSettings');
      if (saved) {
        try {
          settingsRef.current = JSON.parse(saved);
        } catch {
          // Keep current
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const play = useCallback((type: SoundType) => {
    // Re-read settings to ensure we have the latest
    const saved = localStorage.getItem('soundSettings');
    if (saved) {
      try {
        settingsRef.current = JSON.parse(saved);
      } catch {
        // Keep current
      }
    }

    if (settingsRef.current.enabled) {
      playSound(type, settingsRef.current.volume);
    }
  }, []);

  return {
    playSuccess: useCallback(() => play('success'), [play]),
    playError: useCallback(() => play('error'), [play]),
    playWarning: useCallback(() => play('warning'), [play]),
    playNotification: useCallback(() => play('notification'), [play]),
    playClick: useCallback(() => play('click'), [play]),
    play,
  };
};

// Export for direct usage
export { playSound };
