import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdminLayout } from "@/components/layout/AdminLayout";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Discover from "./pages/Discover";
import ChannelPage from "./pages/ChannelPage";
import About from "./pages/About";
import Services from "./pages/Services";
import HowItWorks from "./pages/HowItWorks";
import ForCreators from "./pages/ForCreators";
import ForOrganizations from "./pages/ForOrganizations";
import Partnerships from "./pages/Partnerships";
import Ecosystem from "./pages/Ecosystem";
import Contact from "./pages/Contact";
import CreatorDashboard from "./pages/dashboard/CreatorDashboard";
import Content from "./pages/dashboard/Content";
import Analytics from "./pages/dashboard/Analytics";
import Monetization from "./pages/dashboard/Monetization";
import Scheduler from "./pages/dashboard/Scheduler";
import Integrations from "./pages/dashboard/Integrations";
import AIClips from "./pages/dashboard/AIClips";
import SettingsPage from "./pages/dashboard/SettingsPage";
import Bookmarks, { WatchLaterPage } from "./pages/dashboard/Library";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminPodcasts from "./pages/admin/AdminPodcasts";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminEcosystem from "./pages/admin/AdminEcosystem";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import ProfilePage from "./pages/ProfilePage";
import Onboarding from "./pages/Onboarding";
import { OnboardingGate } from "./components/OnboardingGate";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="resona-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <OnboardingGate />
            <Routes>
              {/* Public */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/u/:username" element={<ProfilePage />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/c/:slug" element={<ChannelPage />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/for-creators" element={<ForCreators />} />
              <Route path="/for-organizations" element={<ForOrganizations />} />
              <Route path="/partnerships" element={<Partnerships />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/roadmap" element={<Navigate to="/ecosystem" replace />} />
              <Route path="/contact" element={<Contact />} />

              {/* Creator dashboard */}
              <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="overview" element={<CreatorDashboard />} />
                      <Route path="content" element={<Content />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="monetization" element={<Monetization />} />
                      <Route path="scheduler" element={<Scheduler />} />
                      <Route path="ai-clips" element={<AIClips />} />
                      <Route path="bookmarks" element={<Bookmarks />} />
                      <Route path="watch-later" element={<WatchLaterPage />} />
                      <Route path="integrations" element={<Integrations />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* Admin console */}
              <Route path="/admin/*" element={
                <AdminRoute>
                  <AdminLayout>
                    <Routes>
                      <Route index element={<AdminOverview />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="roles" element={<AdminRoles />} />
                      <Route path="podcasts" element={<AdminPodcasts />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="revenue" element={<AdminRevenue />} />
                      <Route path="announcements" element={<AdminAnnouncements />} />
                      <Route path="messages" element={<AdminMessages />} />
                      <Route path="ecosystem" element={<AdminEcosystem />} />
                      <Route path="reports" element={<AdminReports />} />
                      <Route path="analytics" element={<AdminAnalytics />} />
                      <Route path="settings" element={<AdminSettings />} />
                    </Routes>
                  </AdminLayout>
                </AdminRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
