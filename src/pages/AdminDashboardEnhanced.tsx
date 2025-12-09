import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getApiKeys, 
  createApiKey, 
  updateApiKey, 
  deleteApiKey,
  getDashboardStats,
  getSystemConfig,
  updateSystemConfig
} from "@/lib/api/admin";
import { getSystemHealth, verifyVolunteer, suspendVolunteer } from "@/lib/api/admin-extended";
import { availableApiServices } from "@/lib/api/services";
import {
  Settings,
  Key,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Database,
  Cloud,
  MessageSquare,
  Bell,
  Activity,
  Users,
  TrendingUp,
  Shield,
  LogOut,
  Copy,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  service: string;
  key_value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SystemHealth {
  database: {
    cases_total: number;
    alerts_total: number;
    pending_notifications: number;
    failed_notifications: number;
    processing_documents: number;
    failed_documents: number;
  };
  status: string;
}

export function AdminDashboardEnhanced() {
  const [activeTab, setActiveTab] = useState("overview");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState({ name: '', service: '', key_value: '' });
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [config, setConfig] = useState<Record<string, any>>({});
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [keysData, statsData, healthData, configData] = await Promise.all([
        getApiKeys(),
        getDashboardStats(),
        getSystemHealth(),
        getSystemConfig()
      ]);
      setApiKeys(keysData || []);
      setStats(statsData);
      setHealth(healthData);
      setConfig(configData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.service || !newKey.key_value) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsAddingKey(true);
    try {
      const result = await createApiKey({
        name: newKey.name,
        service: newKey.service,
        key_value: newKey.key_value,
        is_active: true
      });
      setApiKeys([...apiKeys, result]);
      setNewKey({ name: '', service: '', key_value: '' });
      alert('API key added successfully');
    } catch (err) {
      alert('Failed to add API key: ' + (err as any).message);
    } finally {
      setIsAddingKey(false);
    }
  };

  const handleToggleKey = async (id: string, isActive: boolean) => {
    try {
      await updateApiKey(id, { is_active: !isActive });
      setApiKeys(apiKeys.map(k => k.id === id ? { ...k, is_active: !isActive } : k));
    } catch (err) {
      alert('Failed to update API key: ' + (err as any).message);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await deleteApiKey(id);
      setApiKeys(apiKeys.filter(k => k.id !== id));
    } catch (err) {
      alert('Failed to delete API key: ' + (err as any).message);
    }
  };

  const handleSaveConfig = async (key: string, value: any) => {
    try {
      await updateSystemConfig(key, value);
      setConfig({ ...config, [key]: value });
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      alert('Failed to save configuration: ' + (err as any).message);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••' + key.slice(-4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
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
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Settings className="h-8 w-8 text-cyan-400" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">System configuration and management</p>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            className="border-white/20"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* System Health Overview */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card border-white/10 p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Cases</p>
                  <p className="text-2xl font-bold mt-1">{health.database.cases_total}</p>
                </div>
                <Activity className="h-8 w-8 text-cyan-400 opacity-50" />
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
                  <p className="text-muted-foreground text-sm">Pending Notifications</p>
                  <p className="text-2xl font-bold mt-1 text-orange-400">{health.database.pending_notifications}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-400 opacity-50" />
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
                  <p className="text-muted-foreground text-sm">Processing Documents</p>
                  <p className="text-2xl font-bold mt-1 text-blue-400">{health.database.processing_documents}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-400 opacity-50" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className={cn(
                "glass-card border-white/10 p-6 rounded-xl",
                health.database.failed_documents > 0 || health.database.failed_notifications > 0
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-green-500/30 bg-green-500/10"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">System Status</p>
                  <p className="text-lg font-bold mt-1 flex items-center gap-2">
                    {health.database.failed_documents === 0 && health.database.failed_notifications === 0 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        Healthy
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-400" />
                        Issues Detected
                      </>
                    )}
                  </p>
                </div>
                <Shield className="h-8 w-8 opacity-50" />
              </div>
            </motion.div>
          </div>
        )}

        {/* Save Confirmation */}
        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400"
          >
            <CheckCircle className="h-4 w-4 inline mr-2" />
            Configuration saved successfully
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-white/10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="apis">API Keys</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-cyan-400" />
                      Cases Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Cases:</span>
                      <strong>{stats.cases?.total || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>New Today:</span>
                      <strong className="text-cyan-400">{stats.cases?.newToday || 0}</strong>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">In Progress:</span>
                      <strong>{stats.cases?.byStatus?.IN_PROGRESS || 0}</strong>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resolved:</span>
                      <strong className="text-green-400">{stats.cases?.byStatus?.RESOLVED || 0}</strong>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-cyan-400" />
                      Volunteers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Volunteers:</span>
                      <strong>{stats.volunteers?.total || 0}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <strong className="text-green-400">{stats.volunteers?.active || 0}</strong>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg SLA Compliance:</span>
                      <strong>{Math.round((stats.volunteers?.avgSlaCompliance || 0) * 100)}%</strong>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="apis" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-cyan-400" />
                  Available API Services
                </CardTitle>
                <CardDescription>
                  Manage API keys for external services (free and paid alternatives available)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Key Form */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
                  <h3 className="font-semibold">Add New API Key</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="text-sm">Service Name</Label>
                      <Input
                        placeholder="e.g., OpenWeatherMap"
                        value={newKey.name}
                        onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                        className="bg-white/10 border-white/20 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Service Type</Label>
                      <select
                        value={newKey.service}
                        onChange={(e) => setNewKey({ ...newKey, service: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white"
                      >
                        <option value="">Select service</option>
                        {availableApiServices.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-sm">API Key</Label>
                      <Input
                        type="password"
                        placeholder="Enter API key"
                        value={newKey.key_value}
                        onChange={(e) => setNewKey({ ...newKey, key_value: e.target.value })}
                        className="bg-white/10 border-white/20 mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddKey}
                    disabled={isAddingKey}
                    className="w-full bg-cyan-600 hover:bg-cyan-500"
                  >
                    {isAddingKey ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Add API Key
                      </>
                    )}
                  </Button>
                </div>

                {/* API Services Info */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Available Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableApiServices.map(service => (
                      <div key={service.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-sm">{service.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {service.category.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">{service.description}</p>
                        
                        {service.free && (
                          <div className="mb-2">
                            <p className="text-xs font-semibold text-green-400">FREE: {service.free.name}</p>
                            <p className="text-xs text-muted-foreground">{service.free.limitations}</p>
                          </div>
                        )}
                        
                        {service.paid && (
                          <div>
                            <p className="text-xs font-semibold text-yellow-400">PAID: {service.paid.name}</p>
                            <p className="text-xs text-muted-foreground">{service.paid.pricing}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Keys */}
                {apiKeys.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold">Configured API Keys</h3>
                    <div className="space-y-2">
                      {apiKeys.map((key, index) => (
                        <motion.div
                          key={key.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "p-4 rounded-lg border flex items-center justify-between",
                            key.is_active
                              ? "bg-green-500/10 border-green-500/30"
                              : "bg-red-500/10 border-red-500/30"
                          )}
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{key.name}</p>
                            <p className="text-xs text-muted-foreground">{key.service}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="font-mono text-xs bg-white/10 px-2 py-1 rounded">
                              {showKeys[key.id] ? key.key_value : maskKey(key.key_value)}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowKeys({ ...showKeys, [key.id]: !showKeys[key.id] })}
                            >
                              {showKeys[key.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.key_value)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>

                            <Switch
                              checked={key.is_active}
                              onCheckedChange={() => handleToggleKey(key.id, key.is_active)}
                            />

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteKey(key.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-cyan-400" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="font-semibold">SMS Notifications</p>
                    <p className="text-sm text-muted-foreground">Send alerts via SMS</p>
                  </div>
                  <Switch
                    checked={config.sms_enabled !== false}
                    onCheckedChange={(checked) => handleSaveConfig('sms_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="font-semibold">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Send alerts via email</p>
                  </div>
                  <Switch
                    checked={config.email_enabled !== false}
                    onCheckedChange={(checked) => handleSaveConfig('email_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="font-semibold">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">Send push notifications</p>
                  </div>
                  <Switch
                    checked={config.push_enabled !== false}
                    onCheckedChange={(checked) => handleSaveConfig('push_enabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <p className="font-semibold">Use Free APIs</p>
                    <p className="text-sm text-muted-foreground">Prefer free API alternatives</p>
                  </div>
                  <Switch
                    checked={config.use_free_apis !== false}
                    onCheckedChange={(checked) => handleSaveConfig('use_free_apis', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage system users and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Go to User Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-muted-foreground">Database Status</p>
                    <p className="text-lg font-semibold mt-1 text-green-400">Connected</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-sm text-muted-foreground">API Status</p>
                    <p className="text-lg font-semibold mt-1 text-green-400">Operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
