import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Location, Alert, WeatherConditions, FloodRiskAssessment } from '@/lib/types';

interface AppState {
  // Location
  location: Location | null;
  setLocation: (location: Location | null) => void;

  // Weather
  weather: WeatherConditions | null;
  setWeather: (weather: WeatherConditions | null) => void;
  floodRisk: FloodRiskAssessment | null;
  setFloodRisk: (risk: FloodRiskAssessment | null) => void;

  // Alerts
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  dismissedAlerts: string[];
  dismissAlert: (alertId: string) => void;

  // User preferences
  language: 'en' | 'si' | 'ta';
  setLanguage: (lang: 'en' | 'si' | 'ta') => void;
  
  notifications: {
    pushAlerts: boolean;
    soundAlerts: boolean;
    vibration: boolean;
    locationAlerts: boolean;
  };
  setNotifications: (notifications: Partial<AppState['notifications']>) => void;

  // Offline mode
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  lastSyncTime: Date | null;
  setLastSyncTime: (time: Date) => void;

  // User
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  userDistrict: string | null;
  setUserDistrict: (district: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Location
      location: null,
      setLocation: (location) => set({ location }),

      // Weather
      weather: null,
      setWeather: (weather) => set({ weather }),
      floodRisk: null,
      setFloodRisk: (floodRisk) => set({ floodRisk }),

      // Alerts
      alerts: [],
      setAlerts: (alerts) => set({ alerts }),
      dismissedAlerts: [],
      dismissAlert: (alertId) =>
        set((state) => ({
          dismissedAlerts: [...state.dismissedAlerts, alertId]
        })),

      // User preferences
      language: 'en',
      setLanguage: (language) => set({ language }),
      
      notifications: {
        pushAlerts: true,
        soundAlerts: true,
        vibration: true,
        locationAlerts: true
      },
      setNotifications: (notifications) =>
        set((state) => ({
          notifications: { ...state.notifications, ...notifications }
        })),

      // Offline mode
      isOffline: false,
      setIsOffline: (isOffline) => set({ isOffline }),
      lastSyncTime: null,
      setLastSyncTime: (lastSyncTime) => set({ lastSyncTime }),

      // User
      isAuthenticated: false,
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      userDistrict: null,
      setUserDistrict: (userDistrict) => set({ userDistrict })
    }),
    {
      name: 'resq-unified-storage',
      partialize: (state) => ({
        language: state.language,
        notifications: state.notifications,
        dismissedAlerts: state.dismissedAlerts,
        userDistrict: state.userDistrict
      })
    }
  )
);
