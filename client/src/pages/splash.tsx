import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Sparkles } from "lucide-react";

export default function SplashScreen() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLocation("/"), 500);
          return 100;
        }
        return prev + 0.33;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-green-500 to-emerald-600 flex items-center justify-center relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, Math.random() * 100, 0],
              y: [0, Math.random() * 100, 0],
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="text-center z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-3 border-white/30 border-t-white"
            />
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Home className="w-12 h-12 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
            SI PALING KOST
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-1 bg-white/50 rounded-full mx-auto mb-3"
            style={{ maxWidth: "150px" }}
          />
          <p className="text-lg text-white/90 font-light">
            Platform Terdepan Pencarian Kos Indonesia
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center space-x-2 text-white/80">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Memuat pengalaman terbaik...</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-48 h-1.5 bg-white/20 rounded-full mx-auto overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          
          <div className="text-white/60 text-xs font-medium">
            {progress}%
          </div>
        </motion.div>

        {/* Bottom Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mt-8 grid grid-cols-3 gap-6 max-w-xs mx-auto"
        >
          {[
            { icon: "🏠", text: "Ribuan Kos" },
            { icon: "⚡", text: "Booking Instan" },
            { icon: "🔒", text: "100% Aman" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-xl mb-1">{feature.icon}</div>
              <div className="text-white/80 text-xs font-medium">{feature.text}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}