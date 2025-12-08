import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WeatherCard } from "@/components/weather/WeatherCard";
import { FloodRiskGauge } from "@/components/weather/FloodRiskGauge";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { RiverLevels } from "@/components/river/RiverLevels";
import { FloodPrediction } from "@/components/prediction/FloodPrediction";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { MapPin, CloudSun, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export function WeatherPage() {
  const { location, isLoading: locationLoading } = useGeolocation();
  const {
    weather,
    hourlyForecast,
    dailyForecast,
    floodRisk,
    isLoading: weatherLoading,
    refetch
  } = useWeather(location);

  const isLoading = locationLoading || weatherLoading;

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CloudSun className="h-6 w-6 text-cyan-400" />
            Weather & Flood Risk
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            {locationLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : location?.district ? (
              <span>{location.district}, Sri Lanka</span>
            ) : (
              <span>Getting location...</span>
            )}
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <Skeleton className="h-40 w-40 rounded-full mx-auto" />
              </CardContent>
            </Card>
          </div>
        ) : weather && floodRisk ? (
          <>
            {/* Current Weather */}
            <WeatherCard
              weather={weather}
              floodRisk={floodRisk}
              location={location?.district}
              onRefresh={refetch}
              isLoading={weatherLoading}
            />

            {/* Flood Risk Gauge */}
            <FloodRiskGauge floodRisk={floodRisk} />

            {/* River Levels */}
            <RiverLevels />

            {/* Flood Prediction */}
            <FloodPrediction />

            {/* Hourly Forecast */}
            {hourlyForecast.length > 0 && (
              <HourlyForecast forecast={hourlyForecast} />
            )}

            {/* Daily Forecast */}
            {dailyForecast.length > 0 && (
              <DailyForecast forecast={dailyForecast} />
            )}

            {/* Weather Safety Tips */}
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  Weather Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <SafetyTip
                    emoji="🌧️"
                    title="During Heavy Rain"
                    tips={[
                      "Avoid low-lying areas",
                      "Don't cross flooded roads",
                      "Stay indoors if possible"
                    ]}
                  />
                  <SafetyTip
                    emoji="🌊"
                    title="Flood Preparedness"
                    tips={[
                      "Keep emergency kit ready",
                      "Know evacuation routes",
                      "Move valuables to higher floors"
                    ]}
                  />
                  <SafetyTip
                    emoji="⛈️"
                    title="During Thunderstorms"
                    tips={[
                      "Stay away from windows",
                      "Unplug electrical devices",
                      "Avoid open areas"
                    ]}
                  />
                  <SafetyTip
                    emoji="⛰️"
                    title="Landslide Risk Areas"
                    tips={[
                      "Watch for unusual sounds",
                      "Monitor cracks in ground",
                      "Evacuate if advised"
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="glass-card border-white/10">
            <CardContent className="p-6 text-center">
              <CloudSun className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Unable to load weather data</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SafetyTip({ emoji, title, tips }: { emoji: string; title: string; tips: string[] }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <h4 className="font-medium">{title}</h4>
      </div>
      <ul className="text-sm text-muted-foreground space-y-1">
        {tips.map((tip, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-cyan-400">•</span>
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}
