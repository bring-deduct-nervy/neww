import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CaseStatus, CasePriority, AidCategory } from "@/lib/types/dracp";
import { CASE_STATUSES, CASE_PRIORITIES, AID_CATEGORIES, isSLABreached } from "@/lib/constants/dracp";
import { useRealtimeCases } from "@/hooks/useRealtimeData";
import { getCases, updateCaseStatus, assignVolunteer } from "@/lib/api/cases";
import { getAvailableVolunteers } from "@/lib/api/volunteers";
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Clock,
  User,
  MapPin,
  Phone,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Users,
  Package,
  Timer,
  RefreshCw,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function CaseManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<CasePriority | 'ALL'>('ALL');
  const [selectedCase, setSelectedCase] = useState<any | null>(null);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  
  const { data: cases, isLoading, refetch } = useRealtimeCases({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    priority: priorityFilter !== 'ALL' ? priorityFilter : undefined
  });

  useEffect(() => {
    loadVolunteers();
  }, []);

  const loadVolunteers = async () => {
    try {
      const data = await getAvailableVolunteers();
      setVolunteers(data || []);
    } catch (err) {
      console.error('Error loading volunteers:', err);
    }
  };

  const filteredCases = (cases || []).filter((c: any) => {
    const matchesSearch = c.case_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.beneficiary?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: cases?.length || 0,
    new: cases?.filter((c: any) => c.status === 'NEW').length || 0,
    inProgress: cases?.filter((c: any) => ['ASSIGNED', 'IN_PROGRESS', 'PENDING_AID'].includes(c.status)).length || 0,
    resolved: cases?.filter((c: any) => c.status === 'RESOLVED').length || 0,
    slaBreached: cases?.filter((c: any) => c.sla_deadline && isSLABreached(new Date(c.sla_deadline), c.status)).length || 0
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const getTimeRemaining = (deadline: string, status: string) => {
    const resolvedStatuses = ['RESOLVED', 'CLOSED', 'DUPLICATE'];
    if (resolvedStatuses.includes(status)) return null;
    
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return { text: 'SLA Breached', isBreached: true };
    if (hours < 1) return { text: `${minutes}m remaining`, isBreached: false };
    return { text: `${hours}h ${minutes}m remaining`, isBreached: false };
  };

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    try {
      await updateCaseStatus(caseId, newStatus, 'Case Manager');
      refetch();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAssignVolunteer = async (caseId: string, volunteerId: string) => {
    try {
      await assignVolunteer(caseId, volunteerId);
      refetch();
    } catch (err) {
      console.error('Error assigning volunteer:', err);
    }
  };

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
              <ClipboardList className="h-6 w-6 text-cyan-400" />
              Case Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage aid requests
            </p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-500">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="Total Cases"
            value={stats.total}
            color="cyan"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="New"
            value={stats.new}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="In Progress"
            value={stats.inProgress}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5" />}
            label="Resolved"
            value={stats.resolved}
            color="green"
          />
          <StatCard
            icon={<Timer className="h-5 w-5" />}
            label="SLA Breached"
            value={stats.slaBreached}
            color="red"
          />
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by case number, name, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter('ALL')}
              className={cn(
                "shrink-0",
                statusFilter === 'ALL' ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "border-white/20"
              )}
            >
              All Status
            </Button>
            {CASE_STATUSES.slice(0, 5).map(status => (
              <Button
                key={status.id}
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter(status.id)}
                className={cn(
                  "shrink-0",
                  statusFilter === status.id ? `bg-${status.color}-500/20 border-${status.color}-500/30 text-${status.color}-400` : "border-white/20"
                )}
              >
                {status.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPriorityFilter('ALL')}
              className={cn(
                "shrink-0",
                priorityFilter === 'ALL' ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "border-white/20"
              )}
            >
              All Priority
            </Button>
            {CASE_PRIORITIES.map(priority => (
              <Button
                key={priority.id}
                variant="outline"
                size="sm"
                onClick={() => setPriorityFilter(priority.id)}
                className={cn(
                  "shrink-0",
                  priorityFilter === priority.id 
                    ? `bg-${priority.color}-500/20 border-${priority.color}-500/30 text-${priority.color}-400` 
                    : "border-white/20"
                )}
              >
                {priority.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.length === 0 ? (
            <Card className="glass-card border-white/10">
              <CardContent className="p-8 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No cases found</p>
              </CardContent>
            </Card>
          ) : (
            filteredCases.map((caseItem: any, index: number) => {
              const statusConfig = CASE_STATUSES.find(s => s.id === caseItem.status);
              const priorityConfig = CASE_PRIORITIES.find(p => p.id === caseItem.priority);
              const categoryConfig = AID_CATEGORIES.find(c => c.id === caseItem.category);
              const timeRemaining = caseItem.sla_deadline ? getTimeRemaining(caseItem.sla_deadline, caseItem.status) : null;

              return (
                <motion.div
                  key={caseItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={cn(
                      "glass-card border cursor-pointer transition-all hover:scale-[1.01]",
                      timeRemaining?.isBreached ? "border-red-500/50" : "border-white/10"
                    )}
                    onClick={() => setSelectedCase(caseItem)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="text-3xl">{categoryConfig?.icon}</div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-cyan-400">{caseItem.case_number}</span>
                                {timeRemaining?.isBreached && (
                                  <Badge variant="destructive" className="animate-pulse">
                                    SLA Breached
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-semibold mt-1">{caseItem.beneficiary?.name || 'Unknown'}</h4>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={cn(
                                "border",
                                `bg-${priorityConfig?.color}-500/20 border-${priorityConfig?.color}-500/30 text-${priorityConfig?.color}-400`
                              )}>
                                {priorityConfig?.label}
                              </Badge>
                              <Badge className={cn(
                                "border",
                                `bg-${statusConfig?.color}-500/20 border-${statusConfig?.color}-500/30 text-${statusConfig?.color}-400`
                              )}>
                                {statusConfig?.label}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {caseItem.description}
                          </p>

                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {caseItem.district || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {caseItem.people_affected || caseItem.beneficiary?.household_size || 1} people
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(caseItem.created_at)}
                            </span>
                            {timeRemaining && !timeRemaining.isBreached && (
                              <span className={cn(
                                "flex items-center gap-1",
                                timeRemaining.text.includes('h') && parseInt(timeRemaining.text) < 4 ? "text-orange-400" : ""
                              )}>
                                <Timer className="h-3 w-3" />
                                {timeRemaining.text}
                              </span>
                            )}
                          </div>

                          {caseItem.beneficiary?.vulnerabilities?.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {caseItem.beneficiary.vulnerabilities.map((v: string) => (
                                <Badge key={v} variant="outline" className="text-xs border-purple-500/30 bg-purple-500/10 text-purple-400">
                                  {v.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Case Detail Modal */}
        {selectedCase && (
          <CaseDetailModal 
            caseItem={selectedCase} 
            onClose={() => setSelectedCase(null)} 
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    cyan: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-400",
    yellow: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    red: "bg-red-500/20 border-red-500/30 text-red-400",
  };

  return (
    <Card className={cn("glass-card border", colorClasses[color])}>
      <CardContent className="p-4 text-center">
        <div className={cn("mx-auto mb-2", colorClasses[color].split(' ')[2])}>
          {icon}
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function CaseDetailModal({ caseItem, onClose }: { caseItem: any; onClose: () => void }) {
  const statusConfig = CASE_STATUSES.find(s => s.id === caseItem.status);
  const priorityConfig = CASE_PRIORITIES.find(p => p.id === caseItem.priority);
  const categoryConfig = AID_CATEGORIES.find(c => c.id === caseItem.category);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="w-full max-w-lg max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className="glass-card border-white/10">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">{categoryConfig?.icon}</span>
                  {caseItem.case_number}
                </CardTitle>
                <CardDescription>{categoryConfig?.label}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge className={cn(
                  "border",
                  `bg-${priorityConfig?.color}-500/20 border-${priorityConfig?.color}-500/30 text-${priorityConfig?.color}-400`
                )}>
                  {priorityConfig?.label}
                </Badge>
                <Badge className={cn(
                  "border",
                  `bg-${statusConfig?.color}-500/20 border-${statusConfig?.color}-500/30 text-${statusConfig?.color}-400`
                )}>
                  {statusConfig?.label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Beneficiary Info */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                Beneficiary
              </h4>
              <div className="space-y-1 text-sm">
                <p><strong>Name:</strong> {caseItem.beneficiary?.name || 'Unknown'}</p>
                <p><strong>Phone:</strong> {caseItem.beneficiary?.phone || 'N/A'}</p>
                <p><strong>Household:</strong> {caseItem.beneficiary?.household_size || caseItem.people_affected || 1} people</p>
              </div>
            </div>

            {/* Location */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-400" />
                Location
              </h4>
              <p className="text-sm">{caseItem.address || 'Unknown'}</p>
              <p className="text-sm text-muted-foreground">{caseItem.district || 'Unknown'}</p>
            </div>

            {/* Description */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm">{caseItem.description}</p>
            </div>

            {/* Vulnerabilities */}
            {caseItem.beneficiary?.vulnerabilities?.length > 0 && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <h4 className="font-medium mb-2 text-purple-400">Vulnerabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {caseItem.beneficiary.vulnerabilities.map((v: string) => (
                    <Badge key={v} variant="outline" className="border-purple-500/30 text-purple-400">
                      {v.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                onClick={() => caseItem.beneficiary?.phone && (window.location.href = `tel:${caseItem.beneficiary.phone}`)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button variant="outline" className="flex-1 border-white/20">
                Update Status
              </Button>
            </div>

            <Button variant="ghost" className="w-full" onClick={onClose}>
              Close
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
