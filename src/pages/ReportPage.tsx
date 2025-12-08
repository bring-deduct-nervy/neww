import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { EMERGENCY_OPTIONS } from "@/lib/constants";
import { EmergencyCategory, SeverityLevel } from "@/lib/types";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  AlertTriangle,
  MapPin,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Camera,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 'category', title: 'Type', icon: AlertTriangle },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'details', title: 'Details', icon: FileText },
  { id: 'contact', title: 'Contact', icon: User }
];

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'border-green-500/50 bg-green-500/10 text-green-400' },
  { value: 'MEDIUM', label: 'Medium', color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' },
  { value: 'HIGH', label: 'High', color: 'border-orange-500/50 bg-orange-500/10 text-orange-400' },
  { value: 'CRITICAL', label: 'Critical', color: 'border-red-500/50 bg-red-500/10 text-red-400' },
];

export function ReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { location, getLocation, isLoading: locationLoading } = useGeolocation();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: '' as EmergencyCategory | '',
    severity: 'MEDIUM' as SeverityLevel,
    latitude: parseFloat(searchParams.get('lat') || '0') || location?.latitude || 0,
    longitude: parseFloat(searchParams.get('lng') || '0') || location?.longitude || 0,
    address: '',
    title: '',
    description: '',
    peopleAffected: 1,
    hasChildren: false,
    hasElderly: false,
    hasDisabled: false,
    hasMedicalNeeds: false,
    contactName: '',
    contactPhone: '',
    isAnonymous: false,
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGetLocation = async () => {
    try {
      const loc = await getLocation();
      updateForm('latitude', loc.latitude);
      updateForm('longitude', loc.longitude);
      if (loc.address) {
        updateForm('address', loc.address);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    navigate('/', { state: { reportSubmitted: true } });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.category !== '';
      case 1: return formData.latitude !== 0 && formData.longitude !== 0;
      case 2: return formData.title.length >= 5 && formData.description.length >= 10;
      case 3: return formData.contactName.length >= 2 && formData.contactPhone.length >= 9;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            Report Emergency
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Help is on the way. Fill in the details below.
          </p>
        </motion.div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-1",
                    index <= currentStep ? 'text-cyan-400' : 'text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                    index < currentStep && 'bg-cyan-500 text-white',
                    index === currentStep && 'border-2 border-cyan-500',
                    index > currentStep && 'border border-muted-foreground'
                  )}>
                    {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle>{STEPS[currentStep].title}</CardTitle>
                <CardDescription>
                  {currentStep === 0 && "Select the type and severity of your emergency"}
                  {currentStep === 1 && "Confirm your location for responders"}
                  {currentStep === 2 && "Provide details about the situation"}
                  {currentStep === 3 && "Enter contact information for responders"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 0: Category */}
                {currentStep === 0 && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {EMERGENCY_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => updateForm('category', option.id)}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            "hover:scale-105 active:scale-95",
                            formData.category === option.id
                              ? "border-cyan-500 bg-cyan-500/10"
                              : "border-white/20 hover:border-white/40"
                          )}
                        >
                          <span className="text-3xl mb-2">{option.icon}</span>
                          <span className="font-medium text-sm text-center">{option.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>Severity Level</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {SEVERITY_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => updateForm('severity', option.value)}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all text-center",
                              formData.severity === option.value
                                ? option.color
                                : "border-white/20 hover:border-white/40"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Step 1: Location */}
                {currentStep === 1 && (
                  <>
                    <Button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      className="w-full h-14 bg-cyan-600 hover:bg-cyan-500"
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <MapPin className="h-5 w-5 mr-2" />
                          Get My Current Location
                        </>
                      )}
                    </Button>

                    {formData.latitude !== 0 && (
                      <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                        <p className="text-sm text-green-400 font-medium">📍 Location captured</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Address / Landmark (Optional)</Label>
                      <Input
                        placeholder="e.g., Near the temple, Main road..."
                        value={formData.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                      <p className="text-xs text-muted-foreground">
                        Add any landmarks to help rescuers find you
                      </p>
                    </div>
                  </>
                )}

                {/* Step 2: Details */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label>Brief Title *</Label>
                      <Input
                        placeholder="e.g., Family trapped on rooftop"
                        value={formData.title}
                        onChange={(e) => updateForm('title', e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Detailed Description *</Label>
                      <Textarea
                        placeholder="Describe the situation, what help is needed, any immediate dangers..."
                        value={formData.description}
                        onChange={(e) => updateForm('description', e.target.value)}
                        className="min-h-[100px] bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Number of People Affected</Label>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min={1}
                          max={1000}
                          value={formData.peopleAffected}
                          onChange={(e) => updateForm('peopleAffected', parseInt(e.target.value) || 1)}
                          className="w-24 bg-white/5 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Vulnerable Groups Present</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'hasChildren', label: 'Children' },
                          { key: 'hasElderly', label: 'Elderly' },
                          { key: 'hasDisabled', label: 'Disabled' },
                          { key: 'hasMedicalNeeds', label: 'Medical Needs' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={item.key}
                              checked={formData[item.key as keyof typeof formData] as boolean}
                              onCheckedChange={(checked) => updateForm(item.key, checked)}
                            />
                            <label htmlFor={item.key} className="text-sm">{item.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" className="w-full border-white/20">
                      <Camera className="h-4 w-4 mr-2" />
                      Add Photos (Optional)
                    </Button>
                  </>
                )}

                {/* Step 3: Contact */}
                {currentStep === 3 && (
                  <>
                    <div className="space-y-2">
                      <Label>Your Name *</Label>
                      <Input
                        placeholder="Enter your name"
                        value={formData.contactName}
                        onChange={(e) => updateForm('contactName', e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">+94</span>
                        <Input
                          type="tel"
                          placeholder="7XXXXXXXX"
                          value={formData.contactPhone}
                          onChange={(e) => updateForm('contactPhone', e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Responders will use this to contact you
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 p-4 rounded-xl border border-white/10 bg-white/5">
                      <Checkbox
                        id="anonymous"
                        checked={formData.isAnonymous}
                        onCheckedChange={(checked) => updateForm('isAnonymous', checked)}
                      />
                      <div>
                        <label htmlFor="anonymous" className="text-sm font-medium">
                          Hide my details from public map
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Only verified responders will see your contact info
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between">
          {currentStep > 0 ? (
            <Button variant="outline" onClick={prevStep} className="border-white/20">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate('/')}>
              Cancel
            </Button>
          )}

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={nextStep} disabled={!canProceed()} className="bg-cyan-600 hover:bg-cyan-500">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-red-600 hover:bg-red-500 glow-critical"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
