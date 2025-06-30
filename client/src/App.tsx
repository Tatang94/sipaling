import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import SplashScreen from "@/pages/splash";
import OnboardingPage from "@/pages/onboarding";
import Home from "@/pages/home";
import Search from "@/pages/search";
import CariLokasiPage from "@/pages/cari-lokasi";
import NearbyKosPage from "@/pages/nearby-kos";
import LoginPage from "@/pages/login";
import FaceLoginPage from "@/pages/face-login";
import FaceRegisterPage from "@/pages/face-register";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import BantuanPage from "@/pages/bantuan";
import PaymentPage from "@/pages/payment";
import DaftarKosPage from "@/pages/daftar-kos";
import TentangPage from "@/pages/tentang";
import FAQPage from "@/pages/faq";
import KontakPage from "@/pages/kontak";
import PrivasiPage from "@/pages/privasi";
import SyaratPage from "@/pages/syarat";
import DukunganPage from "@/pages/dukungan";
import AdminScraper from "@/pages/admin-scraper";
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
      <Route path="/cari-lokasi" component={CariLokasiPage} />
      <Route path="/nearby" component={NearbyKosPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/face-login" component={FaceLoginPage} />
      <Route path="/face-register" component={FaceRegisterPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/payment" component={PaymentPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/splash" component={SplashScreen} />
      <Route path="/bantuan" component={BantuanPage} />
      <Route path="/daftar-kos" component={DaftarKosPage} />
      <Route path="/tentang" component={TentangPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/kontak" component={KontakPage} />
      <Route path="/privasi" component={PrivasiPage} />
      <Route path="/syarat" component={SyaratPage} />
      <Route path="/dukungan" component={DukunganPage} />
      <Route path="/admin-scraper" component={AdminScraper} />
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
