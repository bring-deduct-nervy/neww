import { Bell, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  alertCount?: number;
}

export function Header({ alertCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-card border-b border-white/10">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="glass-card border-white/10">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-2xl">🆘</span>
                  <span className="gradient-text font-bold">ResQ-Unified</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 space-y-2">
                <NavLink to="/" label="Dashboard" />
                <NavLink to="/map" label="Crisis Map" />
                <NavLink to="/report" label="Report Emergency" />
                <NavLink to="/shelters" label="Find Shelters" />
                <NavLink to="/missing" label="Missing Persons" />
                <NavLink to="/weather" label="Weather" />
                <NavLink to="/flood-monitor" label="Flood Monitor" />
                <NavLink to="/alerts" label="Alerts" />
                <NavLink to="/volunteer" label="Volunteer" />
                <NavLink to="/directory" label="Emergency Contacts" />
                <NavLink to="/donate" label="Donate" />
                <NavLink to="/chat" label="AI Assistant" />
                <div className="border-t border-white/10 my-4" />
                <p className="text-xs text-muted-foreground px-4 mb-2">DRACP System</p>
                <NavLink to="/register" label="Register for Aid" />
                <NavLink to="/track" label="Track Case" />
                <NavLink to="/cases" label="Case Management" />
                <NavLink to="/volunteer-dashboard" label="Volunteer Portal" />
                <NavLink to="/broadcast" label="Broadcast Center" />
                <NavLink to="/admin" label="Admin Dashboard" />
                <NavLink to="/admin/settings" label="API Settings" />
                <NavLink to="/admin/users" label="User Management" />
                <NavLink to="/admin/import" label="Data Import" />
                <NavLink to="/admin/analytics" label="Analytics" />
                <NavLink to="/admin/resources" label="Resources" />
              </nav>
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🆘</span>
            <span className="font-bold text-lg gradient-text hidden sm:inline">ResQ-Unified</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/alerts">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {alertCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {alertCount > 9 ? '9+' : alertCount}
                </Badge>
              )}
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-foreground"
    >
      {label}
    </Link>
  );
}
