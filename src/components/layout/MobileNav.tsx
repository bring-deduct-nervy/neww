import { Link, useLocation } from "react-router-dom";
import { Home, Map, AlertTriangle, MessageCircle, User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export function MobileNav() {
  const location = useLocation();
  const { isAuthenticated, hasRole } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { path: "/dashboard", icon: Home, label: "Home" },
      { path: "/map", icon: Map, label: "Map" },
      { path: "/report", icon: AlertTriangle, label: "Report" },
      { path: "/chat", icon: MessageCircle, label: "Chat" },
    ];

    if (isAuthenticated) {
      if (hasRole('ADMIN')) {
        baseItems.push({ path: "/admin", icon: Shield, label: "Admin" });
      } else if (hasRole('COORDINATOR')) {
        baseItems.push({ path: "/admin", icon: Shield, label: "Manage" });
      } else if (hasRole('CASE_MANAGER')) {
        baseItems.push({ path: "/cases", icon: Shield, label: "Cases" });
      } else if (hasRole('VOLUNTEER')) {
        baseItems.push({ path: "/volunteer-dashboard", icon: Shield, label: "Tasks" });
      } else {
        baseItems.push({ path: "/profile", icon: User, label: "Profile" });
      }
    } else {
      baseItems.push({ path: "/auth/signin", icon: User, label: "Sign In" });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10 px-2 pb-safe md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/dashboard" && location.pathname === "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-full relative",
                "transition-colors duration-200",
                isActive ? "text-cyan-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-0.5 w-8 h-1 bg-cyan-400 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_rgba(0,199,190,0.5)]")} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
