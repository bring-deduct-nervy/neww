import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { realtimeService } from "@/lib/api/realtime-service";
import {
  Package,
  Droplets,
  Utensils,
  Pill,
  Shirt,
  Baby,
  Truck,
  MapPin,
  Clock,
  TrendingUp,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ResourceItem {
  id: string;
  category: string;
  name: string;
  icon: React.ReactNode;
  available: number;
  needed: number;
  unit: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastUpdated: Date;
}

const fallbackResources: ResourceItem[] = [
  {
    id: '1',
    category: 'WATER',
    name: 'Drinking Water',
    icon: <Droplets className="h-5 w-5" />,
    available: 5000,
    needed: 15000,
    unit: 'liters',
    urgency: 'HIGH',
    lastUpdated: new Date()
  },
  {
    id: '2',
    category: 'FOOD',
    name: 'Dry Rations',
    icon: <Utensils className="h-5 w-5" />,
    available: 800,
    needed: 2000,
    unit: 'packs',
    urgency: 'MEDIUM',
    lastUpdated: new Date()
  },
  {
    id: '3',
    category: 'MEDICINE',
    name: 'First Aid Kits',
    icon: <Pill className="h-5 w-5" />,
    available: 50,
    needed: 200,
    unit: 'kits',
    urgency: 'CRITICAL',
    lastUpdated: new Date()
  },
  {
    id: '4',
    category: 'CLOTHING',
    name: 'Blankets',
    icon: <Shirt className="h-5 w-5" />,
    available: 300,
    needed: 500,
    unit: 'pieces',
    urgency: 'MEDIUM',
    lastUpdated: new Date()
  },
  {
    id: '5',
    category: 'BABY',
    name: 'Baby Formula',
    icon: <Baby className="h-5 w-5" />,
    available: 20,
    needed: 100,
    unit: 'cans',
    urgency: 'HIGH',
    lastUpdated: new Date()
  }
];

interface IncomingSupply {
  id: string;
  description: string;
  source: string;
  eta: string;
  status: 'IN_TRANSIT' | 'ARRIVED' | 'DISTRIBUTED';
}

const fallbackIncomingSupplies: IncomingSupply[] = [
  {
    id: '1',
    description: '5000L Water + 500 Food Packs',
    source: 'Red Cross',
    eta: '2 hours',
    status: 'IN_TRANSIT'
  },
  {
    id: '2',
    description: '100 First Aid Kits',
    source: 'Ministry of Health',
    eta: '4 hours',
    status: 'IN_TRANSIT'
  },
  {
    id: '3',
    description: '200 Blankets',
    source: 'Private Donor',
    eta: 'Arrived',
    status: 'ARRIVED'
  }
];

const urgencyConfig = {
  LOW: { label: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30' },
  MEDIUM: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30' },
  HIGH: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/20 border-orange-500/30' },
  CRITICAL: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' }
};

export function ResourceTracker() {
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [supplies, setSupplies] = useState<IncomingSupply[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResources();

    const unsubscribe = realtimeService.subscribe({
      table: 'resources',
      callback: () => fetchResources()
    });

    return () => unsubscribe();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const iconMap: Record<string, React.ReactNode> = {
          'WATER': <Droplets className="h-5 w-5" />,
          'FOOD': <Utensils className="h-5 w-5" />,
          'MEDICAL': <Pill className="h-5 w-5" />,
          'SHELTER': <Package className="h-5 w-5" />,
          'SANITATION': <Package className="h-5 w-5" />,
          'EQUIPMENT': <Package className="h-5 w-5" />,
        };

        const mapped: ResourceItem[] = data.map((r: any) => ({
          id: r.id,
          category: r.category || 'OTHER',
          name: r.name,
          icon: iconMap[r.category] || <Package className="h-5 w-5" />,
          available: r.quantity || 0,
          needed: (r.quantity || 0) + (r.min_stock_level || 100),
          unit: r.unit || 'units',
          urgency: r.status === 'LOW_STOCK' ? 'HIGH' : r.status === 'OUT_OF_STOCK' ? 'CRITICAL' : 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
          lastUpdated: new Date(r.updated_at || r.created_at)
        }));
        setResources(mapped);
      } else {
        setResources(fallbackResources);
      }
      setSupplies(fallbackIncomingSupplies);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setResources(fallbackResources);
      setSupplies(fallbackIncomingSupplies);
    } finally {
      setIsLoading(false);
    }
  };

  const displayResources = resources.length > 0 ? resources : fallbackResources;
  const displaySupplies = supplies.length > 0 ? supplies : fallbackIncomingSupplies;
  const criticalItems = displayResources.filter(r => r.urgency === 'CRITICAL' || r.urgency === 'HIGH');

  return (
    <div className="space-y-6">
      {/* Resource Overview */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-cyan-400" />
              Resource Status
            </CardTitle>
            {criticalItems.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalItems.length} Urgent
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayResources.map((resource, index) => {
              const percentage = (resource.available / resource.needed) * 100;
              const urgency = urgencyConfig[resource.urgency];

              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg", urgency.bgColor, urgency.color)}>
                        {resource.icon}
                      </div>
                      <span className="font-medium">{resource.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {resource.available.toLocaleString()} / {resource.needed.toLocaleString()} {resource.unit}
                      </span>
                      <Badge className={cn("border", urgency.bgColor, urgency.color)}>
                        {urgency.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        "h-full rounded-full",
                        percentage < 25 && "bg-red-500",
                        percentage >= 25 && percentage < 50 && "bg-orange-500",
                        percentage >= 50 && percentage < 75 && "bg-yellow-500",
                        percentage >= 75 && "bg-green-500"
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Incoming Supplies */}
      <Card className="glass-card border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5 text-cyan-400" />
            Incoming Supplies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {displaySupplies.map((supply, index) => (
              <motion.div
                key={supply.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-xl border",
                  supply.status === 'IN_TRANSIT' && "bg-blue-500/10 border-blue-500/30",
                  supply.status === 'ARRIVED' && "bg-green-500/10 border-green-500/30",
                  supply.status === 'DISTRIBUTED' && "bg-gray-500/10 border-gray-500/30"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{supply.description}</p>
                    <p className="text-sm text-muted-foreground">From: {supply.source}</p>
                  </div>
                  <Badge className={cn(
                    supply.status === 'IN_TRANSIT' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    supply.status === 'ARRIVED' && "bg-green-500/20 text-green-400 border-green-500/30",
                    supply.status === 'DISTRIBUTED' && "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  )}>
                    {supply.status === 'IN_TRANSIT' && <Truck className="h-3 w-3 mr-1" />}
                    {supply.status === 'ARRIVED' && <MapPin className="h-3 w-3 mr-1" />}
                    {supply.eta}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>

          <Button variant="outline" className="w-full mt-4 border-white/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Full Supply Chain
          </Button>
        </CardContent>
      </Card>

      {/* Request Resources */}
      <Card className="glass-card border-white/10 border-cyan-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-cyan-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium">Need Resources?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                If your shelter or community needs supplies, submit a request and we'll coordinate delivery.
              </p>
              <Button className="mt-3 bg-cyan-600 hover:bg-cyan-500">
                Request Resources
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
