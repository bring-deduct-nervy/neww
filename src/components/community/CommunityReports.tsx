import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmergencyReport, SeverityLevel } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { realtimeService } from "@/lib/api/realtime-service";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type CommunityReport = EmergencyReport & {
  upvotes: number;
  downvotes: number;
  comments: number;
  isVerified: boolean;
  reporterName: string;
};

// Fallback community reports
const fallbackReports: CommunityReport[] = [
  {
    id: '1',
    category: 'FLOOD_TRAPPED',
    severity: 'HIGH',
    title: 'Road flooded near Colombo Fort',
    description: 'Main road near Fort Railway Station is flooded. Water level about 2 feet. Vehicles cannot pass.',
    latitude: 6.9344,
    longitude: 79.8428,
    address: 'Fort Railway Station, Colombo',
    district: 'Colombo',
    peopleAffected: 0,
    hasChildren: false,
    hasElderly: false,
    hasDisabled: false,
    hasMedicalNeeds: false,
    contactName: 'Community Member',
    contactPhone: '',
    isAnonymous: false,
    images: [],
    status: 'VERIFIED',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(),
    upvotes: 45,
    downvotes: 2,
    comments: 12,
    isVerified: true,
    reporterName: 'Kasun P.'
  },
  {
    id: '2',
    category: 'INFRASTRUCTURE',
    severity: 'MEDIUM',
    title: 'Tree fallen blocking road',
    description: 'Large tree has fallen on Galle Road near Wellawatte. Traffic diverted.',
    latitude: 6.8750,
    longitude: 79.8600,
    address: 'Galle Road, Wellawatte',
    district: 'Colombo',
    peopleAffected: 0,
    hasChildren: false,
    hasElderly: false,
    hasDisabled: false,
    hasMedicalNeeds: false,
    contactName: 'Community Member',
    contactPhone: '',
    isAnonymous: false,
    images: [],
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
    upvotes: 23,
    downvotes: 1,
    comments: 5,
    isVerified: false,
    reporterName: 'Nimali S.'
  },
  {
    id: '3',
    category: 'SUPPLIES',
    severity: 'MEDIUM',
    title: 'Water distribution point active',
    description: 'Clean drinking water being distributed at Kelaniya Temple. Bring your own containers.',
    latitude: 6.9553,
    longitude: 79.9225,
    address: 'Kelaniya Temple',
    district: 'Gampaha',
    peopleAffected: 0,
    hasChildren: false,
    hasElderly: false,
    hasDisabled: false,
    hasMedicalNeeds: false,
    contactName: 'Temple Committee',
    contactPhone: '',
    isAnonymous: false,
    images: [],
    status: 'VERIFIED',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(),
    upvotes: 89,
    downvotes: 0,
    comments: 34,
    isVerified: true,
    reporterName: 'Temple Admin'
  }
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

export function CommunityReports() {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();

    const unsubscribe = realtimeService.subscribe({
      table: 'emergency_reports',
      callback: () => fetchReports()
    });

    return () => unsubscribe();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped: CommunityReport[] = data.map((r: any) => ({
          id: r.id,
          category: r.category || 'OTHER',
          severity: r.severity || 'MEDIUM',
          title: r.description?.substring(0, 50) || 'Report',
          description: r.description || '',
          latitude: r.latitude || 0,
          longitude: r.longitude || 0,
          address: r.address || '',
          district: r.district || '',
          peopleAffected: 1,
          hasChildren: false,
          hasElderly: false,
          hasDisabled: false,
          hasMedicalNeeds: false,
          contactName: r.reporter_name || 'Anonymous',
          contactPhone: r.reporter_phone || '',
          isAnonymous: !r.reporter_name,
          images: [],
          status: r.status || 'PENDING',
          createdAt: new Date(r.created_at),
          updatedAt: new Date(r.updated_at || r.created_at),
          upvotes: Math.floor(Math.random() * 50),
          downvotes: Math.floor(Math.random() * 5),
          comments: Math.floor(Math.random() * 20),
          isVerified: r.status === 'VERIFIED',
          reporterName: r.reporter_name || 'Anonymous'
        }));
        setReports(mapped);
      } else {
        setReports(fallbackReports);
      }
    } catch (err) {
      console.error('Error fetching community reports:', err);
      setReports(fallbackReports);
    } finally {
      setIsLoading(false);
    }
  };

  const displayReports = reports.length > 0 ? reports : fallbackReports;

  const handleUpvote = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, upvotes: report.upvotes + 1 }
        : report
    ));
  };

  const handleDownvote = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, downvotes: report.downvotes + 1 }
        : report
    ));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            Community Reports
          </CardTitle>
          <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500">
            + Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.map((report, index) => {
            const severityConfig = SEVERITY_CONFIG[report.severity];

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border",
                  severityConfig.borderColor,
                  severityConfig.bgColor
                )}
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{categoryIcons[report.category]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold">{report.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-xs bg-white/10">
                              {report.reporterName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {report.reporterName}
                          </span>
                          {report.isVerified && (
                            <Badge className="h-5 bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className={cn("shrink-0", severityConfig.bgColor, severityConfig.textColor)}>
                        {report.severity}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2">
                      {report.description}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {report.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(report.createdAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => handleUpvote(report.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-green-400 transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{report.upvotes}</span>
                      </button>
                      <button
                        onClick={() => handleDownvote(report.id)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        <span>{report.downvotes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-cyan-400 transition-colors">
                        <MessageCircle className="h-4 w-4" />
                        <span>{report.comments}</span>
                      </button>
                      <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-cyan-400 transition-colors ml-auto">
                        <Share2 className="h-4 w-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Button variant="ghost" className="w-full mt-4 text-cyan-400">
          View All Community Reports →
        </Button>
      </CardContent>
    </Card>
  );
}
