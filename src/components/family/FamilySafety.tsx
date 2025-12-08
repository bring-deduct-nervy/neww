import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Navigation,
  Plus,
  Bell,
  Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  photo?: string;
  status: 'SAFE' | 'UNKNOWN' | 'NEEDS_HELP';
  lastSeen?: Date;
  lastLocation?: string;
  latitude?: number;
  longitude?: number;
}

const mockFamilyMembers: FamilyMember[] = [
  {
    id: '1',
    name: 'Nimali (Wife)',
    phone: '+94 77 987 6543',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    status: 'SAFE',
    lastSeen: new Date(Date.now() - 5 * 60 * 1000),
    lastLocation: 'Home - Colombo 07',
    latitude: 6.9271,
    longitude: 79.8612
  },
  {
    id: '2',
    name: 'Ruwan (Brother)',
    phone: '+94 71 234 5678',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    status: 'SAFE',
    lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    lastLocation: 'Office - Colombo Fort',
    latitude: 6.9344,
    longitude: 79.8428
  },
  {
    id: '3',
    name: 'Amma (Mother)',
    phone: '+94 77 111 2222',
    status: 'UNKNOWN',
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    lastLocation: 'Kelaniya',
    latitude: 6.9553,
    longitude: 79.9225
  }
];

const statusConfig = {
  SAFE: { label: 'Safe', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30', icon: <CheckCircle className="h-4 w-4" /> },
  UNKNOWN: { label: 'Unknown', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30', icon: <AlertTriangle className="h-4 w-4" /> },
  NEEDS_HELP: { label: 'Needs Help', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30', icon: <AlertTriangle className="h-4 w-4" /> }
};

export function FamilySafety() {
  const [members, setMembers] = useState(mockFamilyMembers);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsCheckingIn(false);
    // Show success message
  };

  const formatTimeAgo = (date?: Date) => {
    if (!date) return 'Unknown';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const safeCount = members.filter(m => m.status === 'SAFE').length;
  const unknownCount = members.filter(m => m.status === 'UNKNOWN').length;

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            Family Safety
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {safeCount} Safe
            </Badge>
            {unknownCount > 0 && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                {unknownCount} Unknown
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Check-in Button */}
        <Button
          className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
          onClick={handleCheckIn}
          disabled={isCheckingIn}
        >
          {isCheckingIn ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Checking In...
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              I'm Safe - Check In
            </>
          )}
        </Button>

        {/* Family Members */}
        <div className="space-y-3">
          {members.map((member, index) => {
            const status = statusConfig[member.status];

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-3 rounded-xl border",
                  status.bgColor
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.photo} alt={member.name} />
                    <AvatarFallback className="bg-white/10">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge className={cn("h-5 border", status.bgColor, status.color)}>
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {member.lastLocation && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {member.lastLocation}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(member.lastSeen)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.location.href = `tel:${member.phone}`}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                    {member.latitude && member.longitude && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(
                          `https://www.google.com/maps/dir/?api=1&destination=${member.latitude},${member.longitude}`,
                          '_blank'
                        )}
                      >
                        <Navigation className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Add Member */}
        <Button variant="outline" className="w-full border-white/20">
          <Plus className="h-4 w-4 mr-2" />
          Add Family Member
        </Button>

        {/* Request Check-in */}
        <Button variant="ghost" className="w-full text-cyan-400">
          <Bell className="h-4 w-4 mr-2" />
          Request Check-in from All
        </Button>
      </CardContent>
    </Card>
  );
}
