import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGeolocation } from "@/hooks/useGeolocation";
import { EmergencyReport, Shelter, Alert, SeverityLevel } from "@/lib/types";
import { SEVERITY_CONFIG, SHELTER_STATUS_CONFIG } from "@/lib/constants";
import {
  Map,
  Layers,
  Navigation,
  AlertTriangle,
  Building2,
  Users,
  Waves,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Locate,
  Filter,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock data for map markers
const mockEmergencies: EmergencyReport[] = [
  {
    id: '1',
    category: 'FLOOD_TRAPPED',
    severity: 'CRITICAL',
    title: 'Family trapped on rooftop',
    description: '5 people including 2 children trapped on rooftop due to rising water levels',
    latitude: 6.9271,
    longitude: 79.8612,
    address: 'Colombo 07',
    district: 'Colombo',
    peopleAffected: 5,
    hasChildren: true,
    hasElderly: false,
    hasDisabled: false,
    hasMedicalNeeds: false,
    contactName: 'Mr. Perera',
    contactPhone: '0771234567',
    isAnonymous: false,
    images: [],
    status: 'PENDING',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: '2',
    category: 'MEDICAL',
    severity: 'HIGH',
    title: 'Elderly person needs medical attention',
    description: 'Elderly diabetic patient running out of insulin',
    latitude: 6.9350,
    longitude: 79.8500,
    address: 'Wellawatte',
    district: 'Colombo',
    peopleAffected: 1,
    hasChildren: false,
    hasElderly: true,
    hasDisabled: false,
    hasMedicalNeeds: true,
    contactName: 'Mrs. Silva',
    contactPhone: '0779876543',
    isAnonymous: false,
    images: [],
    status: 'ASSIGNED',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    id: '3',
    category: 'SUPPLIES',
    severity: 'MEDIUM',
    title: 'Food and water needed',
    description: '15 families need food and drinking water',
    latitude: 6.9100,
    longitude: 79.8800,
    address: 'Dehiwala',
    district: 'Colombo',
    peopleAffected: 45,
    hasChildren: true,
    hasElderly: true,
    hasDisabled: false,
    hasMedicalNeeds: false,
    contactName: 'Community Leader',
    contactPhone: '0712345678',
    isAnonymous: false,
    images: [],
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
];

const mockShelters: Shelter[] = [
  {
    id: '1',
    name: 'Colombo Municipal School',
    type: 'SCHOOL',
    address: '123 Main Street, Colombo 07',
    district: 'Colombo',
    latitude: 6.9200,
    longitude: 79.8550,
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
  }
];

const floodZones = [
  { id: '1', name: 'Kelani River Basin', severity: 'HIGH' as SeverityLevel, lat: 6.9400, lng: 79.8900, radius: 3 },
  { id: '2', name: 'Wellawatte Low-lying Area', severity: 'MEDIUM' as SeverityLevel, lat: 6.8800, lng: 79.8600, radius: 2 },
];

const categoryIcons: Record<string, string> = {
  FLOOD_TRAPPED: '🌊',
  MEDICAL: '🚑',
  RESCUE: '🚁',
  SUPPLIES: '📦',
  INFRASTRUCTURE: '🏚️',
  FIRE: '🔥',
  LANDSLIDE: '⛰️',
  OTHER: '⚠️'
};

export function MapPage() {
  const { location, getLocation, isLoading: locationLoading } = useGeolocation();
  const [selectedMarker, setSelectedMarker] = useState<EmergencyReport | Shelter | null>(null);
  const [activeLayer, setActiveLayer] = useState<'all' | 'emergencies' | 'shelters' | 'flood'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [zoom, setZoom] = useState(12);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleLocate = async () => {
    await getLocation();
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Map className="h-6 w-6 text-cyan-400" />
              Crisis Map
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time emergency and shelter locations
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

        {/* Layer Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <LayerButton
            icon={<Layers className="h-4 w-4" />}
            label="All"
            isActive={activeLayer === 'all'}
            onClick={() => setActiveLayer('all')}
          />
          <LayerButton
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Emergencies"
            isActive={activeLayer === 'emergencies'}
            onClick={() => setActiveLayer('emergencies')}
            count={mockEmergencies.length}
            color="red"
          />
          <LayerButton
            icon={<Building2 className="h-4 w-4" />}
            label="Shelters"
            isActive={activeLayer === 'shelters'}
            onClick={() => setActiveLayer('shelters')}
            count={mockShelters.length}
            color="green"
          />
          <LayerButton
            icon={<Waves className="h-4 w-4" />}
            label="Flood Zones"
            isActive={activeLayer === 'flood'}
            onClick={() => setActiveLayer('flood')}
            count={floodZones.length}
            color="blue"
          />
        </div>

        {/* Map Container */}
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="relative h-[400px] md:h-[500px] bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Simulated Map Background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300C7BE' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(z => Math.min(z + 1, 18))}
                className="bg-background/80 backdrop-blur border-white/20"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setZoom(z => Math.max(z - 1, 8))}
                className="bg-background/80 backdrop-blur border-white/20"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLocate}
                disabled={locationLoading}
                className="bg-background/80 backdrop-blur border-white/20"
              >
                <Locate className={`h-4 w-4 ${locationLoading ? 'animate-pulse' : ''}`} />
              </Button>
            </div>

            {/* Flood Zones (Background) */}
            {(activeLayer === 'all' || activeLayer === 'flood') && floodZones.map((zone) => (
              <motion.div
                key={zone.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.3 }}
                className={cn(
                  "absolute rounded-full",
                  zone.severity === 'HIGH' ? 'bg-red-500' :
                  zone.severity === 'MEDIUM' ? 'bg-orange-500' : 'bg-yellow-500'
                )}
                style={{
                  width: `${zone.radius * 40}px`,
                  height: `${zone.radius * 40}px`,
                  left: `${30 + (zone.lng - 79.85) * 500}%`,
                  top: `${50 - (zone.lat - 6.92) * 500}%`,
                  transform: 'translate(-50%, -50%)',
                  filter: 'blur(20px)'
                }}
              />
            ))}

            {/* Emergency Markers */}
            {(activeLayer === 'all' || activeLayer === 'emergencies') && mockEmergencies.map((emergency, index) => (
              <motion.button
                key={emergency.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedMarker(emergency)}
                className={cn(
                  "absolute z-20 flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110",
                  emergency.severity === 'CRITICAL' && "bg-red-600 animate-pulse",
                  emergency.severity === 'HIGH' && "bg-orange-500",
                  emergency.severity === 'MEDIUM' && "bg-yellow-500",
                  emergency.severity === 'LOW' && "bg-green-500"
                )}
                style={{
                  left: `${30 + (emergency.longitude - 79.85) * 500}%`,
                  top: `${50 - (emergency.latitude - 6.92) * 500}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span className="text-lg">{categoryIcons[emergency.category]}</span>
              </motion.button>
            ))}

            {/* Shelter Markers */}
            {(activeLayer === 'all' || activeLayer === 'shelters') && mockShelters.map((shelter, index) => (
              <motion.button
                key={shelter.id}
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                onClick={() => setSelectedMarker(shelter)}
                className={cn(
                  "absolute z-20 flex items-center justify-center w-9 h-9 rounded-lg border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-110",
                  shelter.status === 'ACTIVE' && "bg-green-600",
                  shelter.status === 'FULL' && "bg-yellow-600",
                  shelter.status === 'CLOSED' && "bg-red-600"
                )}
                style={{
                  left: `${30 + (shelter.longitude - 79.85) * 500}%`,
                  top: `${50 - (shelter.latitude - 6.92) * 500}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <span className="text-lg">🏕️</span>
              </motion.button>
            ))}

            {/* User Location */}
            {location && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute z-30 w-4 h-4 bg-cyan-500 rounded-full border-2 border-white shadow-lg"
                style={{
                  left: `${30 + (location.longitude - 79.85) * 500}%`,
                  top: `${50 - (location.latitude - 6.92) * 500}%`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 20px rgba(0, 199, 190, 0.5)'
                }}
              >
                <div className="absolute inset-0 bg-cyan-500 rounded-full animate-ping opacity-50" />
              </motion.div>
            )}

            {/* Zoom Level Indicator */}
            <div className="absolute bottom-4 left-4 px-2 py-1 bg-background/80 backdrop-blur rounded text-xs text-muted-foreground">
              Zoom: {zoom}x
            </div>
          </div>
        </Card>

        {/* Selected Marker Details */}
        <AnimatePresence>
          {selectedMarker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Card className="glass-card border-white/10">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {'category' in selectedMarker ? (
                        <>
                          <span className="text-2xl">{categoryIcons[selectedMarker.category]}</span>
                          <div>
                            <CardTitle className="text-lg">{selectedMarker.title}</CardTitle>
                            <Badge className={cn("mt-1", SEVERITY_CONFIG[selectedMarker.severity].bgColor, SEVERITY_CONFIG[selectedMarker.severity].textColor)}>
                              {selectedMarker.severity}
                            </Badge>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">🏕️</span>
                          <div>
                            <CardTitle className="text-lg">{selectedMarker.name}</CardTitle>
                            <Badge className={cn("mt-1", SHELTER_STATUS_CONFIG[selectedMarker.status].color, "text-white")}>
                              {SHELTER_STATUS_CONFIG[selectedMarker.status].label}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedMarker(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {'category' in selectedMarker ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{selectedMarker.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-cyan-400" />
                          {selectedMarker.peopleAffected} affected
                        </span>
                        <span className="text-muted-foreground">{selectedMarker.address}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-500">
                          <Navigation className="h-4 w-4 mr-1" />
                          Navigate
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 border-white/20">
                          Volunteer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">{selectedMarker.address}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-cyan-400" />
                          {selectedMarker.availableSpace} spots available
                        </span>
                        <span className="text-muted-foreground">
                          {selectedMarker.currentOccupancy}/{selectedMarker.totalCapacity} capacity
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-500">
                          <Navigation className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-white/20"
                          onClick={() => selectedMarker.contact?.phone && (window.location.href = `tel:${selectedMarker.contact.phone}`)}
                        >
                          Call
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Map Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-red-600 animate-pulse" />
                <span>Critical Emergency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <span>High Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-green-600" />
                <span>Active Shelter</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-cyan-500" style={{ boxShadow: '0 0 10px rgba(0, 199, 190, 0.5)' }} />
                <span>Your Location</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LayerButton({
  icon,
  label,
  isActive,
  onClick,
  count,
  color
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
  color?: 'red' | 'green' | 'blue';
}) {
  const colorClasses = {
    red: 'bg-red-500/20 border-red-500/30 text-red-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "shrink-0 gap-2",
        isActive
          ? color
            ? colorClasses[color]
            : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
          : "border-white/20 hover:bg-white/10"
      )}
    >
      {icon}
      {label}
      {count !== undefined && (
        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
          {count}
        </Badge>
      )}
    </Button>
  );
}
