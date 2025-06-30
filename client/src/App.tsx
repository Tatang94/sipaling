import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import SplashScreen from "@/pages/splash";
import OnboardingPage from "@/pages/onboarding";
import Home from "@/pages/home";
import Search from "@/pages/search";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import BantuanPage from "@/pages/bantuan";
import PaymentPage from "@/pages/payment";
import NotFound from "@/pages/not-found";

function Router() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Skip splash and onboarding for deployment demo
    if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('replit.dev')) {
      setShowSplash(false);
      setShowOnboarding(false);
      return;
    }

    const hasSeenSplash = localStorage.getItem("hasSeenSplash");
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    
    if (hasSeenSplash) {
      setShowSplash(false);
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    } else {
      const timer = setTimeout(() => {
        setShowSplash(false);
        localStorage.setItem("hasSeenSplash", "true");
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  if (showOnboarding) {
    return <OnboardingPage />;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/home" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/splash" component={SplashScreen} />
      <Route path="/bantuan" component={BantuanPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
