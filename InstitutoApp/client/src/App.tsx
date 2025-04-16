import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import ProfilePage from "@/pages/profile-page";
import MyCoursesPage from "@/pages/my-courses-page";
import AchievementsPage from "@/pages/achievements-page";
import CourseDetailPage from "@/pages/course-detail-page";
import AllCoursesPage from "@/pages/all-courses-page";
import AboutPage from "@/pages/about-page";
import HelpPage from "@/pages/help-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/my-courses" component={MyCoursesPage} />
      <ProtectedRoute path="/achievements" component={AchievementsPage} />
      <ProtectedRoute path="/course/:id" component={CourseDetailPage} />
      <ProtectedRoute path="/courses" component={AllCoursesPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/help" component={HelpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="bg-gray-100 min-h-screen flex justify-center">
          <div className="max-w-md w-full bg-white relative shadow">
            <Router />
            <Toaster />
          </div>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
