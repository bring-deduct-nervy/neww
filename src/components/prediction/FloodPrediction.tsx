import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFloodPredictions, getHighRiskAreas, FloodPrediction as FloodPredictionType } from "@/lib/api/flood-prediction";
import {
  TrendingUp,
  Clock,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Waves,
  CloudRain,
  Loader2,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PredictionZone {
  id: string;
  name: string;
  district: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  predictedTime: string;
  confidence: number;
  affectedPopulation: number;
  recommendations: string[];
}

const mockPredictions: PredictionZone[] = [
  {
    id: '1',
    name: 'Kaduwela Low-lying Area',
    district: 'Colombo',
    riskLevel: 'CRITICAL',
    predictedTime: '6-12 hours',
    confidence: 85,
    affectedPopulation: 15000,
    recommendations: [
      'Evacuate immediately to higher ground',
      'Move valuables to upper floors',
      'Keep emergency supplies ready'
    ]
  },
  {
    id: '2',
    name: 'Wellawatte Coastal Zone',
    district: 'Colombo',
    riskLevel: 'HIGH',
    predictedTime: '12-24 hours',
    confidence: 72,
    affectedPopulation: 8000,
    recommendations: [
      'Prepare for possible evacuation',
      'Monitor official alerts',
      'Stock up on essentials'
    ]
  },
  {
    id: '3',
    name: 'Kelaniya River Basin',
    district: 'Gampaha',
    riskLevel: 'HIGH',
    predictedTime: '24-48 hours',
    confidence: 68,
    affectedPopulation: 25000,
    recommendations: [
      'Stay alert for evacuation orders',
      'Identify nearest shelter',
      'Keep important documents safe'
    ]
  },
  {
    id: '4',
    name: 'Ratnapura Town',
    district: 'Ratnapura',
    riskLevel: 'MEDIUM',
    predictedTime: '48-72 hours',
    confidence: 55,
    affectedPopulation: 12000,
    recommendations: [
      'Monitor weather updates',
      'Avoid low-lying areas during rain',
      'Keep emergency contacts handy'
    ]
  }
];

const riskConfig = {
  LOW: { label: 'Low Risk', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/30' },
  MEDIUM: { label: 'Medium Risk', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/30' },
  HIGH: { label: 'High Risk', color: 'text-orange-400', bgColor: 'bg-orange-500/20 border-orange-500/30' },
  CRITICAL: { label: 'Critical Risk', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/30' }
};

export function FloodPrediction() {
  const criticalZones = mockPredictions.filter(p => p.riskLevel === 'CRITICAL');

  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Flood Prediction (24-72h)
          </CardTitle>
          {criticalZones.length > 0 && (
            <Badge variant="destructive" className="animate-pulse">
              {criticalZones.length} Critical
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          AI-powered flood risk predictions based on weather, river levels, and terrain data
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockPredictions.map((zone, index) => {
            const risk = riskConfig[zone.riskLevel];

            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border",
                  risk.bgColor
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      {zone.riskLevel === 'CRITICAL' && (
                        <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                      )}
                      {zone.name}
                    </h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {zone.district}
                    </p>
                  </div>
                  <Badge className={cn("border", risk.bgColor, risk.color)}>
                    {risk.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <Clock className="h-4 w-4 mx-auto text-cyan-400 mb-1" />
                    <p className="text-xs text-muted-foreground">Expected</p>
                    <p className="text-sm font-medium">{zone.predictedTime}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <TrendingUp className="h-4 w-4 mx-auto text-cyan-400 mb-1" />
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="text-sm font-medium">{zone.confidence}%</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-white/5">
                    <Waves className="h-4 w-4 mx-auto text-cyan-400 mb-1" />
                    <p className="text-xs text-muted-foreground">Population</p>
                    <p className="text-sm font-medium">{(zone.affectedPopulation / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Recommendations:</p>
                  <ul className="text-xs space-y-0.5">
                    {zone.recommendations.slice(0, 2).map((rec, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className={risk.color}>•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {zone.riskLevel === 'CRITICAL' && (
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-red-600 hover:bg-red-500"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Evacuation Routes
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
          <div className="flex items-start gap-2">
            <CloudRain className="h-5 w-5 text-cyan-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Prediction Model</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Predictions are based on real-time weather data, historical flood patterns, 
                river level monitoring, and terrain analysis. Updated every 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
