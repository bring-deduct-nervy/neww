import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDashboardAnalytics, DashboardAnalytics, getGeographicDistribution } from "@/lib/api/analytics";
import { getHighRiskAreas } from "@/lib/api/flood-prediction";
import { realtimeService } from "@/lib/api/realtime-service";
import { AID_CATEGORIES, CASE_PRIORITIES, SRI_LANKA_DISTRICTS } from "@/lib/constants/dracp";
import { CasePriority, AidCategory } from "@/lib/types/dracp";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Timer,
  RefreshCw,
  Settings,
  Bell,
  Home,
  Heart,
  Shield,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardAnalytics | null>(null);
  const [highRiskAreas, setHighRiskAreas] = useState<any[]>([]);
  const [geoDistribution, setGeoDistribution] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    loadData();
    const unsubscribe = realtimeService.subscribeToDashboard((type, data) => {
      loadData(true);
    });
    return () => unsubscribe();
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [analyticsData, riskAreas, geoDist] = await Promise.all([
        getDashboardAnalytics(),
        getHighRiskAreas(),
        getGeographicDistribution()
      ]);
      setStats(analyticsData);
      setHighRiskAreas(riskAreas);
      setGeoDistribution(geoDist);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const resolutionRate = stats.totalCases > 0 ? Math.round((stats.casesResolved / stats.totalCases) * 100) : 0;

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
              <LayoutDashboard className="h-6 w-6 text-cyan-400" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Overview of disaster relief operations
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

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="Total Cases"
            value={stats.totalCases.toLocaleString()}
            change={`+${stats.newCasesToday} today`}
            color="cyan"
          />
          <MetricCard
            icon={<Activity className="h-5 w-5" />}
            label="In Progress"
            value={stats.casesInProgress.toLocaleString()}
            change={`${Math.round((stats.casesInProgress / stats.totalCases) * 100)}% of total`}
            color="yellow"
          />
          <MetricCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="Resolved"
            value={stats.casesResolved.toLocaleString()}
            change={`${resolutionRate}% resolution rate`}
            color="green"
          />
          <MetricCard
            icon={<Target className="h-5 w-5" />}
            label="SLA Compliance"
            value={`${stats.slaComplianceRate}%`}
            change="Target: 95%"
            color={stats.slaComplianceRate >= 90 ? "green" : stats.slaComplianceRate >= 80 ? "yellow" : "red"}
          />
        </div>

        {/* Priority Breakdown */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-cyan-400" />
              Cases by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CASE_PRIORITIES.map(priority => {
                const count = stats.casesByPriority[priority.id as CasePriority] || 0;
                const percentage = Math.round((count / stats.totalCases) * 100);
                
                return (
                  <div
                    key={priority.id}
                    className={cn(
                      "p-4 rounded-xl border",
                      `bg-${priority.color}-500/10 border-${priority.color}-500/30`
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-${priority.color}-400 font-medium`}>
                        {priority.label}
                      </span>
                      <Badge className={`bg-${priority.color}-500/20 text-${priority.color}-400 border-${priority.color}-500/30`}>
                        {count}
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{percentage}% of total</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Aid Distribution & Volunteers */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Aid Categories */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-cyan-400" />
                Cases by Aid Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {AID_CATEGORIES.slice(0, 6).map(category => {
                  const count = stats.casesByCategory[category.id as AidCategory] || 0;
                  const percentage = Math.round((count / stats.totalCases) * 100);
                  
                  return (
                    <div key={category.id} className="flex items-center gap-3">
                      <span className="text-xl">{category.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{category.label}</span>
                          <span className="text-muted-foreground">{count}</span>
                        </div>
                        <Progress value={percentage} className="h-1.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Volunteer Stats */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                Volunteer Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <p className="text-3xl font-bold text-cyan-400">{stats.totalVolunteers}</p>
                  <p className="text-xs text-muted-foreground">Total Volunteers</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <p className="text-3xl font-bold text-green-400">{stats.activeVolunteers}</p>
                  <p className="text-xs text-muted-foreground">Active Now</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Active Rate</span>
                  <span className="text-green-400">
                    {Math.round((stats.activeVolunteers / stats.totalVolunteers) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(stats.activeVolunteers / stats.totalVolunteers) * 100} 
                  className="h-2" 
                />
              </div>

              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium">Performance</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Avg Response</p>
                    <p className="font-medium">25 min</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Resolution</p>
                    <p className="font-medium">{stats.averageResolutionTime}h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Cases by District
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(stats.casesByDistrict)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([district, count], index) => (
                  <motion.div
                    key={district}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-3 rounded-xl border text-center",
                      index === 0 ? "bg-red-500/10 border-red-500/30" :
                      index < 3 ? "bg-orange-500/10 border-orange-500/30" :
                      "bg-white/5 border-white/10"
                    )}
                  >
                    <p className="font-medium text-sm">{district}</p>
                    <p className={cn(
                      "text-xl font-bold",
                      index === 0 ? "text-red-400" :
                      index < 3 ? "text-orange-400" :
                      "text-cyan-400"
                    )}>
                      {count}
                    </p>
                    <p className="text-xs text-muted-foreground">cases</p>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Aid Distribution Summary */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Cases by Aid Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {AID_CATEGORIES.map((category, index) => {
                const count = stats.casesByCategory[category.id] || 0;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-cyan-500/20"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-medium">{category.label}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cases</span>
                        <span className="font-bold">{count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Percentage</span>
                        <span className="font-bold text-green-400">{stats.totalCases > 0 ? Math.round((count / stats.totalCases) * 100) : 0}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/20">
                <ClipboardList className="h-5 w-5 text-cyan-400" />
                <span className="text-xs">View All Cases</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/20">
                <Users className="h-5 w-5 text-green-400" />
                <span className="text-xs">Manage Volunteers</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/20">
                <Package className="h-5 w-5 text-orange-400" />
                <span className="text-xs">Resource Inventory</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/20">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <span className="text-xs">Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  change, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  change: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    cyan: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    yellow: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
    red: "bg-red-500/20 border-red-500/30 text-red-400",
  };

  return (
    <Card className={cn("glass-card border", colorClasses[color])}>
      <CardContent className="p-4">
        <div className={cn("mb-2", colorClasses[color].split(' ')[2])}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs mt-1 opacity-70">{change}</p>
      </CardContent>
    </Card>
  );
}
