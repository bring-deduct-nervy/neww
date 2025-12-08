import { useState, useEffect, useCallback } from 'react';
import { Shelter, ShelterStatus, Location } from '@/lib/types';
import { calculateDistance } from '@/lib/api/geocoding';
import { supabase } from '@/lib/supabase';

interface UseSheltersReturn {
  shelters: Shelter[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  filterByStatus: (status: ShelterStatus | 'ALL') => Shelter[];
  filterByDistrict: (district: string) => Shelter[];
  getNearestShelters: (count?: number) => Shelter[];
}

export function useShelters(userLocation: Location | null): UseSheltersReturn {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShelters = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('shelters')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      let sheltersWithDistance = (data || []).map(shelter => {
        let distance = 0;
        if (userLocation && shelter.latitude && shelter.longitude) {
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            shelter.latitude,
            shelter.longitude
          );
        }
        return {
          id: shelter.id,
          name: shelter.name,
          type: shelter.type,
          address: shelter.address,
          district: shelter.district,
          latitude: shelter.latitude,
          longitude: shelter.longitude,
          totalCapacity: shelter.total_capacity,
          currentOccupancy: shelter.current_occupancy,
          availableSpace: shelter.total_capacity - shelter.current_occupancy,
          status: shelter.status as ShelterStatus,
          facilities: {
            hasMedical: shelter.has_medical,
            hasFood: shelter.has_food,
            hasWater: shelter.has_water,
            hasSanitation: shelter.has_sanitation,
            hasElectricity: shelter.has_electricity,
            hasInternet: shelter.has_internet,
            isAccessible: shelter.is_accessible
          },
          contact: {
            name: shelter.contact_name || '',
            phone: shelter.contact_phone || ''
          },
          needs: shelter.needs || [],
          distance
        };
      });

      // Sort by distance
      sheltersWithDistance.sort((a, b) => a.distance - b.distance);

      setShelters(sheltersWithDistance);
    } catch (err) {
      setError('Failed to fetch shelters');
      console.error('Error fetching shelters:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    fetchShelters();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('shelters_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shelters' },
        () => fetchShelters()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchShelters]);

  const filterByStatus = (status: ShelterStatus | 'ALL') => {
    if (status === 'ALL') return shelters;
    return shelters.filter(shelter => shelter.status === status);
  };

  const filterByDistrict = (district: string) => {
    return shelters.filter(shelter => shelter.district === district);
  };

  const getNearestShelters = (count: number = 5) => {
    return shelters.slice(0, count);
  };

  return {
    shelters,
    isLoading,
    error,
    refetch: fetchShelters,
    filterByStatus,
    filterByDistrict,
    getNearestShelters
  };
}
