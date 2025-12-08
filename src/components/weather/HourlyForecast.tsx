import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { HourlyForecast as HourlyForecastType } from "@/lib/types";
import { WEATHER_CODES } from "@/lib/constants";
import { Clock, Droplets } from "lucide-react";
import { motion } from "framer-motion";

interface HourlyForecastProps {
  forecast: HourlyForecastType[];
}

export function HourlyForecast({ forecast }: HourlyForecastProps) {
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  const isNow = (timeStr: string) => {
    const now = new Date();
    const forecastTime = new Date(timeStr);
    return Math.abs(now.getTime() - forecastTime.getTime()) < 30 * 60 * 1000;
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-cyan-400" />
          Hourly Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-2">
            {forecast.slice(0, 24).map((hour, index) => {
              const weatherIcon = WEATHER_CODES[hour.weatherCode]?.icon || '🌤️';
              const now = isNow(hour.time);

              return (
                <motion.div
                  key={hour.time}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className={`flex flex-col items-center p-3 rounded-xl min-w-[70px] ${
                    now ? 'bg-cyan-500/20 border border-cyan-500/30' : 'bg-white/5'
                  }`}
                >
                  <span className={`text-xs ${now ? 'text-cyan-400 font-medium' : 'text-muted-foreground'}`}>
                    {now ? 'Now' : formatTime(hour.time)}
                  </span>
                  <span className="text-2xl my-2">{weatherIcon}</span>
                  <span className="font-medium">{Math.round(hour.temperature)}°</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Droplets className="h-3 w-3 text-blue-400" />
                    <span className="text-xs text-muted-foreground">
                      {hour.precipitationProbability}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
