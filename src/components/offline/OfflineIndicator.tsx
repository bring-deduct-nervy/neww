import { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-14 left-0 right-0 z-50 bg-orange-600 text-white px-4 py-2 flex items-center justify-center gap-2"
        >
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're offline. Some features may be limited.</span>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-14 left-0 right-0 z-50 bg-green-600 text-white px-4 py-2 flex items-center justify-center gap-2"
        >
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online! Syncing data...</span>
          <RefreshCw className="h-4 w-4 animate-spin" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
