import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiKeys, createApiKey, updateApiKey, deleteApiKey, getSystemSettings, upsertSystemSetting, getUploadedDocuments, uploadDocument } from "@/lib/api/admin";
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
  Bell
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const API_SERVICES = [
  { id: 'OPEN_METEO', name: 'Open-Meteo Weather', description: 'Weather data API' },
  { id: 'TWILIO', name: 'Twilio SMS', description: 'SMS gateway for notifications' },
  { id: 'SENDGRID', name: 'SendGrid Email', description: 'Email service provider' },
  { id: 'GOOGLE_MAPS', name: 'Google Maps', description: 'Maps and geocoding' },
  { id: 'FIREBASE', name: 'Firebase', description: 'Push notifications' },
  { id: 'OPENAI', name: 'OpenAI', description: 'AI assistant capabilities' },
  { id: 'GDACS', name: 'GDACS', description: 'Global disaster alerts' },
];

export function AdminSettingsPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState({ name: '', service: '', key_value: '' });
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [keys, docs] = await Promise.all([
        getApiKeys(),
        getUploadedDocuments()
      ]);
      setApiKeys(keys || []);
      setDocuments(docs || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.service || !newKey.key_value) return;
    
    setIsAddingKey(true);
    try {
      await createApiKey(newKey);
      setNewKey({ name: '', service: '', key_value: '' });
      await loadData();
    } catch (err) {
      console.error('Error adding API key:', err);
    } finally {
      setIsAddingKey(false);
    }
  };

  const handleToggleKey = async (id: string, isActive: boolean) => {
    try {
      await updateApiKey(id, { is_active: !isActive });
      await loadData();
    } catch (err) {
      console.error('Error toggling API key:', err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    
    try {
      await deleteApiKey(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting API key:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      await uploadDocument(file);
      await loadData();
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••' + key.slice(-4);
  };

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
              <Settings className="h-6 w-6 text-cyan-400" />
              Admin Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage API keys, integrations, and system settings
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="border-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        <Tabs defaultValue="api-keys" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="h-5 w-5 text-cyan-400" />
                  Add New API Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., Production SMS"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <select
                      value={newKey.service}
                      onChange={(e) => setNewKey({ ...newKey, service: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-foreground"
                    >
                      <option value="">Select service</option>
                      {API_SERVICES.map(service => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      placeholder="Enter API key"
                      value={newKey.key_value}
                      onChange={(e) => setNewKey({ ...newKey, key_value: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddKey}
                  disabled={isAddingKey || !newKey.name || !newKey.service || !newKey.key_value}
                  className="bg-cyan-600 hover:bg-cyan-500"
                >
                  {isAddingKey ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add API Key
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Configured API Keys</CardTitle>
                <CardDescription>
                  {apiKeys.length} API keys configured
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No API keys configured yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key, index) => {
                      const service = API_SERVICES.find(s => s.id === key.service);
                      return (
                        <motion.div
                          key={key.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "p-4 rounded-xl border",
                            key.is_active 
                              ? "bg-green-500/10 border-green-500/30" 
                              : "bg-white/5 border-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg",
                                key.is_active ? "bg-green-500/20" : "bg-white/10"
                              )}>
                                <Key className={cn(
                                  "h-5 w-5",
                                  key.is_active ? "text-green-400" : "text-muted-foreground"
                                )} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{key.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {service?.name || key.service}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-xs text-muted-foreground font-mono">
                                    {showKeys[key.id] ? key.key_value : maskKey(key.key_value)}
                                  </code>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => toggleShowKey(key.id)}
                                  >
                                    {showKeys[key.id] ? (
                                      <EyeOff className="h-3 w-3" />
                                    ) : (
                                      <Eye className="h-3 w-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={key.is_active}
                                onCheckedChange={() => handleToggleKey(key.id, key.is_active)}
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => handleDeleteKey(key.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Available Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {API_SERVICES.map(service => {
                    const configured = apiKeys.some(k => k.service === service.id && k.is_active);
                    return (
                      <div
                        key={service.id}
                        className={cn(
                          "p-4 rounded-xl border",
                          configured 
                            ? "bg-green-500/10 border-green-500/30" 
                            : "bg-white/5 border-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.description}</p>
                          </div>
                          {configured ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              Not configured
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5 text-cyan-400" />
                  Upload Document
                </CardTitle>
                <CardDescription>
                  Upload CSV, Excel, PDF, or text files to import data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.xlsx,.xls,.pdf,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    {uploadingFile ? (
                      <Loader2 className="h-12 w-12 mx-auto text-cyan-400 animate-spin" />
                    ) : (
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    )}
                    <p className="mt-4 text-sm text-muted-foreground">
                      {uploadingFile ? 'Uploading...' : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      CSV, Excel, PDF, Word, or Text files
                    </p>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                <CardDescription>
                  {documents.length} documents uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-4 rounded-xl border",
                          doc.processing_status === 'COMPLETED' 
                            ? "bg-green-500/10 border-green-500/30"
                            : doc.processing_status === 'FAILED'
                            ? "bg-red-500/10 border-red-500/30"
                            : "bg-yellow-500/10 border-yellow-500/30"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{doc.filename}</p>
                              <p className="text-xs text-muted-foreground">
                                {doc.file_type} • {(doc.file_size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <Badge className={cn(
                            doc.processing_status === 'COMPLETED' && "bg-green-500/20 text-green-400",
                            doc.processing_status === 'FAILED' && "bg-red-500/20 text-red-400",
                            doc.processing_status === 'PENDING' && "bg-yellow-500/20 text-yellow-400",
                            doc.processing_status === 'PROCESSING' && "bg-blue-500/20 text-blue-400"
                          )}>
                            {doc.processing_status === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {doc.processing_status === 'FAILED' && <AlertTriangle className="h-3 w-3 mr-1" />}
                            {doc.processing_status === 'PROCESSING' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                            {doc.processing_status}
                          </Badge>
                        </div>
                        {doc.extracted_data && (
                          <div className="mt-3 p-3 rounded-lg bg-white/5">
                            <p className="text-xs text-muted-foreground mb-1">Extracted Data:</p>
                            <pre className="text-xs overflow-auto max-h-32">
                              {JSON.stringify(doc.extracted_data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-cyan-400" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-xs text-muted-foreground">Send SMS updates to beneficiaries</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Send email updates to volunteers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Send push alerts for emergencies</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-400" />
                  Data Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">Auto-sync Weather Data</p>
                    <p className="text-xs text-muted-foreground">Fetch weather data every 15 minutes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">Auto-sync River Levels</p>
                    <p className="text-xs text-muted-foreground">Fetch river level data every 30 minutes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div>
                    <p className="font-medium">Real-time Updates</p>
                    <p className="text-xs text-muted-foreground">Enable real-time data synchronization</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-cyan-400" />
                  API Service Configuration
                </CardTitle>
                <CardDescription>
                  Choose between free and paid API services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <p className="text-sm text-cyan-400 mb-2">💡 Free vs Paid APIs</p>
                  <p className="text-xs text-muted-foreground">
                    Free APIs have rate limits but are suitable for most use cases. Paid APIs offer higher limits and additional features.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium">Weather API</p>
                      <p className="text-xs text-muted-foreground">Current: Open-Meteo (Free)</p>
                    </div>
                    <select className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm">
                      <option value="OPEN_METEO">Open-Meteo (Free)</option>
                      <option value="OPENWEATHERMAP">OpenWeatherMap (Paid)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium">Maps API</p>
                      <p className="text-xs text-muted-foreground">Current: OpenStreetMap (Free)</p>
                    </div>
                    <select className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm">
                      <option value="OPENSTREETMAP">OpenStreetMap (Free)</option>
                      <option value="GOOGLE_MAPS">Google Maps (Paid)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium">SMS Service</p>
                      <p className="text-xs text-muted-foreground">Current: Twilio (Paid)</p>
                    </div>
                    <select className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm">
                      <option value="TWILIO">Twilio (Paid)</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div>
                      <p className="font-medium">Geocoding API</p>
                      <p className="text-xs text-muted-foreground">Current: Nominatim (Free)</p>
                    </div>
                    <select className="h-9 px-3 rounded-md bg-white/5 border border-white/10 text-sm">
                      <option value="NOMINATIM">Nominatim (Free)</option>
                      <option value="GOOGLE_GEOCODING">Google Geocoding (Paid)</option>
                    </select>
                  </div>
                </div>
                
                <Button className="bg-cyan-600 hover:bg-cyan-500">
                  <Save className="h-4 w-4 mr-2" />
                  Save API Configuration
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-cyan-400" />
                  SLA Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Critical Priority (hours)</Label>
                    <Input type="number" defaultValue="4" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>High Priority (hours)</Label>
                    <Input type="number" defaultValue="24" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Medium Priority (hours)</Label>
                    <Input type="number" defaultValue="48" className="bg-white/5 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Low Priority (hours)</Label>
                    <Input type="number" defaultValue="72" className="bg-white/5 border-white/10" />
                  </div>
                </div>
                <Button className="bg-cyan-600 hover:bg-cyan-500">
                  <Save className="h-4 w-4 mr-2" />
                  Save SLA Settings
                </Button>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-400" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                  <p className="text-sm text-yellow-400 mb-2">⚠️ Development Tools</p>
                  <p className="text-xs text-muted-foreground">
                    These tools are for development and testing purposes. Use with caution in production.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    onClick={async () => {
                      if (confirm('This will add sample data to the database. Continue?')) {
                        const { seedAllData } = await import('@/lib/api/seed-data');
                        await seedAllData();
                        alert('Sample data added successfully!');
                      }
                    }}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Seed Sample Data
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={async () => {
                      if (confirm('This will DELETE all data from the database. This action cannot be undone. Continue?')) {
                        const { clearAllData } = await import('@/lib/api/seed-data');
                        await clearAllData();
                        alert('All data cleared!');
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
