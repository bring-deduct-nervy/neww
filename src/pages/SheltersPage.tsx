import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShelterCard } from "@/components/shelters/ShelterCard";
import { Shelter, ShelterStatus } from "@/lib/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabase } from "@/lib/supabase";
import { realtimeService } from "@/lib/api/realtime-service";
import { Building2, Search, Filter, MapPin, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Fallback shelters data
const fallbackShelters: Shelter[] = [
  {
    id: '1',
    name: 'Colombo Municipal School',
    type: 'SCHOOL',
    address: '123 Main Street, Colombo 07',
    district: 'Colombo',
    latitude: 6.9271,
    longitude: 79.8612,
    totalCapacity: 500,
    currentOccupancy: 320,
    availableSpace: 180,
    status: 'ACTIVE',
    facilities: {
      hasMedical: true,
      hasFood: true,
      hasWater: true,
      hasSanitation: true,
      hasElectricity: true,
      hasInternet: false,
      isAccessible: true
    },
    contact: { name: 'Mr. Silva', phone: '0112345678' },
    needs: [],
    distance: 2.5
  },
  {
    id: '2',
    name: 'Kelaniya Temple Relief Camp',
    type: 'TEMPLE',
    address: 'Temple Road, Kelaniya',
    district: 'Gampaha',
    latitude: 6.9553,
    longitude: 79.9225,
    totalCapacity: 300,
    currentOccupancy: 280,
    availableSpace: 20,
    status: 'ACTIVE',
    facilities: {
      hasMedical: false,
      hasFood: true,
      hasWater: true,
      hasSanitation: true,
      hasElectricity: true,
      hasInternet: false,
      isAccessible: false
    },
    contact: { name: 'Rev. Thero', phone: '0112987654' },
    needs: [],
    distance: 5.2
  },
  {
    id: '3',
    name: 'Gampaha Community Center',
    type: 'COMMUNITY_CENTER',
    address: 'Station Road, Gampaha',
    district: 'Gampaha',
    latitude: 7.0917,
    longitude: 79.9942,
    totalCapacity: 200,
    currentOccupancy: 200,
    availableSpace: 0,
    status: 'FULL',
    facilities: {
      hasMedical: true,
      hasFood: true,
      hasWater: true,
      hasSanitation: true,
      hasElectricity: true,
      hasInternet: true,
      isAccessible: true
    },
    contact: { name: 'Mrs. Perera', phone: '0332222333' },
    needs: [],
    distance: 8.1
  },
  {
    id: '4',
    name: 'Kalutara District Hospital Annex',
    type: 'GOVERNMENT_BUILDING',
    address: 'Hospital Road, Kalutara',
    district: 'Kalutara',
    latitude: 6.5854,
    longitude: 79.9607,
    totalCapacity: 150,
    currentOccupancy: 45,
    availableSpace: 105,
    status: 'ACTIVE',
    facilities: {
      hasMedical: true,
      hasFood: true,
      hasWater: true,
      hasSanitation: true,
      hasElectricity: true,
      hasInternet: true,
      isAccessible: true
    },
    contact: { name: 'Dr. Fernando', phone: '0342222111' },
    needs: [],
    distance: 12.3
  }
];

export function SheltersPage() {
  const { location } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ShelterStatus | 'ALL'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShelters();

    const unsubscribe = realtimeService.subscribe({
      table: 'shelters',
      callback: () => fetchShelters()
    });

    return () => unsubscribe();
  }, []);

  const fetchShelters = async () => {
    try {
      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          type: s.type || 'TEMPORARY',
          address: s.address,
          district: s.district,
          latitude: s.latitude,
          longitude: s.longitude,
          totalCapacity: s.total_capacity || 0,
          currentOccupancy: s.current_occupancy || 0,
          availableSpace: (s.total_capacity || 0) - (s.current_occupancy || 0),
          status: s.status || 'ACTIVE',
          facilities: {
            hasMedical: s.has_medical || false,
            hasFood: s.has_food || false,
            hasWater: s.has_water || false,
            hasSanitation: s.has_sanitation || false,
            hasElectricity: s.has_electricity || false,
            hasInternet: s.has_internet || false,
            isAccessible: s.is_accessible || false
          },
          contact: { name: s.contact_name || '', phone: s.contact_phone || '' },
          needs: s.needs || [],
          distance: location ? calculateDistance(location.latitude, location.longitude, s.latitude, s.longitude) : undefined
        }));
        setShelters(mapped);
      } else {
        setShelters(fallbackShelters);
      }
    } catch (err) {
      console.error('Error fetching shelters:', err);
      setShelters(fallbackShelters);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat2 || !lon2) return 0;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c * 10) / 10;
  };

  const filteredShelters = shelters
    .filter(shelter => {
      const matchesSearch = shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shelter.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shelter.district.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || shelter.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchShelters();
    setIsRefreshing(false);
  };

  const statusCounts = {
    ACTIVE: shelters.filter(s => s.status === 'ACTIVE').length,
    FULL: shelters.filter(s => s.status === 'FULL').length,
    CLOSED: shelters.filter(s => s.status === 'CLOSED').length,
  };

  const totalCapacity = shelters.reduce((sum, s) => sum + s.totalCapacity, 0);
  const totalOccupancy = shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="h-6 w-6 text-cyan-400" />
              Relief Shelters
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {shelters.length} shelters available
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">{statusCounts.ACTIVE}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{statusCounts.FULL}</p>
              <p className="text-xs text-muted-foreground">Full</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {totalCapacity - totalOccupancy}
              </p>
              <p className="text-xs text-muted-foreground">Total Spots</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shelters by name, address, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterButton
            label="All"
            isActive={statusFilter === 'ALL'}
            onClick={() => setStatusFilter('ALL')}
          />
          <FilterButton
            label="Available"
            isActive={statusFilter === 'ACTIVE'}
            onClick={() => setStatusFilter('ACTIVE')}
            color="green"
          />
          <FilterButton
            label="Full"
            isActive={statusFilter === 'FULL'}
            onClick={() => setStatusFilter('FULL')}
            color="yellow"
          />
          <FilterButton
            label="Closed"
            isActive={statusFilter === 'CLOSED'}
            onClick={() => setStatusFilter('CLOSED')}
            color="red"
          />
        </div>

        {/* Location indicator */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-cyan-400" />
            <span>Showing shelters near {location.district || 'your location'}</span>
          </div>
        )}

        {/* Shelters List */}
        <div className="space-y-4">
          {filteredShelters.length === 0 ? (
            <Card className="glass-card border-white/10">
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No shelters found matching your criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredShelters.map((shelter, index) => (
              <motion.div
                key={shelter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ShelterCard shelter={shelter} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  label,
  isActive,
  onClick,
  color
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  color?: 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`
        shrink-0 border
        ${isActive
          ? color
            ? colorClasses[color]
            : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
          : 'border-white/20 hover:bg-white/10'
        }
      `}
    >
      {label}
    </Button>
  );
}
