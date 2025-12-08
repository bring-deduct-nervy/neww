import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { UserRole, updateUserRole, getAllUsers } from "@/lib/auth";
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ROLES: { id: UserRole; label: string; color: string }[] = [
  { id: 'USER', label: 'User', color: 'gray' },
  { id: 'VOLUNTEER', label: 'Volunteer', color: 'blue' },
  { id: 'CASE_MANAGER', label: 'Case Manager', color: 'purple' },
  { id: 'COORDINATOR', label: 'Coordinator', color: 'orange' },
  { id: 'ADMIN', label: 'Admin', color: 'cyan' },
  { id: 'SUPER_ADMIN', label: 'Super Admin', color: 'red' },
];

export function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
    } catch (err) {
      console.error('Error updating role:', err);
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      await supabase
        .from('user_profiles')
        .update({ is_active: !isActive })
        .eq('user_id', userId);
      await loadUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-cyan-400" />
              User Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoading}
            className="border-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="glass-card border-cyan-500/30">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-cyan-400 mb-2" />
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-green-500/30">
            <CardContent className="p-4 text-center">
              <UserCheck className="h-5 w-5 mx-auto text-green-400 mb-2" />
              <p className="text-2xl font-bold">{users.filter(u => u.is_active).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-blue-500/30">
            <CardContent className="p-4 text-center">
              <Shield className="h-5 w-5 mx-auto text-blue-400 mb-2" />
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-purple-500/30">
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto text-purple-400 mb-2" />
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'VOLUNTEER').length}</p>
              <p className="text-xs text-muted-foreground">Volunteers</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRoleFilter('ALL')}
              className={cn(
                roleFilter === 'ALL' ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-400" : "border-white/20"
              )}
            >
              All Roles
            </Button>
            {ROLES.map(role => (
              <Button
                key={role.id}
                variant="outline"
                size="sm"
                onClick={() => setRoleFilter(role.id)}
                className={cn(
                  "shrink-0",
                  roleFilter === role.id 
                    ? `bg-${role.color}-500/20 border-${role.color}-500/30 text-${role.color}-400` 
                    : "border-white/20"
                )}
              >
                {role.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Users List */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-lg">Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((user, index) => {
                  const roleConfig = ROLES.find(r => r.id === user.role);
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "p-4 rounded-xl border",
                        user.is_active 
                          ? "bg-white/5 border-white/10" 
                          : "bg-red-500/5 border-red-500/20"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-sm font-bold">
                            {user.full_name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.full_name || 'Unknown'}</span>
                              {!user.is_active && (
                                <Badge variant="destructive" className="text-xs">Inactive</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </span>
                              {user.district && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {user.district}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(user.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.user_id, e.target.value as UserRole)}
                            className={cn(
                              "px-3 py-1 rounded-lg text-sm border",
                              `bg-${roleConfig?.color}-500/20 border-${roleConfig?.color}-500/30 text-${roleConfig?.color}-400`
                            )}
                          >
                            {ROLES.map(role => (
                              <option key={role.id} value={role.id}>{role.label}</option>
                            ))}
                          </select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(user.user_id, user.is_active)}
                            className={user.is_active ? "text-green-400" : "text-red-400"}
                          >
                            {user.is_active ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
