import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyForecast as DailyForecastType } from "@/lib/types";
import { WEATHER_CODES } from "@/lib/constants";
import { Calendar, Droplets, Sunrise, Sunset } from "lucide-react";
import { motion } from "framer-motion";

interface DailyForecastProps {
  forecast: DailyForecastType[];
}

export function DailyForecast({ forecast }: DailyForecastProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-cyan-400" />
          7-Day Forecast
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {forecast.map((day, index) => {
            const weatherIcon = WEATHER_CODES[day.weatherCode]?.icon || '🌤️';
            const isToday = index === 0;

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl ${
                  isToday ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[120px]">
                  <span className="text-2xl">{weatherIcon}</span>
                  <div>
                    <p className={`font-medium ${isToday ? 'text-cyan-400' : ''}`}>
                      {formatDate(day.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">{day.weatherDescription}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm">
                    <Droplets className="h-3 w-3 text-blue-400" />
                    <span className="text-muted-foreground">{day.precipitationProbability}%</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-400">{Math.round(day.tempMin)}°</span>
                    <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-400 to-orange-400"
                        style={{
                          width: `${((day.tempMax - day.tempMin) / 20) * 100}%`,
                          marginLeft: `${((day.tempMin - 15) / 20) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-orange-400">{Math.round(day.tempMax)}°</span>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Sunrise className="h-3 w-3 text-yellow-400" />
                    {formatTime(day.sunrise)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Sunset className="h-3 w-3 text-orange-400" />
                    {formatTime(day.sunset)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
