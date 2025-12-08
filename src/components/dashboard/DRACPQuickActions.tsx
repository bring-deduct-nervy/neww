import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Search,
  ClipboardList,
  Users,
  Megaphone,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";

const dracpActions = [
  {
    path: "/register",
    icon: <UserPlus className="h-5 w-5" />,
    label: "Register for Aid",
    description: "Submit a request for assistance",
    color: "from-green-600 to-emerald-600",
    emoji: "📝"
  },
  {
    path: "/track",
    icon: <Search className="h-5 w-5" />,
    label: "Track Case",
    description: "Check your case status",
    color: "from-blue-600 to-cyan-600",
    emoji: "🔍"
  },
  {
    path: "/cases",
    icon: <ClipboardList className="h-5 w-5" />,
    label: "Case Management",
    description: "For case managers",
    color: "from-purple-600 to-violet-600",
    emoji: "📋"
  },
  {
    path: "/volunteer-dashboard",
    icon: <Users className="h-5 w-5" />,
    label: "Volunteer Portal",
    description: "View assignments",
    color: "from-orange-600 to-amber-600",
    emoji: "🤝"
  },
  {
    path: "/broadcast",
    icon: <Megaphone className="h-5 w-5" />,
    label: "Broadcast",
    description: "Mass communication",
    color: "from-pink-600 to-rose-600",
    emoji: "📢"
  },
  {
    path: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Admin Dashboard",
    description: "System overview",
    color: "from-cyan-600 to-teal-600",
    emoji: "📊"
  }
];

export function DRACPQuickActions() {
  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-cyan-400" />
          Relief Coordination System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {dracpActions.map((action, index) => (
            <motion.div
              key={action.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={action.path}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-xl
                    bg-gradient-to-br ${action.color} bg-opacity-20
                    border border-white/10 backdrop-blur-sm
                    transition-all duration-200 cursor-pointer
                    hover:shadow-lg hover:shadow-white/5
                    min-h-[100px]
                  `}
                >
                  <span className="text-2xl mb-2">{action.emoji}</span>
                  <span className="text-sm font-medium text-white/90 text-center">{action.label}</span>
                  <span className="text-xs text-white/60 text-center mt-1">{action.description}</span>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
