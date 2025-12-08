import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { AID_CATEGORIES, SRI_LANKA_DISTRICTS } from "@/lib/constants/dracp";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Edit,
  MapPin,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
  available: number;
  needed: number;
  urgency: string;
  location: string;
  district: string;
  created_at: string;
  updated_at: string;
}

export function ResourceManagementPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    category: '',
    name: '',
    quantity: 0,
    unit: 'units',
    available: 0,
    needed: 0,
    urgency: 'LOW',
    location: '',
    district: ''
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('urgency', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error('Error loading resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async () => {
    if (!newResource.category || !newResource.name || !newResource.district) return;

    try {
      const { error } = await supabase
        .from('resources')
        .insert(newResource);
      
      if (error) throw error;
      
      setNewResource({
        category: '',
        name: '',
        quantity: 0,
        unit: 'units',
        available: 0,
        needed: 0,
        urgency: 'LOW',
        location: '',
        district: ''
      });
      setShowAddForm(false);
      await loadResources();
    } catch (err) {
      console.error('Error adding resource:', err);
    }
  };

  const handleUpdateQuantity = async (id: string, field: 'available' | 'quantity', value: number) => {
    try {
      await supabase
        .from('resources')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id);
      await loadResources();
    } catch (err) {
      console.error('Error updating resource:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      await supabase.from('resources').delete().eq('id', id);
      await loadResources();
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: resources.length,
    critical: resources.filter(r => r.urgency === 'CRITICAL').length,
    lowStock: resources.filter(r => r.available < r.needed * 0.3).length,
    adequate: resources.filter(r => r.available >= r.needed).length
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
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
              <Package className="h-6 w-6 text-cyan-400" />
              Resource Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage relief supplies and resources
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadResources}
              disabled={isLoading}
              className="border-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="glass-card border-cyan-500/30">
            <CardContent className="p-4 text-center">
              <Package className="h-5 w-5 mx-auto text-cyan-400 mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Resources</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-red-500/30">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-5 w-5 mx-auto text-red-400 mb-2" />
              <p className="text-2xl font-bold">{stats.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-orange-500/30">
            <CardContent className="p-4 text-center">
              <TrendingDown className="h-5 w-5 mx-auto text-orange-400 mb-2" />
              <p className="text-2xl font-bold">{stats.lowStock}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-green-500/30">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-5 w-5 mx-auto text-green-400 mb-2" />
              <p className="text-2xl font-bold">{stats.adequate}</p>
              <p className="text-xs text-muted-foreground">Adequate</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter('ALL')}
              className={cn(
                categoryFilter === 'ALL' ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "border-white/20"
              )}
            >
              All
            </Button>
            {AID_CATEGORIES.slice(0, 6).map(cat => (
              <Button
                key={cat.id}
                variant="outline"
                size="sm"
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "shrink-0",
                  categoryFilter === cat.id ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "border-white/20"
                )}
              >
                {cat.icon} {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources List */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Resources ({filteredResources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResources.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No resources found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredResources.map((resource, index) => {
                  const category = AID_CATEGORIES.find(c => c.id === resource.category);
                  const stockPercentage = resource.needed > 0 
                    ? Math.min(100, (resource.available / resource.needed) * 100) 
                    : 100;
                  
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "p-4 rounded-xl border",
                        stockPercentage < 30 ? "bg-red-500/5 border-red-500/30" :
                        stockPercentage < 60 ? "bg-yellow-500/5 border-yellow-500/30" :
                        "bg-white/5 border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category?.icon || '📦'}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{resource.name}</span>
                              <Badge className={getUrgencyColor(resource.urgency)}>
                                {resource.urgency}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span>{category?.label}</span>
                              {resource.district && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {resource.district}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm">
                              <span className={cn(
                                "font-bold",
                                stockPercentage < 30 ? "text-red-400" :
                                stockPercentage < 60 ? "text-yellow-400" :
                                "text-green-400"
                              )}>
                                {resource.available}
                              </span>
                              <span className="text-muted-foreground"> / {resource.needed} {resource.unit}</span>
                            </p>
                            <Progress value={stockPercentage} className="h-2 w-24 mt-1" />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400"
                            onClick={() => handleDelete(resource.id)}
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

        {/* Add Resource Modal */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle>Add New Resource</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <select
                      value={newResource.category}
                      onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10"
                    >
                      <option value="">Select category</option>
                      {AID_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g., Rice Packets"
                      value={newResource.name}
                      onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Available</Label>
                      <Input
                        type="number"
                        value={newResource.available}
                        onChange={(e) => setNewResource({ ...newResource, available: parseInt(e.target.value) || 0 })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Needed</Label>
                      <Input
                        type="number"
                        value={newResource.needed}
                        onChange={(e) => setNewResource({ ...newResource, needed: parseInt(e.target.value) || 0 })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        placeholder="e.g., kg, liters"
                        value={newResource.unit}
                        onChange={(e) => setNewResource({ ...newResource, unit: e.target.value })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Urgency</Label>
                      <select
                        value={newResource.urgency}
                        onChange={(e) => setNewResource({ ...newResource, urgency: e.target.value })}
                        className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>District</Label>
                    <select
                      value={newResource.district}
                      onChange={(e) => setNewResource({ ...newResource, district: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10"
                    >
                      <option value="">Select district</option>
                      {SRI_LANKA_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-white/20"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                      onClick={handleAddResource}
                    >
                      Add Resource
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
