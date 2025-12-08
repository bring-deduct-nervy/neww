import { Bell, Settings, Menu, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/lib/auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  alertCount?: number;
}

export function Header({ alertCount = 0 }: HeaderProps) {
  const { user, profile, isAuthenticated, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/landing');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'text-red-400';
      case 'ADMIN': return 'text-orange-400';
      case 'COORDINATOR': return 'text-purple-400';
      case 'CASE_MANAGER': return 'text-blue-400';
      case 'VOLUNTEER': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

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
            <SheetContent side="left" className="glass-card border-white/10 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <span className="text-2xl">🆘</span>
                  <span className="gradient-text font-bold">ResQ-Unified</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 space-y-2">
                <NavLink to="/dashboard" label="Dashboard" />
                <NavLink to="/map" label="Crisis Map" />
                <NavLink to="/report" label="Report Emergency" />
                <NavLink to="/shelters" label="Find Shelters" />
                <NavLink to="/missing" label="Missing Persons" />
                <NavLink to="/weather" label="Weather" />
                <NavLink to="/alerts" label="Alerts" />
                <NavLink to="/volunteer" label="Volunteer" />
                <NavLink to="/directory" label="Emergency Contacts" />
                <NavLink to="/donate" label="Donate" />
                <NavLink to="/chat" label="AI Assistant" />
                
                {isAuthenticated && (
                  <>
                    <div className="border-t border-white/10 my-4" />
                    <p className="text-xs text-muted-foreground px-4 mb-2">DRACP System</p>
                    <NavLink to="/register" label="Register for Aid" />
                    <NavLink to="/track" label="Track Case" />
                    
                    {hasRole('VOLUNTEER') && (
                      <NavLink to="/volunteer-dashboard" label="Volunteer Portal" />
                    )}
                    
                    {hasRole('CASE_MANAGER') && (
                      <>
                        <NavLink to="/cases" label="Case Management" />
                        <NavLink to="/beneficiaries" label="Beneficiaries" />
                      </>
                    )}
                    
                    {hasRole('COORDINATOR') && (
                      <>
                        <NavLink to="/broadcast" label="Broadcast Center" />
                        <NavLink to="/resources" label="Resources" />
                      </>
                    )}
                    
                    {hasRole('ADMIN') && (
                      <>
                        <div className="border-t border-white/10 my-4" />
                        <p className="text-xs text-muted-foreground px-4 mb-2">Admin</p>
                        <NavLink to="/admin" label="Admin Dashboard" />
                        <NavLink to="/admin/settings" label="API Settings" />
                        <NavLink to="/admin/users" label="User Management" />
                        <NavLink to="/admin/import" label="Data Import" />
                        <NavLink to="/admin/analytics" label="Analytics" />
                      </>
                    )}
                  </>
                )}
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
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-cyan-600 text-white text-xs">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-white/10">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{profile?.full_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{user?.email}</span>
                    {profile?.role && (
                      <Badge variant="outline" className={`mt-1 text-xs w-fit ${getRoleColor(profile.role)}`}>
                        {profile.role.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth/signin">
              <Button variant="outline" size="sm" className="border-white/20">
                Sign In
              </Button>
            </Link>
          )}
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
