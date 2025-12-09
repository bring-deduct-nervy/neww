import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MissingPerson, MissingStatus } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { realtimeService } from "@/lib/api/realtime-service";
import {
  Search,
  Plus,
  MapPin,
  Clock,
  Phone,
  Eye,
  User,
  Filter,
  ChevronRight,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Fallback mock data for when database is empty
const fallbackMissingPersons: MissingPerson[] = [
  {
    id: '1',
    name: 'Kamal Perera',
    age: 45,
    gender: 'MALE',
    height: '5\'8"',
    weight: '70kg',
    physicalDesc: 'Medium build, short black hair, wearing glasses',
    clothingDesc: 'Blue shirt, black trousers',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    lastSeenAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastSeenLocation: 'Colombo Fort Railway Station',
    lastSeenLat: 6.9344,
    lastSeenLng: 79.8428,
    district: 'Colombo',
    contactName: 'Mrs. Perera',
    contactPhone: '0771234567',
    status: 'MISSING',
    sightings: [],
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Nimali Silva',
    age: 28,
    gender: 'FEMALE',
    height: '5\'4"',
    weight: '55kg',
    physicalDesc: 'Slim build, long black hair',
    clothingDesc: 'Red saree',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    lastSeenAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    lastSeenLocation: 'Kelaniya Temple',
    lastSeenLat: 6.9553,
    lastSeenLng: 79.9225,
    district: 'Gampaha',
    contactName: 'Mr. Silva',
    contactPhone: '0779876543',
    status: 'SIGHTED',
    sightings: [
      {
        id: '1',
        location: 'Near Kelaniya Bridge',
        latitude: 6.9500,
        longitude: 79.9200,
        description: 'Seen walking towards the river',
        reporterPhone: '0712345678',
        reporterName: 'Anonymous',
        verified: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 44 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Sunil Fernando',
    age: 67,
    gender: 'MALE',
    height: '5\'6"',
    weight: '65kg',
    physicalDesc: 'Grey hair, walks with a slight limp',
    clothingDesc: 'White sarong, brown shirt',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    lastSeenAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    lastSeenLocation: 'Ratnapura Town',
    lastSeenLat: 6.6828,
    lastSeenLng: 80.3992,
    district: 'Ratnapura',
    contactName: 'Daughter',
    contactPhone: '0765432109',
    status: 'FOUND_SAFE',
    sightings: [],
    createdAt: new Date(Date.now() - 70 * 60 * 60 * 1000)
  }
];

const statusConfig: Record<MissingStatus, { label: string; color: string; bgColor: string }> = {
  MISSING: { label: 'Missing', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' },
  SIGHTED: { label: 'Sighted', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30' },
  FOUND_SAFE: { label: 'Found Safe', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30' },
  FOUND_DECEASED: { label: 'Found Deceased', color: 'text-gray-400', bgColor: 'bg-gray-500/20 border-gray-500/30' }
};

export function MissingPersonsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<MissingStatus | 'ALL'>('ALL');
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
  const [missingPersons, setMissingPersons] = useState<MissingPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMissingPersons = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('missing_persons')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            age: p.age,
            gender: p.gender?.toUpperCase() || 'UNKNOWN',
            height: '',
            weight: '',
            physicalDesc: p.description || '',
            clothingDesc: '',
            photo: p.photo_url,
            lastSeenAt: new Date(p.last_seen_date || p.created_at),
            lastSeenLocation: p.last_seen_location || 'Unknown',
            lastSeenLat: p.latitude,
            lastSeenLng: p.longitude,
            district: p.district,
            contactName: p.contact_name,
            contactPhone: p.contact_phone,
            status: p.status === 'FOUND' ? 'FOUND_SAFE' : p.status,
            sightings: [],
            createdAt: new Date(p.created_at)
          }));
          setMissingPersons(mapped);
        } else {
          setMissingPersons(fallbackMissingPersons);
        }
      } catch (err) {
        console.error('Error fetching missing persons:', err);
        setMissingPersons(fallbackMissingPersons);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMissingPersons();

    const unsubscribe = realtimeService.subscribe({
      table: 'missing_persons',
      callback: () => fetchMissingPersons()
    });

    return () => unsubscribe();
  }, []);

  const filteredPersons = missingPersons.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.district?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || person.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

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
              <Search className="h-6 w-6 text-cyan-400" />
              Missing Persons
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Help reunite families during emergencies
            </p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-500">
            <Plus className="h-4 w-4 mr-2" />
            Report Missing
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">
                {missingPersons.filter(p => p.status === 'MISSING').length}
              </p>
              <p className="text-xs text-muted-foreground">Missing</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {missingPersons.filter(p => p.status === 'SIGHTED').length}
              </p>
              <p className="text-xs text-muted-foreground">Sighted</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {missingPersons.filter(p => p.status === 'FOUND_SAFE').length}
              </p>
              <p className="text-xs text-muted-foreground">Found Safe</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, location, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>

        {/* Status Filter */}
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
            All
          </Button>
          {(Object.keys(statusConfig) as MissingStatus[]).map(status => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "shrink-0",
                statusFilter === status ? statusConfig[status].bgColor + ' ' + statusConfig[status].color : "border-white/20"
              )}
            >
              {statusConfig[status].label}
            </Button>
          ))}
        </div>

        {/* Missing Persons List */}
        <div className="space-y-4">
          {filteredPersons.length === 0 ? (
            <Card className="glass-card border-white/10">
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No missing persons found</p>
              </CardContent>
            </Card>
          ) : (
            filteredPersons.map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "glass-card border cursor-pointer transition-all hover:scale-[1.01]",
                    statusConfig[person.status].bgColor
                  )}
                  onClick={() => setSelectedPerson(person)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <Avatar className="h-20 w-20 rounded-xl">
                        <AvatarImage src={person.photo} alt={person.name} />
                        <AvatarFallback className="rounded-xl bg-white/10">
                          <User className="h-8 w-8" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{person.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {person.age} years old • {person.gender?.toLowerCase()}
                            </p>
                          </div>
                          <Badge className={cn("border", statusConfig[person.status].bgColor, statusConfig[person.status].color)}>
                            {statusConfig[person.status].label}
                          </Badge>
                        </div>

                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                            <span className="truncate">{person.lastSeenLocation}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Last seen {formatTimeAgo(person.lastSeenAt)}</span>
                          </div>
                        </div>

                        {person.sightings.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-yellow-400">
                              {person.sightings.length} sighting{person.sightings.length > 1 ? 's' : ''} reported
                            </span>
                          </div>
                        )}
                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground self-center" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Selected Person Details Modal */}
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-end md:items-center justify-center p-4"
            onClick={() => setSelectedPerson(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="glass-card border-white/10 max-h-[80vh] overflow-y-auto">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-24 w-24 rounded-xl">
                      <AvatarImage src={selectedPerson.photo} alt={selectedPerson.name} />
                      <AvatarFallback className="rounded-xl bg-white/10">
                        <User className="h-10 w-10" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{selectedPerson.name}</CardTitle>
                      <Badge className={cn("mt-2 border", statusConfig[selectedPerson.status].bgColor, statusConfig[selectedPerson.status].color)}>
                        {statusConfig[selectedPerson.status].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Age</p>
                      <p className="font-medium">{selectedPerson.age} years</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium capitalize">{selectedPerson.gender?.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Height</p>
                      <p className="font-medium">{selectedPerson.height || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Weight</p>
                      <p className="font-medium">{selectedPerson.weight || 'Unknown'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Physical Description</p>
                    <p className="text-sm">{selectedPerson.physicalDesc || 'No description provided'}</p>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Last Seen Wearing</p>
                    <p className="text-sm">{selectedPerson.clothingDesc || 'No description provided'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-cyan-400" />
                      <span className="font-medium">Last Seen Location</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedPerson.lastSeenLocation}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(selectedPerson.lastSeenAt)}
                    </p>
                  </div>

                  {selectedPerson.sightings.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4 text-yellow-400" />
                        Recent Sightings
                      </h4>
                      <div className="space-y-2">
                        {selectedPerson.sightings.map(sighting => (
                          <div key={sighting.id} className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <p className="text-sm">{sighting.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {sighting.location} • {formatTimeAgo(sighting.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 bg-cyan-600 hover:bg-cyan-500"
                      onClick={() => window.location.href = `tel:${selectedPerson.contactPhone}`}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Family
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/20">
                      <Eye className="h-4 w-4 mr-2" />
                      Report Sighting
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setSelectedPerson(null)}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Help Card */}
        <Card className="glass-card border-white/10 border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-cyan-400 mt-0.5" />
              <div>
                <h4 className="font-medium">Have you seen someone?</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  If you have information about any missing person, please report a sighting immediately. Your information could help reunite families.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
