import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Phone, MapPin, AlertTriangle, Loader2 } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { motion } from "framer-motion";

interface SOSButtonProps {
  onSOSClick: (location: { lat: number; lng: number }) => void;
}

export function SOSButton({ onSOSClick }: SOSButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const { getLocation } = useGeolocation();

  const handleSOSClick = async () => {
    setIsLocating(true);
    try {
      const location = await getLocation();
      onSOSClick({ lat: location.latitude, lng: location.longitude });
      setIsOpen(false);
    } catch {
      setIsOpen(true);
    } finally {
      setIsLocating(false);
    }
  };

  const handleCall119 = () => {
    window.location.href = 'tel:119';
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full"
      >
        <Button
          size="lg"
          variant="destructive"
          className="w-full h-20 text-xl font-bold rounded-2xl shadow-lg transition-all pulse-sos glow-critical bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 border-2 border-red-400/50"
          onClick={handleSOSClick}
          disabled={isLocating}
        >
          {isLocating ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Getting Location...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-6 w-6" />
              🆘 REQUEST HELP
            </>
          )}
        </Button>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md glass-card border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Emergency Assistance
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              We couldn't get your exact location. You can still request help or call emergency services directly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <Button
              variant="destructive"
              className="w-full h-14 text-lg glow-critical"
              onClick={handleCall119}
            >
              <Phone className="mr-2 h-5 w-5" />
              Call 119 (Emergency)
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 border-white/20 hover:bg-white/10"
              onClick={() => {
                setIsOpen(false);
                onSOSClick({ lat: 0, lng: 0 });
              }}
            >
              <MapPin className="mr-2 h-5 w-5" />
              Enter Location Manually
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
