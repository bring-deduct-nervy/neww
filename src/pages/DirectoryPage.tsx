import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EMERGENCY_CONTACTS } from "@/lib/constants";
import { EmergencyContact, ContactCategory } from "@/lib/types";
import {
  Phone,
  Search,
  Shield,
  Flame,
  Heart,
  Building2,
  Anchor,
  Plane,
  Zap,
  Droplets,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

const categoryIcons: Record<string, React.ReactNode> = {
  POLICE: <Shield className="h-5 w-5" />,
  FIRE: <Flame className="h-5 w-5" />,
  AMBULANCE: <Heart className="h-5 w-5" />,
  HOSPITAL: <Heart className="h-5 w-5" />,
  MILITARY: <Shield className="h-5 w-5" />,
  NAVY: <Anchor className="h-5 w-5" />,
  AIR_FORCE: <Plane className="h-5 w-5" />,
  DISASTER_MANAGEMENT: <Building2 className="h-5 w-5" />,
  UTILITY: <Zap className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  POLICE: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  FIRE: "bg-orange-500/20 border-orange-500/30 text-orange-400",
  AMBULANCE: "bg-red-500/20 border-red-500/30 text-red-400",
  HOSPITAL: "bg-pink-500/20 border-pink-500/30 text-pink-400",
  MILITARY: "bg-green-500/20 border-green-500/30 text-green-400",
  NAVY: "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
  AIR_FORCE: "bg-sky-500/20 border-sky-500/30 text-sky-400",
  DISASTER_MANAGEMENT: "bg-purple-500/20 border-purple-500/30 text-purple-400",
  UTILITY: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
};

const priorityContacts = ['119', '1990', '110', '117'];

export function DirectoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | 'ALL'>('ALL');

  const filteredContacts = EMERGENCY_CONTACTS.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);
    const matchesCategory = selectedCategory === 'ALL' || contact.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories: ContactCategory[] = [
    'POLICE', 'AMBULANCE', 'FIRE', 'DISASTER_MANAGEMENT',
    'MILITARY', 'NAVY', 'AIR_FORCE', 'HOSPITAL', 'UTILITY'
  ];

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Phone className="h-6 w-6 text-cyan-400" />
            Emergency Directory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quick access to emergency services
          </p>
        </motion.div>

        {/* Priority Contacts */}
        <Card className="glass-card border-white/10 border-red-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Priority Emergency Numbers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {EMERGENCY_CONTACTS.filter(c => priorityContacts.includes(c.phone)).map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full h-20 flex flex-col items-center justify-center border-2 ${categoryColors[contact.category]} hover:scale-105 transition-transform`}
                    onClick={() => window.location.href = `tel:${contact.phone}`}
                  >
                    <span className="text-3xl font-bold">{contact.phone}</span>
                    <span className="text-xs opacity-80">{contact.name.split(' ')[0]}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCategory('ALL')}
            className={`shrink-0 ${selectedCategory === 'ALL' ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400' : 'border-white/20'}`}
          >
            All
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 ${selectedCategory === category ? categoryColors[category] : 'border-white/20'}`}
            >
              {category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
        </div>

        {/* Contacts List */}
        <div className="space-y-3">
          {filteredContacts.length === 0 ? (
            <Card className="glass-card border-white/10">
              <CardContent className="p-8 text-center">
                <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No contacts found</p>
              </CardContent>
            </Card>
          ) : (
            filteredContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className={`glass-card border ${categoryColors[contact.category]}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${categoryColors[contact.category]}`}>
                          {categoryIcons[contact.category] || <Phone className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-semibold">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.organization}</p>
                          {contact.district && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              {contact.district}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="bg-white/10 hover:bg-white/20 border-0 glow-primary"
                        onClick={() => window.location.href = `tel:${contact.phone}`}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        {contact.phone}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Emergency Tips */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">When Calling Emergency Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">1.</span>
                Stay calm and speak clearly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">2.</span>
                State your location first (address, landmarks)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">3.</span>
                Describe the emergency briefly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">4.</span>
                Mention number of people affected
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">5.</span>
                Don't hang up until told to do so
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
