import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertBanner } from "@/components/ui/alert-banner";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { SOSButton } from "@/components/emergency/SOSButton";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DRACPQuickActions } from "@/components/dashboard/DRACPQuickActions";
import { EmergencyContacts } from "@/components/emergency/EmergencyContacts";
import { ShelterCard } from "@/components/shelters/ShelterCard";
import { AlertCard } from "@/components/alerts/AlertCard";
import { RiverLevels } from "@/components/river/RiverLevels";
import { CommunityReports } from "@/components/community/CommunityReports";
import { FamilySafety } from "@/components/family/FamilySafety";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useAlerts } from "@/hooks/useAlerts";
import { useShelters } from "@/hooks/useShelters";
import { Alert, Shelter } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { realtimeService } from "@/lib/api/realtime-service";
import {
  MapPin,
  AlertTriangle,
  Building2,
  ChevronRight,
  Loader2,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";


// Mock data for demonstration
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'FLOOD',
    severity: 'HIGH',
    title: 'Flood Warning - Kelani River',
    message: 'Water levels rising rapidly. Residents in low-lying areas advised to evacuate.',
    districts: ['Colombo', 'Gampaha'],
    source: 'DMC',
    startsAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: '2',
    type: 'WEATHER',
    severity: 'MEDIUM',
    title: 'Heavy Rainfall Expected',
    message: 'Heavy rainfall expected in Western and Southern provinces over the next 24 hours.',
    districts: ['Colombo', 'Kalutara', 'Galle'],
    source: 'Met Dept',
    startsAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isActive: true
  }
];

const mockShelters: Shelter[] = [
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
  }
];

export function Dashboard() {
  const navigate = useNavigate();
  const { location, isLoading: locationLoading, error: locationError } = useGeolocation();
  const { weather, floodRisk, isLoading: weatherLoading, refetch: refetchWeather } = useWeather(location);
  const { alerts, criticalAlert: hookCriticalAlert, isLoading: alertsLoading } = useAlerts(location?.district);
  const { shelters, isLoading: sheltersLoading, getNearestShelters } = useShelters(location);
  const [criticalAlert, setCriticalAlert] = useState<Alert | null>(null);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    if (hookCriticalAlert) {
      setCriticalAlert(hookCriticalAlert);
    } else if (alerts.length > 0) {
      const critical = alerts.find(a => a.severity === 'CRITICAL' || a.severity === 'HIGH');
      if (critical) {
        setCriticalAlert(critical);
      }
    }
  }, [alerts, hookCriticalAlert]);

  const handleSOSClick = (loc: { lat: number; lng: number }) => {
    navigate(`/report?lat=${loc.lat}&lng=${loc.lng}`);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Critical Alert Banner */}
      {criticalAlert && showBanner && (
        <AlertBanner
          type={criticalAlert.severity === 'CRITICAL' ? 'critical' : 'warning'}
          title={criticalAlert.title}
          message={criticalAlert.message}
          onDismiss={() => setShowBanner(false)}
          action={{
            label: "View Details",
            onClick: () => navigate('/alerts')
          }}
        />
      )}

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Location Status */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-cyan-400" />
            {locationLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : locationError ? (
              <span className="text-red-400">Location unavailable</span>
            ) : location?.district ? (
              <span>{location.district}, Sri Lanka</span>
            ) : (
              <span>Getting location...</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchWeather()}
            disabled={weatherLoading}
          >
            <RefreshCw className={`h-4 w-4 ${weatherLoading ? 'animate-spin' : ''}`} />
          </Button>
        </motion.div>

        {/* Main SOS Button */}
        <SOSButton onSOSClick={handleSOSClick} />

        {/* Quick Actions */}
        <QuickActions />

        {/* DRACP Quick Actions */}
        <DRACPQuickActions />

        {/* Weather Card */}
        {weatherLoading ? (
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : weather && floodRisk ? (
          <WeatherCard
            weather={weather}
            floodRisk={floodRisk}
            location={location?.district}
            onRefresh={refetchWeather}
            isLoading={weatherLoading}
          />
        ) : null}

        {/* Active Alerts */}
        {alerts.length > 0 && (
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" />
                  Active Alerts
                </CardTitle>
                <Badge variant="destructive">{alerts.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.slice(0, 2).map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onViewDetails={() => navigate('/alerts')}
                  />
                ))}
              </div>
              {alerts.length > 2 && (
                <Link to="/alerts">
                  <Button variant="ghost" className="w-full mt-3 text-cyan-400">
                    View All Alerts
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Nearby Shelters */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-cyan-400" />
                Nearby Shelters
              </CardTitle>
              <Link to="/shelters">
                <Button variant="ghost" size="sm" className="text-cyan-400">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getNearestShelters(2).map((shelter) => (
                <ShelterCard key={shelter.id} shelter={shelter} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* River Levels */}
        <RiverLevels compact />

        {/* Community Reports */}
        <CommunityReports />

        {/* Family Safety */}
        <FamilySafety />

        {/* Emergency Contacts */}
        <EmergencyContacts compact />
      </div>
    </div>
  );
}
