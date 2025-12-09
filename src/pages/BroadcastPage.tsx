import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BroadcastMessage, BroadcastChannel, BroadcastAudience, BroadcastStatus } from "@/lib/types/dracp";
import { SRI_LANKA_DISTRICTS, SMS_TEMPLATES } from "@/lib/constants/dracp";
import { supabase } from "@/lib/supabase";
import { realtimeService } from "@/lib/api/realtime-service";
import {
  Megaphone,
  Send,
  Clock,
  Users,
  MessageSquare,
  Mail,
  Bell,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Filter,
  Plus,
  Eye,
  Trash2,
  Loader2,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Fallback broadcast history
const fallbackBroadcasts: BroadcastMessage[] = [
  {
    id: '1',
    title: 'Flood Warning - Western Province',
    content: 'Heavy rainfall expected in Western Province. Please move to higher ground if in flood-prone areas.',
    channels: ['SMS', 'PUSH_NOTIFICATION'],
    targetAudience: 'SPECIFIC_DISTRICTS',
    districts: ['Colombo', 'Gampaha', 'Kalutara'],
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'SENT',
    recipientCount: 15000,
    deliveredCount: 14500,
    createdById: 'admin1'
  },
  {
    id: '2',
    title: 'Relief Distribution Update',
    content: 'Food and water distribution at Kelaniya Temple from 9 AM to 5 PM today. Bring your ID.',
    channels: ['SMS'],
    targetAudience: 'ACTIVE_CASES',
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'SENT',
    recipientCount: 500,
    deliveredCount: 485,
    createdById: 'admin1'
  },
  {
    id: '3',
    title: 'Volunteer Call - Ratnapura',
    content: 'Urgent need for volunteers in Ratnapura district. Register at relief.nysc.lk',
    channels: ['SMS', 'EMAIL'],
    targetAudience: 'ALL_VOLUNTEERS',
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    status: 'SCHEDULED',
    recipientCount: 2000,
    deliveredCount: 0,
    createdById: 'admin1'
  }
];

const channelIcons: Record<BroadcastChannel, React.ReactNode> = {
  SMS: <Smartphone className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  PUSH_NOTIFICATION: <Bell className="h-4 w-4" />,
  IN_APP: <MessageSquare className="h-4 w-4" />
};

const audienceLabels: Record<BroadcastAudience, string> = {
  ALL_BENEFICIARIES: 'All Beneficiaries',
  ALL_VOLUNTEERS: 'All Volunteers',
  SPECIFIC_DISTRICTS: 'Specific Districts',
  ACTIVE_CASES: 'Active Cases',
  CUSTOM: 'Custom List'
};

const statusConfig: Record<BroadcastStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  SCHEDULED: { label: 'Scheduled', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  SENDING: { label: 'Sending', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  SENT: { label: 'Sent', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  FAILED: { label: 'Failed', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
};

export function BroadcastPage() {
  const [activeTab, setActiveTab] = useState('compose');
  const [selectedChannels, setSelectedChannels] = useState<BroadcastChannel[]>(['SMS']);
  const [selectedAudience, setSelectedAudience] = useState<BroadcastAudience>('ALL_BENEFICIARIES');
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBroadcasts();

    const unsubscribe = realtimeService.subscribe({
      table: 'broadcasts',
      callback: () => fetchBroadcasts()
    });

    return () => unsubscribe();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map((b: any) => ({
          id: b.id,
          title: b.title,
          content: b.message,
          channels: b.channels || ['SMS'],
          targetAudience: 'ALL_BENEFICIARIES' as BroadcastAudience,
          districts: b.target_districts || [],
          status: b.status || 'DRAFT',
          recipientCount: b.recipients_count || 0,
          deliveredCount: b.recipients_count || 0,
          createdById: b.sent_by || ''
        }));
        setBroadcasts(mapped);
      } else {
        setBroadcasts(fallbackBroadcasts);
      }
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
      setBroadcasts(fallbackBroadcasts);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChannel = (channel: BroadcastChannel) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district)
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const handleSend = () => {
    alert(`Broadcasting to ${selectedAudience} via ${selectedChannels.join(', ')}`);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
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
            <Megaphone className="h-6 w-6 text-cyan-400" />
            Broadcast Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Send mass communications to beneficiaries and volunteers
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="glass-card border-cyan-500/30">
            <CardContent className="p-4 text-center">
              <Send className="h-5 w-5 mx-auto text-cyan-400 mb-2" />
              <p className="text-2xl font-bold">{broadcasts.length}</p>
              <p className="text-xs text-muted-foreground">Total Broadcasts</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-green-500/30">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-5 w-5 mx-auto text-green-400 mb-2" />
              <p className="text-2xl font-bold">
                {broadcasts.reduce((sum, b) => sum + b.deliveredCount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Messages Delivered</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Clock className="h-5 w-5 mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold">
                {broadcasts.filter(b => b.status === 'SCHEDULED').length}
              </p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-yellow-400 mb-2" />
              <p className="text-2xl font-bold">
                {broadcasts.reduce((sum, b) => sum + b.recipientCount, 0).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Recipients</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="compose" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            {/* Compose Form */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>New Broadcast</CardTitle>
                <CardDescription>
                  Compose and send a message to your audience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Channels */}
                <div className="space-y-3">
                  <Label>Channels</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['SMS', 'EMAIL', 'PUSH_NOTIFICATION', 'IN_APP'] as BroadcastChannel[]).map(channel => (
                      <Button
                        key={channel}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleChannel(channel)}
                        className={cn(
                          "gap-2",
                          selectedChannels.includes(channel)
                            ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                            : "border-white/20"
                        )}
                      >
                        {channelIcons[channel]}
                        {channel.replace('_', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Audience */}
                <div className="space-y-3">
                  <Label>Target Audience</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(Object.keys(audienceLabels) as BroadcastAudience[]).map(audience => (
                      <Button
                        key={audience}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAudience(audience)}
                        className={cn(
                          selectedAudience === audience
                            ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400"
                            : "border-white/20"
                        )}
                      >
                        {audienceLabels[audience]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* District Selection */}
                {selectedAudience === 'SPECIFIC_DISTRICTS' && (
                  <div className="space-y-3">
                    <Label>Select Districts</Label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-2 rounded-lg bg-white/5">
                      {SRI_LANKA_DISTRICTS.map(district => (
                        <div key={district} className="flex items-center space-x-2">
                          <Checkbox
                            id={district}
                            checked={selectedDistricts.includes(district)}
                            onCheckedChange={() => toggleDistrict(district)}
                          />
                          <label htmlFor={district} className="text-xs">{district}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter broadcast title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    placeholder="Enter your message..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] bg-white/5 border-white/10"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length}/160 characters (SMS limit)
                  </p>
                </div>

                {/* Schedule */}
                <div className="flex items-center space-x-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <Checkbox
                    id="schedule"
                    checked={isScheduled}
                    onCheckedChange={(checked) => setIsScheduled(checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor="schedule" className="text-sm font-medium">
                      Schedule for later
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Set a specific date and time to send
                    </p>
                  </div>
                  {isScheduled && (
                    <Input
                      type="datetime-local"
                      className="w-auto bg-white/5 border-white/10"
                    />
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-white/20">
                    Save as Draft
                  </Button>
                  <Button
                    className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                    onClick={handleSend}
                    disabled={!title || !content || selectedChannels.length === 0}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isScheduled ? 'Schedule' : 'Send Now'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {broadcasts.map((broadcast, index) => (
              <motion.div
                key={broadcast.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{broadcast.title}</h4>
                          <Badge className={statusConfig[broadcast.status].color}>
                            {statusConfig[broadcast.status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {broadcast.content}
                        </p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {broadcast.recipientCount.toLocaleString()} recipients
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {broadcast.deliveredCount.toLocaleString()} delivered
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {broadcast.sentAt ? formatTimeAgo(broadcast.sentAt) : 'Scheduled'}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {broadcast.channels.map(channel => (
                            <Badge key={channel} variant="outline" className="text-xs border-white/20">
                              {channelIcons[channel]}
                              <span className="ml-1">{channel}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {Object.values(SMS_TEMPLATES).map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.content}
                        </p>
                        <div className="flex gap-1 mt-2">
                          {template.variables.map(v => (
                            <Badge key={v} variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                              {`{${v}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20"
                        onClick={() => {
                          setContent(template.content);
                          setActiveTab('compose');
                        }}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
