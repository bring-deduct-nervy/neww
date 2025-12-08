import { Suspense, useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import { Toaster } from "@/components/ui/toaster";
import { Dashboard } from "@/pages/Dashboard";
import { WeatherPage } from "@/pages/WeatherPage";
import { AlertsPage } from "@/pages/AlertsPage";
import { SheltersPage } from "@/pages/SheltersPage";
import { DirectoryPage } from "@/pages/DirectoryPage";
import { ReportPage } from "@/pages/ReportPage";
import { ChatPage } from "@/pages/ChatPage";
import { MapPage } from "@/pages/MapPage";
import { MissingPersonsPage } from "@/pages/MissingPersonsPage";
import { VolunteerPage } from "@/pages/VolunteerPage";
import { DonatePage } from "@/pages/DonatePage";
import { ProfilePage } from "@/pages/ProfilePage";
import { CaseManagementPage } from "@/pages/CaseManagementPage";
import { BeneficiaryRegistrationPage } from "@/pages/BeneficiaryRegistrationPage";
import { VolunteerDashboardPage } from "@/pages/VolunteerDashboardPage";
import { BroadcastPage } from "@/pages/BroadcastPage";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { CaseTrackingPage } from "@/pages/CaseTrackingPage";
import { AdminSettingsPage } from "@/pages/AdminSettingsPage";
import { UserManagementPage } from "@/pages/UserManagementPage";
import { DataImportPage } from "@/pages/DataImportPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ResourceManagementPage } from "@/pages/ResourceManagementPage";
import { LandingPage } from "@/pages/LandingPage";
import { AuthPage } from "@/pages/AuthPage";
import { supabase } from "@/lib/supabase";

// Protected Route Component
function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  if (requiredRole && !hasRole(requiredRole as any)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const isLandingOrAuth = location.pathname === '/landing' || location.pathname.startsWith('/auth');

  // Fetch active alerts count
  useEffect(() => {
    const fetchAlertCount = async () => {
      const { count } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      setAlertCount(count || 0);
    };

    fetchAlertCount();

    // Subscribe to alerts changes
    const channel = supabase
      .channel('alerts_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        fetchAlertCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLandingOrAuth) {
    return (
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/auth/signin" element={<AuthPage mode="signin" />} />
        <Route path="/auth/signup" element={<AuthPage mode="signup" />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header alertCount={alertCount} />
      <OfflineIndicator />
      <main className="pb-20">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/shelters" element={<SheltersPage />} />
          <Route path="/directory" element={<DirectoryPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/missing" element={<MissingPersonsPage />} />
          <Route path="/volunteer" element={<VolunteerPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/register" element={<BeneficiaryRegistrationPage />} />
          <Route path="/track" element={<CaseTrackingPage />} />
          
          {/* Protected Routes */}
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          
          {/* Volunteer Routes */}
          <Route path="/volunteer-dashboard" element={<ProtectedRoute requiredRole="VOLUNTEER"><VolunteerDashboardPage /></ProtectedRoute>} />
          
          {/* Case Manager Routes */}
          <Route path="/cases" element={<ProtectedRoute requiredRole="CASE_MANAGER"><CaseManagementPage /></ProtectedRoute>} />
          
          {/* Coordinator Routes */}
          <Route path="/broadcast" element={<ProtectedRoute requiredRole="COORDINATOR"><BroadcastPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requiredRole="ADMIN"><AdminSettingsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="ADMIN"><UserManagementPage /></ProtectedRoute>} />
          <Route path="/admin/import" element={<ProtectedRoute requiredRole="ADMIN"><DataImportPage /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="ADMIN"><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute requiredRole="ADMIN"><ResourceManagementPage /></ProtectedRoute>} />
        </Routes>
      </main>
      <MobileNav />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-cyan-500 border-t-transparent rounded-full" /></div>}>
      <AppContent />
    </Suspense>
  );
}

export default App;
