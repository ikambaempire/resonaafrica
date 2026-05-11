import { useEffect, lazy, Suspense } from "react";
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
import { OnboardingGate } from "./components/OnboardingGate";

// Landing eagerly loaded (LCP route); everything else split.
import Landing from "./pages/Landing";

const Auth = lazy(() => import("./pages/Auth"));
const Discover = lazy(() => import("./pages/Discover"));
const ChannelPage = lazy(() => import("./pages/ChannelPage"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const ForCreators = lazy(() => import("./pages/ForCreators"));
const ForOrganizations = lazy(() => import("./pages/ForOrganizations"));
const Partnerships = lazy(() => import("./pages/Partnerships"));
const Ecosystem = lazy(() => import("./pages/Ecosystem"));
const Contact = lazy(() => import("./pages/Contact"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));

const CreatorDashboard = lazy(() => import("./pages/dashboard/CreatorDashboard"));
const Content = lazy(() => import("./pages/dashboard/Content"));
const Analytics = lazy(() => import("./pages/dashboard/Analytics"));
const Monetization = lazy(() => import("./pages/dashboard/Monetization"));
const Scheduler = lazy(() => import("./pages/dashboard/Scheduler"));
const Integrations = lazy(() => import("./pages/dashboard/Integrations"));
const AIClips = lazy(() => import("./pages/dashboard/AIClips"));
const SettingsPage = lazy(() => import("./pages/dashboard/SettingsPage"));
const Bookmarks = lazy(() => import("./pages/dashboard/Library"));
const WatchLaterPage = lazy(() => import("./pages/dashboard/Library").then(m => ({ default: m.WatchLaterPage })));

const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminPodcasts = lazy(() => import("./pages/admin/AdminPodcasts"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminEcosystem = lazy(() => import("./pages/admin/AdminEcosystem"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

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
            <Suspense fallback={<RouteFallback />}>
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
                      <Suspense fallback={<RouteFallback />}>
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
                      </Suspense>
                    </DashboardLayout>
                  </ProtectedRoute>
                } />

                {/* Admin console */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminLayout>
                      <Suspense fallback={<RouteFallback />}>
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
                      </Suspense>
                    </AdminLayout>
                  </AdminRoute>
                } />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
