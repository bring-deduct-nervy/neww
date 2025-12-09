import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Case, CaseStatus, Volunteer, SLAMetrics } from "@/lib/types/dracp";
import { CASE_STATUSES, CASE_PRIORITIES, AID_CATEGORIES } from "@/lib/constants/dracp";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { realtimeService } from "@/lib/api/realtime-service";
import {
  User,
  ClipboardList,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Navigation,
  TrendingUp,
  Award,
  Star,
  Timer,
  AlertTriangle,
  Target,
  Zap,
  Loader2,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Fallback volunteer data
const fallbackVolunteer: Volunteer = {
  id: 'v1',
  userId: 'u1',
  name: 'Kasun Perera',
  phone: '+94771234567',
  email: 'kasun@example.com',
  district: 'Colombo',
  skills: ['FIRST_AID', 'DRIVING', 'LOGISTICS'],
  availability: 'FULL_TIME',
  status: 'ACTIVE',
  role: 'FIELD_WORKER',
  registeredAt: new Date('2024-01-15'),
  verifiedAt: new Date('2024-01-16'),
  isVerified: true,
  assignedCases: [],
  completedCases: 45,
  slaMetrics: {
    totalCasesHandled: 52,
    casesResolvedOnTime: 48,
    averageResponseTime: 25,
    averageResolutionTime: 18,
    slaComplianceRate: 92.3,
    customerSatisfactionScore: 4.7
  },
  rating: 4.7,
  badges: [
    { id: '1', name: 'First Responder', description: 'Completed first 10 cases', icon: '🏅', earnedAt: new Date() },
    { id: '2', name: 'Speed Demon', description: 'Resolved 5 cases under 4 hours', icon: '⚡', earnedAt: new Date() },
    { id: '3', name: 'Community Hero', description: 'Helped 100+ people', icon: '🦸', earnedAt: new Date() }
  ]
};

// Mock assigned cases
const fallbackAssignedCases: Case[] = [
  {
    id: '1',
    caseNumber: 'SOS-20241208-0001',
    beneficiaryId: '1',
    beneficiary: {
      id: '1',
      name: 'Kamal Perera',
      phone: '+94771234567',
      householdSize: 5,
      address: '123 Main Road, Kaduwela',
      district: 'Colombo',
      vulnerabilities: ['ELDERLY'],
      registeredAt: new Date(),
      optInSms: true,
      optInEmail: false,
      cases: [],
      totalAidReceived: 0
    },
    category: 'FOOD',
    priority: 'HIGH',
    status: 'ASSIGNED',
    description: 'Family needs food supplies urgently',
    location: {
      address: '123 Main Road, Kaduwela',
      district: 'Colombo',
      latitude: 6.9271,
      longitude: 79.8612
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
    slaDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000),
    notes: [],
    statusHistory: []
  },
  {
    id: '2',
    caseNumber: 'SOS-20241208-0005',
    beneficiaryId: '2',
    beneficiary: {
      id: '2',
      name: 'Nimali Silva',
      phone: '+94779876543',
      householdSize: 3,
      address: '45 Temple Road, Kelaniya',
      district: 'Gampaha',
      vulnerabilities: ['PREGNANT'],
      registeredAt: new Date(),
      optInSms: true,
      optInEmail: true,
      cases: [],
      totalAidReceived: 0
    },
    category: 'MEDICAL',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    description: 'Pregnant woman needs medical supplies',
    location: {
      address: '45 Temple Road, Kelaniya',
      district: 'Gampaha',
      latitude: 6.9553,
      longitude: 79.9225
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(),
    slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000),
    notes: [],
    statusHistory: []
  }
];

export function VolunteerDashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('assigned');
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [assignedCases, setAssignedCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchVolunteerData();

    const unsubscribe = realtimeService.subscribe({
      table: 'cases',
      callback: () => fetchVolunteerData()
    });

    return () => unsubscribe();
  }, [user]);

  const fetchVolunteerData = async () => {
    if (!user) {
      setVolunteer(fallbackVolunteer);
      setAssignedCases(fallbackAssignedCases);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch volunteer profile
      const { data: volunteerData } = await supabase
        .from('volunteers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (volunteerData) {
        const mappedVolunteer: Volunteer = {
          id: volunteerData.id,
          userId: volunteerData.user_id,
          name: volunteerData.name,
          phone: volunteerData.phone,
          email: volunteerData.email,
          district: volunteerData.district,
          skills: volunteerData.skills || [],
          availability: volunteerData.availability || 'ON_CALL',
          status: volunteerData.status || 'ACTIVE',
          role: volunteerData.role || 'FIELD_WORKER',
          registeredAt: new Date(volunteerData.created_at),
          verifiedAt: volunteerData.verified_at ? new Date(volunteerData.verified_at) : undefined,
          isVerified: volunteerData.is_verified || false,
          assignedCases: [],
          completedCases: volunteerData.completed_cases || 0,
          slaMetrics: {
            totalCasesHandled: volunteerData.total_cases_handled || 0,
            casesResolvedOnTime: volunteerData.cases_resolved_on_time || 0,
            averageResponseTime: volunteerData.average_response_time || 0,
            averageResolutionTime: volunteerData.average_resolution_time || 0,
            slaComplianceRate: volunteerData.sla_compliance_rate || 0,
            customerSatisfactionScore: volunteerData.customer_satisfaction_score || 0
          },
          rating: volunteerData.rating || 0,
          badges: []
        };
        setVolunteer(mappedVolunteer);

        // Fetch assigned cases
        const { data: casesData } = await supabase
          .from('cases')
          .select('*, beneficiaries(*)')
          .eq('assigned_volunteer_id', volunteerData.id)
          .in('status', ['ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'])
          .order('created_at', { ascending: false });

        if (casesData) {
          const mappedCases = casesData.map((c: any) => ({
            id: c.id,
            caseNumber: c.case_number,
            beneficiaryId: c.beneficiary_id,
            beneficiary: c.beneficiaries ? {
              id: c.beneficiaries.id,
              name: c.beneficiaries.name,
              phone: c.beneficiaries.phone,
              householdSize: c.beneficiaries.household_size || 1,
              address: c.beneficiaries.address,
              district: c.beneficiaries.district,
              vulnerabilities: c.beneficiaries.vulnerabilities || [],
              registeredAt: new Date(c.beneficiaries.created_at),
              optInSms: c.beneficiaries.opt_in_sms,
              optInEmail: c.beneficiaries.opt_in_email,
              cases: [],
              totalAidReceived: c.beneficiaries.total_aid_received || 0
            } : undefined,
            category: c.category,
            priority: c.priority,
            status: c.status,
            description: c.description,
            location: {
              address: c.address,
              district: c.district,
              latitude: c.latitude,
              longitude: c.longitude
            },
            createdAt: new Date(c.created_at),
            updatedAt: new Date(c.updated_at || c.created_at),
            slaDeadline: c.sla_deadline ? new Date(c.sla_deadline) : new Date(Date.now() + 24 * 60 * 60 * 1000),
            notes: [],
            statusHistory: []
          }));
          setAssignedCases(mappedCases);
        }
      } else {
        setVolunteer(fallbackVolunteer);
        setAssignedCases(fallbackAssignedCases);
      }
    } catch (err) {
      console.error('Error fetching volunteer data:', err);
      setVolunteer(fallbackVolunteer);
      setAssignedCases(fallbackAssignedCases);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchVolunteerData();
  };

  const displayVolunteer = volunteer || fallbackVolunteer;
  const displayCases = assignedCases.length > 0 ? assignedCases : fallbackAssignedCases;
  const displayVolunteerName = displayVolunteer.name;
  const displayVolunteerIsVerified = displayVolunteer.isVerified;
  const displayVolunteerRole = displayVolunteer.role;
  const displayVolunteerStatus = displayVolunteer.status;
  const displayVolunteerDistrict = displayVolunteer.district;
  const displayVolunteerRating = displayVolunteer.rating;
  const displayVolunteerBadges = displayVolunteer.badges || [];
  const displayVolunteerCompletedCases = displayVolunteer.completedCases || 0;
  const displayVolunteerSlaMetrics = displayVolunteer.slaMetrics || { totalCasesHandled: 0, casesResolvedOnTime: 0, averageResponseTime: 0, averageResolutionTime: 0, slaComplianceRate: 0, customerSatisfactionScore: 0 };

  const formatTimeRemaining = (deadline: Date) => {
    const now = new Date();
    const diff = new Date(deadline).getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff < 0) return { text: 'Overdue', isOverdue: true };
    if (hours < 1) return { text: `${minutes}m`, isOverdue: false };
    return { text: `${hours}h ${minutes}m`, isOverdue: false };
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-white/10 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600/30 to-purple-600/30 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                  {displayVolunteerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{displayVolunteerName}</h2>
                    {displayVolunteerIsVerified && (
                      <CheckCircle className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{displayVolunteerRole.replace('_', ' ')}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {displayVolunteerStatus}
                    </Badge>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {displayVolunteerDistrict}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="h-5 w-5 fill-current" />
                    <span className="text-xl font-bold">{displayVolunteerRating}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* SLA Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            icon={<ClipboardList className="h-5 w-5" />}
            label="Cases Handled"
            value={displayVolunteerSlaMetrics.totalCasesHandled}
            color="cyan"
          />
          <MetricCard
            icon={<Target className="h-5 w-5" />}
            label="SLA Compliance"
            value={`${displayVolunteerSlaMetrics.slaComplianceRate}%`}
            color="green"
          />
          <MetricCard
            icon={<Zap className="h-5 w-5" />}
            label="Avg Response"
            value={`${displayVolunteerSlaMetrics.averageResponseTime}m`}
            color="yellow"
          />
          <MetricCard
            icon={<Timer className="h-5 w-5" />}
            label="Avg Resolution"
            value={`${displayVolunteerSlaMetrics.averageResolutionTime}h`}
            color="purple"
          />
        </div>

        {/* Badges */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-400" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {displayVolunteerBadges.map(badge => (
                <div
                  key={badge.id}
                  className="flex-shrink-0 p-3 rounded-xl bg-white/5 border border-white/10 text-center min-w-[100px]"
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <p className="text-xs font-medium mt-2">{badge.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cases Tabs */}
        <Tabs defaultValue="assigned" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="assigned">
              Assigned ({displayCases.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({displayVolunteerCompletedCases})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assigned" className="space-y-4">
            {displayCases.length === 0 ? (
              <Card className="glass-card border-white/10">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <p className="text-muted-foreground">No assigned cases</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're all caught up!
                  </p>
                </CardContent>
              </Card>
            ) : (
              displayCases.map((caseItem, index) => {
                const statusConfig = CASE_STATUSES.find(s => s.id === caseItem.status);
                const priorityConfig = CASE_PRIORITIES.find(p => p.id === caseItem.priority);
                const categoryConfig = AID_CATEGORIES.find(c => c.id === caseItem.category);
                const timeRemaining = formatTimeRemaining(caseItem.slaDeadline);

                return (
                  <motion.div
                    key={caseItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "glass-card border",
                      timeRemaining.isOverdue ? "border-red-500/50" : "border-white/10"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{categoryConfig?.icon}</div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-sm text-cyan-400">{caseItem.caseNumber}</span>
                                <h4 className="font-semibold mt-1">{caseItem.beneficiary.name}</h4>
                              </div>
                              <div className="flex flex-col gap-1 items-end">
                                <Badge className={cn(
                                  "border",
                                  `bg-${priorityConfig?.color}-500/20 border-${priorityConfig?.color}-500/30 text-${priorityConfig?.color}-400`
                                )}>
                                  {priorityConfig?.label}
                                </Badge>
                                <span className={cn(
                                  "text-xs flex items-center gap-1",
                                  timeRemaining.isOverdue ? "text-red-400" : "text-muted-foreground"
                                )}>
                                  <Timer className="h-3 w-3" />
                                  {timeRemaining.text}
                                </span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {caseItem.description}
                            </p>

                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {caseItem.location.district}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {caseItem.beneficiary.householdSize} people
                              </span>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                                onClick={() => window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${caseItem.location.latitude},${caseItem.location.longitude}`,
                                  '_blank'
                                )}
                              >
                                <Navigation className="h-4 w-4 mr-1" />
                                Navigate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20"
                                onClick={() => window.location.href = `tel:${caseItem.beneficiary.phone}`}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-500/30 text-green-400"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-green-400 mb-4" />
                <p className="text-2xl font-bold">{displayVolunteerCompletedCases}</p>
                <p className="text-muted-foreground">Cases Completed</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {displayVolunteerSlaMetrics.casesResolvedOnTime} resolved within SLA
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Performance Summary */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>SLA Compliance</span>
                <span className="text-green-400">{displayVolunteerSlaMetrics.slaComplianceRate}%</span>
              </div>
              <Progress value={displayVolunteerSlaMetrics.slaComplianceRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Customer Satisfaction</span>
                <span className="text-yellow-400">{displayVolunteerSlaMetrics.customerSatisfactionScore}/5</span>
              </div>
              <Progress value={(displayVolunteerSlaMetrics.customerSatisfactionScore / 5) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>On-Time Resolution</span>
                <span className="text-cyan-400">
                  {Math.round((displayVolunteerSlaMetrics.casesResolvedOnTime / displayVolunteerSlaMetrics.totalCasesHandled) * 100)}%
                </span>
              </div>
              <Progress 
                value={(displayVolunteerSlaMetrics.casesResolvedOnTime / displayVolunteerSlaMetrics.totalCasesHandled) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colorClasses: Record<string, string> = {
    cyan: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    green: "bg-green-500/20 border-green-500/30 text-green-400",
    yellow: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-400",
  };

  return (
    <Card className={cn("glass-card border", colorClasses[color])}>
      <CardContent className="p-4 text-center">
        <div className={cn("mx-auto mb-2", colorClasses[color].split(' ')[2])}>
          {icon}
        </div>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
