import { Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
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

function AppContent() {
  const location = useLocation();
  const isLandingOrAuth = location.pathname === '/landing' || location.pathname.startsWith('/auth');

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
      <Header alertCount={3} />
      <OfflineIndicator />
      <main>
        <Routes>
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfilePage />} />
          {/* DRACP Routes */}
          <Route path="/cases" element={<CaseManagementPage />} />
          <Route path="/register" element={<BeneficiaryRegistrationPage />} />
          <Route path="/volunteer-dashboard" element={<VolunteerDashboardPage />} />
          <Route path="/broadcast" element={<BroadcastPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/track" element={<CaseTrackingPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/import" element={<DataImportPage />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
          <Route path="/resources" element={<ResourceManagementPage />} />
        </Routes>
      </main>
      <MobileNav />
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
