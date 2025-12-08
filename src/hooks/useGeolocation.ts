import { useState, useEffect, useCallback } from 'react';
import { Location } from '@/lib/types';

interface UseGeolocationReturn {
  location: Location | null;
  error: string | null;
  isLoading: boolean;
  getLocation: () => Promise<Location>;
  watchLocation: () => () => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLocation = useCallback(async (): Promise<Location> => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by your browser');
    }

    setIsLoading(true);
    setError(null);

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Try to get address from coordinates using Nominatim
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { 'User-Agent': 'ResQ-Unified-App' } }
            );
            const data = await response.json();

            const loc: Location = {
              latitude,
              longitude,
              accuracy,
              address: data.display_name,
              district: data.address?.state_district || data.address?.county
            };

            setLocation(loc);
            setIsLoading(false);
            resolve(loc);
          } catch {
            const loc: Location = { latitude, longitude, accuracy };
            setLocation(loc);
            setIsLoading(false);
            resolve(loc);
          }
        },
        (err) => {
          const errorMessage =
            err.code === 1 ? 'Location permission denied' :
            err.code === 2 ? 'Location unavailable' :
            err.code === 3 ? 'Location request timed out' :
            'Failed to get location';

          setError(errorMessage);
          setIsLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }, []);

  const watchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return () => {};
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'User-Agent': 'ResQ-Unified-App' } }
          );
          const data = await response.json();

          setLocation({
            latitude,
            longitude,
            accuracy,
            address: data.display_name,
            district: data.address?.state_district || data.address?.county
          });
        } catch {
          setLocation({ latitude, longitude, accuracy });
        }
      },
      (err) => {
        setError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    getLocation().catch(() => {});
  }, [getLocation]);

  return { location, error, isLoading, getLocation, watchLocation };
}
