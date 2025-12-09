import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Case, CaseStatus } from "@/lib/types/dracp";
import { CASE_STATUSES, CASE_PRIORITIES, AID_CATEGORIES } from "@/lib/constants/dracp";
import {
  Search,
  ClipboardList,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  AlertTriangle,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Mock case for tracking
const mockTrackedCase: Case = {
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
    village: 'Kaduwela',
    vulnerabilities: ['ELDERLY', 'CHRONIC_ILLNESS'],
    registeredAt: new Date(),
    optInSms: true,
    optInEmail: false,
    cases: [],
    totalAidReceived: 0
  },
  category: 'FOOD',
  priority: 'HIGH',
  status: 'IN_PROGRESS',
  description: 'Family of 5 stranded due to flooding. Need food supplies for 3 days.',
  location: {
    address: '123 Main Road, Kaduwela',
    district: 'Colombo',
    village: 'Kaduwela',
    latitude: 6.9271,
    longitude: 79.8612
  },
  assignedVolunteerId: 'v1',
  createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  slaDeadline: new Date(Date.now() + 20 * 60 * 60 * 1000),
  notes: [
    {
      id: '1',
      caseId: '1',
      authorId: 'v1',
      authorName: 'Volunteer Kasun',
      content: 'Contacted beneficiary. Will deliver supplies tomorrow morning.',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isInternal: false
    },
    {
      id: '2',
      caseId: '1',
      authorId: 'cm1',
      authorName: 'Case Manager',
      content: 'Case assigned to volunteer in the area.',
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
      isInternal: false
    }
  ],
  statusHistory: [
    {
      id: '1',
      caseId: '1',
      fromStatus: 'PENDING',
      toStatus: 'ASSIGNED',
      changedById: 'cm1',
      changedByName: 'Case Manager',
      createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
    },
    {
      id: '2',
      caseId: '1',
      fromStatus: 'ASSIGNED',
      toStatus: 'ASSIGNED',
      changedById: 'cm1',
      changedByName: 'Case Manager',
      createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
    },
    {
      id: '3',
      caseId: '1',
      fromStatus: 'ASSIGNED',
      toStatus: 'IN_PROGRESS',
      changedById: 'v1',
      changedByName: 'Volunteer Kasun',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ]
};

const statusSteps: CaseStatus[] = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export function CaseTrackingPage() {
  const [caseNumber, setCaseNumber] = useState('');
  const [trackedCase, setTrackedCase] = useState<Case | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!caseNumber.trim()) {
      setError('Please enter a case number');
      return;
    }

    setIsSearching(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (caseNumber.toUpperCase() === 'SOS-20241208-0001' || caseNumber === '0001') {
      setTrackedCase(mockTrackedCase);
    } else {
      setError('Case not found. Please check the case number and try again.');
      setTrackedCase(null);
    }

    setIsSearching(false);
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCurrentStepIndex = (status: CaseStatus) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-cyan-400" />
            Track Your Case
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your case number to check the status
          </p>
        </motion.div>

        {/* Search */}
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Enter case number (e.g., SOS-20241208-0001)"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-white/5 border-white/10 h-12"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="h-12 px-6 bg-cyan-600 hover:bg-cyan-500"
              >
                {isSearching ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Demo: Try searching for "SOS-20241208-0001" or "0001"
            </p>
          </CardContent>
        </Card>

        {/* Case Details */}
        {trackedCase && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Case Header */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">
                        {AID_CATEGORIES.find(c => c.id === trackedCase.category)?.icon}
                      </span>
                      {trackedCase.caseNumber}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {AID_CATEGORIES.find(c => c.id === trackedCase.category)?.label}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={cn(
                      "border",
                      trackedCase.priority === 'CRITICAL' && "bg-red-500/20 border-red-500/30 text-red-400",
                      trackedCase.priority === 'HIGH' && "bg-orange-500/20 border-orange-500/30 text-orange-400",
                      trackedCase.priority === 'MEDIUM' && "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
                      trackedCase.priority === 'LOW' && "bg-green-500/20 border-green-500/30 text-green-400"
                    )}>
                      {CASE_PRIORITIES.find(p => p.id === trackedCase.priority)?.label}
                    </Badge>
                    <Badge className={cn(
                      "border",
                      trackedCase.status === 'RESOLVED' && "bg-green-500/20 border-green-500/30 text-green-400",
                      trackedCase.status === 'IN_PROGRESS' && "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
                      trackedCase.status === 'ASSIGNED' && "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
                      !['RESOLVED', 'IN_PROGRESS', 'ASSIGNED'].includes(trackedCase.status) && "bg-blue-500/20 border-blue-500/30 text-blue-400"
                    )}>
                      {CASE_STATUSES.find(s => s.id === trackedCase.status)?.label}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{trackedCase.description}</p>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-cyan-400" />
                  Case Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />
                  
                  {/* Steps */}
                  <div className="space-y-6">
                    {statusSteps.map((status, index) => {
                      const currentIndex = getCurrentStepIndex(trackedCase.status);
                      const isCompleted = index <= currentIndex;
                      const isCurrent = index === currentIndex;
                      const statusConfig = CASE_STATUSES.find(s => s.id === status);
                      const historyItem = trackedCase.statusHistory.find(h => h.toStatus === status);

                      return (
                        <div key={status} className="relative flex items-start gap-4 pl-0">
                          <div className={cn(
                            "relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2",
                            isCompleted
                              ? "bg-cyan-500 border-cyan-500 text-white"
                              : "bg-background border-white/20"
                          )}>
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{index + 1}</span>
                            )}
                          </div>
                          <div className={cn(
                            "flex-1 pb-2",
                            !isCompleted && "opacity-50"
                          )}>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "font-medium",
                                isCurrent && "text-cyan-400"
                              )}>
                                {statusConfig?.label}
                              </span>
                              {isCurrent && (
                                <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {statusConfig?.description}
                            </p>
                            {historyItem && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDateTime(historyItem.createdAt)} by {historyItem.changedByName}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            {trackedCase.notes.length > 0 && (
              <Card className="glass-card border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-cyan-400" />
                    Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackedCase.notes.map((note, index) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{note.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(note.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{note.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            <Card className="glass-card border-cyan-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="font-medium">Need Help?</p>
                      <p className="text-sm text-muted-foreground">
                        Call our helpline for assistance
                      </p>
                    </div>
                  </div>
                  <Button
                    className="bg-cyan-600 hover:bg-cyan-500"
                    onClick={() => window.location.href = 'tel:117'}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call 117
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Help Card */}
        {!trackedCase && (
          <Card className="glass-card border-white/10">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">How to find your case number?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">1.</span>
                  Check the SMS you received when your case was registered
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">2.</span>
                  The case number format is: SOS-YYYYMMDD-XXXX
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">3.</span>
                  You can also enter just the last 4 digits
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400">4.</span>
                  If you don't have your case number, call 117 for assistance
                </li>
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
