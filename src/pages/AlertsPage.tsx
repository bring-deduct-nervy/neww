import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCard } from "@/components/alerts/AlertCard";
import { Alert, SeverityLevel } from "@/lib/types";
import { AlertTriangle, Bell, Filter, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

// Mock alerts data
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'FLOOD',
    severity: 'CRITICAL',
    title: 'Severe Flood Warning - Kelani River',
    message: 'Water levels have exceeded danger levels. Immediate evacuation required for residents in Kaduwela, Malwana, and surrounding areas. Emergency shelters are open.',
    districts: ['Colombo', 'Gampaha'],
    source: 'Disaster Management Centre',
    startsAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: '2',
    type: 'WEATHER',
    severity: 'HIGH',
    title: 'Heavy Rainfall Alert',
    message: 'Heavy rainfall expected in Western, Southern, and Sabaragamuwa provinces. Rainfall may exceed 150mm in some areas over the next 24 hours.',
    districts: ['Colombo', 'Kalutara', 'Galle', 'Ratnapura'],
    source: 'Meteorological Department',
    startsAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: '3',
    type: 'LANDSLIDE',
    severity: 'HIGH',
    title: 'Landslide Risk - Hill Country',
    message: 'High risk of landslides in Nuwara Eliya, Badulla, and Kegalle districts due to soil saturation. Residents in vulnerable areas should remain vigilant.',
    districts: ['Nuwara Eliya', 'Badulla', 'Kegalle'],
    source: 'NBRO',
    startsAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: '4',
    type: 'DAM',
    severity: 'MEDIUM',
    title: 'Dam Water Release - Castlereagh',
    message: 'Scheduled water release from Castlereagh reservoir. Downstream areas may experience increased water levels.',
    districts: ['Nuwara Eliya'],
    source: 'CEB',
    startsAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: '5',
    type: 'ROAD_CLOSURE',
    severity: 'LOW',
    title: 'Road Closure - A4 Highway',
    message: 'A4 highway closed between Ratnapura and Balangoda due to flooding. Alternative routes available via Embilipitiya.',
    districts: ['Ratnapura'],
    source: 'RDA',
    startsAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isActive: true
  }
];

export function AlertsPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'ALL'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredAlerts = selectedSeverity === 'ALL'
    ? mockAlerts
    : mockAlerts.filter(a => a.severity === selectedSeverity);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const severityCounts = {
    CRITICAL: mockAlerts.filter(a => a.severity === 'CRITICAL').length,
    HIGH: mockAlerts.filter(a => a.severity === 'HIGH').length,
    MEDIUM: mockAlerts.filter(a => a.severity === 'MEDIUM').length,
    LOW: mockAlerts.filter(a => a.severity === 'LOW').length,
  };

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
              <Bell className="h-6 w-6 text-cyan-400" />
              Active Alerts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mockAlerts.length} active alerts in your area
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

        {/* Severity Summary */}
        <div className="grid grid-cols-4 gap-3">
          <SeverityCard
            severity="CRITICAL"
            count={severityCounts.CRITICAL}
            isSelected={selectedSeverity === 'CRITICAL'}
            onClick={() => setSelectedSeverity(selectedSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          />
          <SeverityCard
            severity="HIGH"
            count={severityCounts.HIGH}
            isSelected={selectedSeverity === 'HIGH'}
            onClick={() => setSelectedSeverity(selectedSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
          />
          <SeverityCard
            severity="MEDIUM"
            count={severityCounts.MEDIUM}
            isSelected={selectedSeverity === 'MEDIUM'}
            onClick={() => setSelectedSeverity(selectedSeverity === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          />
          <SeverityCard
            severity="LOW"
            count={severityCounts.LOW}
            isSelected={selectedSeverity === 'LOW'}
            onClick={() => setSelectedSeverity(selectedSeverity === 'LOW' ? 'ALL' : 'LOW')}
          />
        </div>

        {/* Filter indicator */}
        {selectedSeverity !== 'ALL' && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Showing {selectedSeverity.toLowerCase()} severity alerts
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSeverity('ALL')}
              className="text-cyan-400 h-auto py-1"
            >
              Clear filter
            </Button>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <Card className="glass-card border-white/10">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No alerts matching your filter</p>
              </CardContent>
            </Card>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AlertCard alert={alert} />
              </motion.div>
            ))
          )}
        </div>

        {/* Alert Settings */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Alert Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive alerts on your device</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sound Alerts</p>
                  <p className="text-sm text-muted-foreground">Play sound for critical alerts</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Location-based Alerts</p>
                  <p className="text-sm text-muted-foreground">Only show alerts for your area</p>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SeverityCard({
  severity,
  count,
  isSelected,
  onClick
}: {
  severity: SeverityLevel;
  count: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const colors = {
    CRITICAL: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
    HIGH: { bg: 'bg-orange-500/20', border: 'border-orange-500/30', text: 'text-orange-400' },
    MEDIUM: { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' },
    LOW: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400' },
  };

  const color = colors[severity];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-3 rounded-xl border text-center transition-all
        ${color.bg} ${color.border}
        ${isSelected ? 'ring-2 ring-white/30' : ''}
      `}
    >
      <p className={`text-2xl font-bold ${color.text}`}>{count}</p>
      <p className="text-xs text-muted-foreground capitalize">{severity.toLowerCase()}</p>
    </motion.button>
  );
}
