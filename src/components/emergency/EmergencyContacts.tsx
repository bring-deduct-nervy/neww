import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Shield, Flame, Heart, Building2, Anchor, Plane, Zap, Droplets } from "lucide-react";
import { EMERGENCY_CONTACTS } from "@/lib/constants";
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

interface EmergencyContactsProps {
  compact?: boolean;
}

export function EmergencyContacts({ compact = false }: EmergencyContactsProps) {
  const contacts = compact ? EMERGENCY_CONTACTS.slice(0, 4) : EMERGENCY_CONTACTS;

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Phone className="h-5 w-5 text-cyan-400" />
          Emergency Numbers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={compact ? "grid grid-cols-2 gap-3" : "space-y-2"}>
          {contacts.map((contact, index) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {compact ? (
                <Button
                  variant="outline"
                  className={`w-full h-16 flex flex-col items-center justify-center border ${categoryColors[contact.category]}`}
                  onClick={() => window.location.href = `tel:${contact.phone}`}
                >
                  <span className="font-bold text-lg">{contact.phone}</span>
                  <span className="text-xs opacity-80">{contact.name.split(' ')[0]}</span>
                </Button>
              ) : (
                <div
                  className={`flex items-center justify-between p-3 rounded-xl border ${categoryColors[contact.category]} bg-opacity-10`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${categoryColors[contact.category]}`}>
                      {categoryIcons[contact.category] || <Phone className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.organization}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-white/10 hover:bg-white/20 border-0"
                    onClick={() => window.location.href = `tel:${contact.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    {contact.phone}
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
