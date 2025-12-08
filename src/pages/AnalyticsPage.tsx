import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { AID_CATEGORIES, CASE_PRIORITIES, SRI_LANKA_DISTRICTS } from "@/lib/constants/dracp";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ClipboardList,
  Building2,
  AlertTriangle,
  MapPin,
  Calendar,
  RefreshCw,
  Download,
  Target,
  Clock,
  CheckCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [cases, beneficiaries, volunteers, shelters, alerts] = await Promise.all([
        supabase.from('cases').select('*'),
        supabase.from('beneficiaries').select('*'),
        supabase.from('volunteers').select('*'),
        supabase.from('shelters').select('*'),
        supabase.from('alerts').select('*')
      ]);

      const casesData = cases.data || [];
      const beneficiariesData = beneficiaries.data || [];
      const volunteersData = volunteers.data || [];
      const sheltersData = shelters.data || [];
      const alertsData = alerts.data || [];

      // Calculate stats
      const resolvedCases = casesData.filter(c => c.status === 'RESOLVED');
      const avgResolutionTime = resolvedCases.length > 0
        ? resolvedCases.reduce((sum, c) => {
            if (c.resolved_at && c.created_at) {
              return sum + (new Date(c.resolved_at).getTime() - new Date(c.created_at).getTime()) / (1000 * 60 * 60);
            }
            return sum;
          }, 0) / resolvedCases.length
        : 0;

      setStats({
        cases: {
          total: casesData.length,
          new: casesData.filter(c => c.status === 'NEW').length,
          inProgress: casesData.filter(c => ['ASSIGNED', 'IN_PROGRESS', 'PENDING_AID'].includes(c.status)).length,
          resolved: resolvedCases.length,
          byPriority: CASE_PRIORITIES.reduce((acc, p) => {
            acc[p.id] = casesData.filter(c => c.priority === p.id).length;
            return acc;
          }, {} as Record<string, number>),
          byCategory: AID_CATEGORIES.reduce((acc, cat) => {
            acc[cat.id] = casesData.filter(c => c.category === cat.id).length;
            return acc;
          }, {} as Record<string, number>),
          byDistrict: SRI_LANKA_DISTRICTS.reduce((acc, d) => {
            const count = casesData.filter(c => c.district === d).length;
            if (count > 0) acc[d] = count;
            return acc;
          }, {} as Record<string, number>)
        },
        beneficiaries: {
          total: beneficiariesData.length,
          totalPeople: beneficiariesData.reduce((sum, b) => sum + (b.household_size || 1), 0),
          byDistrict: SRI_LANKA_DISTRICTS.reduce((acc, d) => {
            const count = beneficiariesData.filter(b => b.district === d).length;
            if (count > 0) acc[d] = count;
            return acc;
          }, {} as Record<string, number>)
        },
        volunteers: {
          total: volunteersData.length,
          active: volunteersData.filter(v => v.status === 'ACTIVE').length,
          verified: volunteersData.filter(v => v.is_verified).length,
          avgSlaCompliance: volunteersData.length > 0
            ? volunteersData.reduce((sum, v) => sum + (v.sla_compliance_rate || 0), 0) / volunteersData.length
            : 0
        },
        shelters: {
          total: sheltersData.length,
          active: sheltersData.filter(s => s.status === 'ACTIVE').length,
          totalCapacity: sheltersData.reduce((sum, s) => sum + (s.total_capacity || 0), 0),
          totalOccupancy: sheltersData.reduce((sum, s) => sum + (s.current_occupancy || 0), 0)
        },
        alerts: {
          total: alertsData.length,
          active: alertsData.filter(a => a.is_active).length,
          critical: alertsData.filter(a => a.is_active && a.severity === 'CRITICAL').length
        },
        performance: {
          avgResolutionTime: avgResolutionTime.toFixed(1),
          resolutionRate: casesData.length > 0 ? ((resolvedCases.length / casesData.length) * 100).toFixed(1) : 0,
          slaCompliance: volunteersData.length > 0
            ? (volunteersData.reduce((sum, v) => sum + (v.sla_compliance_rate || 0), 0) / volunteersData.length).toFixed(1)
            : 0
        }
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-cyan-400" />
              Analytics Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Comprehensive overview of relief operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              disabled={isLoading}
              className="border-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="border-white/20">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="Total Cases"
            value={stats.cases.total}
            subValue={`${stats.cases.new} new`}
            color="cyan"
          />
          <MetricCard
            icon={<Users className="h-5 w-5" />}
            label="Beneficiaries"
            value={stats.beneficiaries.total}
            subValue={`${stats.beneficiaries.totalPeople} people`}
            color="green"
          />
          <MetricCard
            icon={<Users className="h-5 w-5" />}
            label="Volunteers"
            value={stats.volunteers.total}
            subValue={`${stats.volunteers.active} active`}
            color="purple"
          />
          <MetricCard
            icon={<Building2 className="h-5 w-5" />}
            label="Shelters"
            value={stats.shelters.total}
            subValue={`${stats.shelters.totalOccupancy}/${stats.shelters.totalCapacity}`}
            color="orange"
          />
        </div>

        {/* Performance Metrics */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-cyan-400" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Resolution Rate
                  </span>
                  <span className="text-green-400 font-bold">{stats.performance.resolutionRate}%</span>
                </div>
                <Progress value={parseFloat(stats.performance.resolutionRate)} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-cyan-400" />
                    SLA Compliance
                  </span>
                  <span className="text-cyan-400 font-bold">{stats.performance.slaCompliance}%</span>
                </div>
                <Progress value={parseFloat(stats.performance.slaCompliance)} className="h-3" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    Avg Resolution Time
                  </span>
                  <span className="text-yellow-400 font-bold">{stats.performance.avgResolutionTime}h</span>
                </div>
                <Progress value={Math.min(100, (24 / parseFloat(stats.performance.avgResolutionTime || '24')) * 100)} className="h-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases by Priority */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-cyan-400" />
              Cases by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CASE_PRIORITIES.map(priority => {
                const count = stats.cases.byPriority[priority.id] || 0;
                const percentage = stats.cases.total > 0 ? (count / stats.cases.total) * 100 : 0;
                return (
                  <div
                    key={priority.id}
                    className={cn(
                      "p-4 rounded-xl border",
                      priority.color === 'red' && "bg-red-500/10 border-red-500/30",
                      priority.color === 'orange' && "bg-orange-500/10 border-orange-500/30",
                      priority.color === 'yellow' && "bg-yellow-500/10 border-yellow-500/30",
                      priority.color === 'green' && "bg-green-500/10 border-green-500/30"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "font-medium",
                        priority.color === 'red' && "text-red-400",
                        priority.color === 'orange' && "text-orange-400",
                        priority.color === 'yellow' && "text-yellow-400",
                        priority.color === 'green' && "text-green-400"
                      )}>
                        {priority.label}
                      </span>
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Cases by Category */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Cases by Aid Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AID_CATEGORIES.filter(cat => stats.cases.byCategory[cat.id] > 0).map(category => {
                const count = stats.cases.byCategory[category.id] || 0;
                const percentage = stats.cases.total > 0 ? (count / stats.cases.total) * 100 : 0;
                return (
                  <div key={category.id} className="flex items-center gap-3">
                    <span className="text-2xl w-8">{category.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{category.label}</span>
                        <span className="text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-cyan-400" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(stats.cases.byDistrict)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .slice(0, 10)
                .map(([district, count], index) => (
                  <motion.div
                    key={district}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-3 rounded-xl border text-center",
                      index === 0 && "bg-red-500/10 border-red-500/30",
                      index > 0 && index < 3 && "bg-orange-500/10 border-orange-500/30",
                      index >= 3 && "bg-white/5 border-white/10"
                    )}
                  >
                    <p className="font-medium text-sm">{district}</p>
                    <p className={cn(
                      "text-xl font-bold",
                      index === 0 && "text-red-400",
                      index > 0 && index < 3 && "text-orange-400",
                      index >= 3 && "text-cyan-400"
                    )}>
                      {count as number}
                    </p>
                    <p className="text-xs text-muted-foreground">cases</p>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Summary */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-cyan-400" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white/5 text-center">
                <p className="text-3xl font-bold text-cyan-400">{stats.alerts.total}</p>
                <p className="text-xs text-muted-foreground">Total Alerts</p>
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
                <p className="text-3xl font-bold text-yellow-400">{stats.alerts.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                <p className="text-3xl font-bold text-red-400">{stats.alerts.critical}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, subValue, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: number | string; 
  subValue: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    cyan: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-400",
    orange: "bg-orange-500/20 border-orange-500/30 text-orange-400",
  };

  return (
    <Card className={cn("glass-card border", colorClasses[color])}>
      <CardContent className="p-4">
        <div className={cn("mb-2", colorClasses[color].split(' ')[2])}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xs mt-1 opacity-70">{subValue}</p>
      </CardContent>
    </Card>
  );
}
