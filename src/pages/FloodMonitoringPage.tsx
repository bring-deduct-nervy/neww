import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  getFloodStations,
  getFloodAlerts,
  getFloodDashboardStats,
  searchFloodStations,
  getStationsByDistrict,
  getFloodRivers,
  getFloodBasins,
  getAlertLevelColor,
  getAlertDescription,
  getAlertRecommendation,
  Station,
  FloodAlert,
  RiverData,
  BasinData
} from "@/lib/api/flood-monitor";
import {
  AlertTriangle,
  Droplet,
  Waves,
  Map,
  TrendingUp,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Activity,
  Filter,
  Download,
  RefreshCw,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardStats {
  stations: {
    total: number;
    at_risk: number;
    warning: number;
  };
  rivers: number;
  basins: number;
  alerts: {
    total: number;
    critical: number;
    danger: number;
    warning: number;
  };
  affected_districts: number;
  last_updated: string;
}

export function FloodMonitoringPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [stations, setStations] = useState<Station[]>([]);
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [rivers, setRivers] = useState<RiverData[]>([]);
  const [basins, setBasins] = useState<BasinData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);

  useEffect(() => {
    loadData();
    // Refresh data every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterStations();
  }, [stations, searchQuery, filterDistrict]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [stationsData, alertsData, statsData, riversData, basinsData] = await Promise.all([
        getFloodStations(),
        getFloodAlerts(),
        getFloodDashboardStats(),
        getFloodRivers(),
        getFloodBasins()
      ]);

      setStations(stationsData);
      setAlerts(alertsData);
      setStats(statsData);
      setRivers(riversData);
      setBasins(basinsData);
    } catch (error) {
      console.error("Error loading flood data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStations = async () => {
    let filtered = stations;

    if (searchQuery) {
      filtered = await searchFloodStations(searchQuery);
    } else if (filterDistrict) {
      filtered = await getStationsByDistrict(filterDistrict);
    }

    setFilteredStations(filtered);
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "danger":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
  };

  const getAlertBgColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 border-red-500/30";
      case "danger":
        return "bg-orange-500/10 border-orange-500/30";
      case "warning":
        return "bg-yellow-500/10 border-yellow-500/30";
      default:
        return "bg-green-500/10 border-green-500/30";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const uniqueDistricts = [...new Set(stations.map(s => s.district))].sort();

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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Waves className="h-8 w-8 text-cyan-400" />
              Sri Lanka Flood Monitor
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time water level monitoring and flood alerts
            </p>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            className="border-white/20"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card border-white/10 p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Stations</p>
                  <p className="text-2xl font-bold mt-1">{stats.stations.total}</p>
                </div>
                <Droplet className="h-8 w-8 text-cyan-400 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card border-white/10 p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">At Risk</p>
                  <p className="text-2xl font-bold mt-1 text-red-400">{stats.stations.at_risk}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-400 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-card border-white/10 p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Alerts</p>
                  <p className="text-2xl font-bold mt-1 text-orange-400">{stats.alerts.total}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-400 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-card border-white/10 p-6 rounded-xl"
            >
            <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Rivers</p>
                  <p className="text-2xl font-bold mt-1">{stats.rivers}</p>
                </div>
                <Waves className="h-8 w-8 text-blue-400 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-card border-white/10 p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Affected Districts</p>
                  <p className="text-2xl font-bold mt-1">{stats.affected_districts}</p>
                </div>
                <Map className="h-8 w-8 text-purple-400 opacity-50" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="stations">Stations</TabsTrigger>
            <TabsTrigger value="rivers">Rivers</TabsTrigger>
            <TabsTrigger value="basins">Basins</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-400">{stats?.alerts.critical || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Water levels exceeded danger threshold
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <AlertCircle className="h-5 w-5 text-orange-400" />
                    Danger Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-400">{stats?.alerts.danger || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Approaching danger levels
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-yellow-400" />
                    Warning Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-400">{stats?.alerts.warning || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Water levels elevated
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Active Flood Alerts</CardTitle>
                <CardDescription>
                  {alerts.length} alert{alerts.length !== 1 ? "s" : ""} active
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">No active flood alerts</p>
                  </div>
                ) : (
                  alerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "p-4 rounded-lg border space-y-2",
                        getAlertBgColor(alert.alert_type)
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getAlertIcon(alert.alert_type)}
                          <div className="flex-1">
                            <p className="font-semibold">{alert.station_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {alert.river_name} • {alert.district}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "ml-2",
                            alert.alert_type === "critical"
                              ? "bg-red-500/20 text-red-400"
                              : alert.alert_type === "danger"
                              ? "bg-orange-500/20 text-orange-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          )}
                        >
                          {alert.alert_type.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Level: {alert.level}m</span>
                        <span className="text-muted-foreground">{alert.percentage}% of danger</span>
                      </div>

                      <p className="text-sm py-2 border-t border-white/10 pt-2">
                        {getAlertDescription(alert.level, 0, alert.level / (alert.percentage / 100))}
                      </p>

                      <div className="bg-black/30 p-3 rounded text-sm border border-white/10">
                        <p className="font-semibold mb-1">Recommendation:</p>
                        <p className="text-muted-foreground">
                          {getAlertRecommendation(
                            alert.alert_type === "critical"
                              ? "critical"
                              : alert.alert_type === "danger"
                              ? "danger"
                              : "warning"
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stations Tab */}
          <TabsContent value="stations" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Gauging Stations</CardTitle>
                <CardDescription>
                  Monitor water levels at {stations.length} stations across Sri Lanka
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search stations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20"
                    />
                  </div>
                  <select
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  >
                    <option value="">All Districts</option>
                    {uniqueDistricts.map(district => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stations List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredStations.length === 0 ? (
                    <div className="p-8 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground">No stations found</p>
                    </div>
                  ) : (
                    filteredStations.map((station, index) => (
                      <motion.div
                        key={station.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{station.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {station.river} • {station.district}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              station.alert_level === "danger"
                                ? "bg-red-500/20 text-red-400"
                                : station.alert_level === "warning"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                            )}
                          >
                            {station.alert_level?.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Current</p>
                            <p className="font-semibold">{station.current_level?.toFixed(2)}m</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Normal</p>
                            <p className="font-semibold text-green-400">{station.normal_level?.toFixed(2)}m</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Warning</p>
                            <p className="font-semibold text-yellow-400">{station.warning_level?.toFixed(2)}m</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Danger</p>
                            <p className="font-semibold text-red-400">{station.danger_level?.toFixed(2)}m</p>
                          </div>
                        </div>

                        {station.last_updated && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground pt-2 border-t border-white/10">
                            <Clock className="h-3 w-3" />
                            Updated {new Date(station.last_updated).toLocaleTimeString()}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rivers Tab */}
          <TabsContent value="rivers" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Rivers Overview</CardTitle>
                <CardDescription>
                  {rivers.length} rivers monitored across Sri Lanka
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rivers.map((river, index) => (
                    <motion.div
                      key={river.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{river.name}</p>
                          <p className="text-sm text-muted-foreground">{river.district}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            river.alert_level === "danger"
                              ? "bg-red-500/20 text-red-400"
                              : river.alert_level === "warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          )}
                        >
                          {river.alert_level?.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stations:</span>
                          <span className="font-semibold">{river.stations_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Basin:</span>
                          <span className="font-semibold">{river.basin}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Basins Tab */}
          <TabsContent value="basins" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>Drainage Basins</CardTitle>
                <CardDescription>
                  {basins.length} basins monitored
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {basins.map((basin, index) => (
                    <motion.div
                      key={basin.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{basin.name}</p>
                          <p className="text-sm text-muted-foreground">{basin.district}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            basin.alert_level === "danger"
                              ? "bg-red-500/20 text-red-400"
                              : basin.alert_level === "warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                          )}
                        >
                          {basin.alert_level?.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Area:</span>
                          <span className="font-semibold">{basin.area.toLocaleString()} km²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rivers:</span>
                          <span className="font-semibold">{basin.rivers_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stations:</span>
                          <span className="font-semibold">{basin.stations_count}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
