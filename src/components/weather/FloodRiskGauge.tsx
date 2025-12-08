import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FloodRiskAssessment } from "@/lib/types";
import { motion } from "framer-motion";
import { AlertTriangle, Droplets, CloudRain, Waves, TrendingUp } from "lucide-react";

interface FloodRiskGaugeProps {
  floodRisk: FloodRiskAssessment;
}

export function FloodRiskGauge({ floodRisk }: FloodRiskGaugeProps) {
  const getGaugeColor = () => {
    switch (floodRisk.level) {
      case 'CRITICAL': return 'from-red-600 to-red-400';
      case 'HIGH': return 'from-orange-600 to-orange-400';
      case 'MEDIUM': return 'from-yellow-600 to-yellow-400';
      default: return 'from-green-600 to-green-400';
    }
  };

  const getGlowColor = () => {
    switch (floodRisk.level) {
      case 'CRITICAL': return 'shadow-red-500/50';
      case 'HIGH': return 'shadow-orange-500/50';
      case 'MEDIUM': return 'shadow-yellow-500/50';
      default: return 'shadow-green-500/50';
    }
  };

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Waves className="h-5 w-5 text-cyan-400" />
          Flood Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Circular Gauge */}
        <div className="flex justify-center mb-6">
          <div className="relative w-40 h-40">
            {/* Background circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                className="text-white/10"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                className={`bg-gradient-to-r ${getGaugeColor()}`}
                style={{
                  stroke: floodRisk.level === 'CRITICAL' ? '#dc2626' :
                         floodRisk.level === 'HIGH' ? '#ea580c' :
                         floodRisk.level === 'MEDIUM' ? '#ca8a04' : '#16a34a'
                }}
                initial={{ strokeDasharray: "0 440" }}
                animate={{ strokeDasharray: `${(floodRisk.score / 100) * 440} 440` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className={`text-3xl font-bold ${
                  floodRisk.level === 'CRITICAL' ? 'text-red-400' :
                  floodRisk.level === 'HIGH' ? 'text-orange-400' :
                  floodRisk.level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {Math.round(floodRisk.score)}%
              </motion.span>
              <span className="text-sm text-muted-foreground">{floodRisk.level}</span>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Risk Factors</h4>
          <div className="grid grid-cols-2 gap-2">
            <RiskFactor
              icon={<CloudRain className="h-4 w-4" />}
              label="24h Rainfall"
              value={floodRisk.factors.rainfall24h}
            />
            <RiskFactor
              icon={<Droplets className="h-4 w-4" />}
              label="72h Rainfall"
              value={floodRisk.factors.rainfall72h}
            />
            <RiskFactor
              icon={<Waves className="h-4 w-4" />}
              label="Soil Saturation"
              value={floodRisk.factors.soilSaturation}
            />
            <RiskFactor
              icon={<TrendingUp className="h-4 w-4" />}
              label="Forecast Risk"
              value={floodRisk.factors.forecast}
            />
          </div>
        </div>

        {/* Recommendations */}
        {floodRisk.recommendations.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`h-4 w-4 ${
                floodRisk.level === 'CRITICAL' ? 'text-red-400' :
                floodRisk.level === 'HIGH' ? 'text-orange-400' :
                floodRisk.level === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
              }`} />
              <span className="text-sm font-medium">Recommendations</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {floodRisk.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RiskFactor({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  const getBarColor = (val: number) => {
    if (val >= 75) return 'bg-red-500';
    if (val >= 50) return 'bg-orange-500';
    if (val >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="p-2 rounded-lg bg-white/5">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-cyan-400">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getBarColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-medium mt-1 block">{Math.round(value)}%</span>
    </div>
  );
}
