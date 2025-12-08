import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Phone,
  MapPin,
  Bell,
  Shield,
  Globe,
  Moon,
  Volume2,
  Vibrate,
  LogOut,
  ChevronRight,
  Edit,
  CheckCircle,
  Heart,
  AlertTriangle,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProfilePage() {
  const [notifications, setNotifications] = useState({
    pushAlerts: true,
    soundAlerts: true,
    vibration: true,
    locationAlerts: true,
  });

  const user = {
    name: "Kasun Perera",
    phone: "+94 77 123 4567",
    district: "Colombo",
    isVerified: true,
    isVolunteer: true,
    joinedDate: "January 2024",
    stats: {
      reportsSubmitted: 5,
      volunteeredHours: 48,
      peopleHelped: 156
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-white/10 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-600/30 to-purple-600/30 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-white/20">
                  <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-purple-500 text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    {user.isVerified && (
                      <CheckCircle className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.district}
                    </Badge>
                    {user.isVolunteer && (
                      <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                        <Heart className="h-3 w-3 mr-1" />
                        Volunteer
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <Edit className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Stats */}
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-cyan-400">{user.stats.reportsSubmitted}</p>
                  <p className="text-xs text-muted-foreground">Reports</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-400">{user.stats.volunteeredHours}</p>
                  <p className="text-xs text-muted-foreground">Hours</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-400">{user.stats.peopleHelped}</p>
                  <p className="text-xs text-muted-foreground">Helped</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-cyan-400" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Push Alerts"
              description="Receive emergency alerts"
              checked={notifications.pushAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, pushAlerts: checked })}
            />
            <SettingRow
              icon={<Volume2 className="h-5 w-5" />}
              title="Sound Alerts"
              description="Play sound for critical alerts"
              checked={notifications.soundAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, soundAlerts: checked })}
            />
            <SettingRow
              icon={<Vibrate className="h-5 w-5" />}
              title="Vibration"
              description="Vibrate for alerts"
              checked={notifications.vibration}
              onCheckedChange={(checked) => setNotifications({ ...notifications, vibration: checked })}
            />
            <SettingRow
              icon={<MapPin className="h-5 w-5" />}
              title="Location-based Alerts"
              description="Only alerts for your area"
              checked={notifications.locationAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, locationAlerts: checked })}
            />
          </CardContent>
        </Card>

        {/* App Settings */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              App Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingLink
              icon={<Globe className="h-5 w-5" />}
              title="Language"
              value="English"
            />
            <SettingLink
              icon={<Moon className="h-5 w-5" />}
              title="Theme"
              value="Dark"
            />
            <SettingLink
              icon={<MapPin className="h-5 w-5" />}
              title="Default District"
              value={user.district}
            />
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-400" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingLink
              icon={<Phone className="h-5 w-5" />}
              title="Phone Number"
              value={user.phone}
            />
            <SettingLink
              icon={<Shield className="h-5 w-5" />}
              title="Privacy Settings"
            />
            <SettingLink
              icon={<Clock className="h-5 w-5" />}
              title="Activity History"
            />
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These contacts will be notified when you send an SOS
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium">Wife - Nimali</p>
                  <p className="text-sm text-muted-foreground">+94 77 987 6543</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="font-medium">Brother - Ruwan</p>
                  <p className="text-sm text-muted-foreground">+94 71 234 5678</p>
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
              <Button variant="outline" className="w-full border-white/20">
                + Add Emergency Contact
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="glass-card border-white/10">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">App Version</span>
              <span className="text-sm">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Member Since</span>
              <span className="text-sm">{user.joinedDate}</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  checked,
  onCheckedChange
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function SettingLink({
  icon,
  title,
  value
}: {
  icon: React.ReactNode;
  title: string;
  value?: string;
}) {
  return (
    <button className="w-full flex items-center justify-between py-3 px-1 hover:bg-white/5 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <span className="font-medium text-sm">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
}
