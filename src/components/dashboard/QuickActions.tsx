import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Map,
  Search,
  Heart,
  Phone,
  CloudSun,
  Building2,
  AlertTriangle,
  MessageCircle
} from "lucide-react";

const actions = [
  { path: "/map", icon: Map, label: "Crisis Map", color: "from-blue-600 to-blue-400", emoji: "🗺️" },
  { path: "/missing", icon: Search, label: "Missing", color: "from-purple-600 to-purple-400", emoji: "🔍" },
  { path: "/volunteer", icon: Heart, label: "Volunteer", color: "from-green-600 to-green-400", emoji: "🤝" },
  { path: "/directory", icon: Phone, label: "Emergency", color: "from-red-600 to-red-400", emoji: "📞" },
  { path: "/weather", icon: CloudSun, label: "Weather", color: "from-cyan-600 to-cyan-400", emoji: "🌤️" },
  { path: "/shelters", icon: Building2, label: "Shelters", color: "from-orange-600 to-orange-400", emoji: "🏕️" },
  { path: "/alerts", icon: AlertTriangle, label: "Alerts", color: "from-yellow-600 to-yellow-400", emoji: "⚠️" },
  { path: "/chat", icon: MessageCircle, label: "AI Help", color: "from-violet-600 to-violet-400", emoji: "🤖" },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.path}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link to={action.path}>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex flex-col items-center justify-center p-3 rounded-xl
                bg-gradient-to-br ${action.color} bg-opacity-20
                border border-white/10 backdrop-blur-sm
                transition-all duration-200 cursor-pointer
                hover:shadow-lg hover:shadow-white/5
              `}
            >
              <span className="text-2xl mb-1">{action.emoji}</span>
              <span className="text-xs font-medium text-white/90">{action.label}</span>
            </motion.div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
