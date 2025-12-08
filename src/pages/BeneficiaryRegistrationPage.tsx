import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { AID_CATEGORIES, CASE_PRIORITIES, VULNERABILITIES, SRI_LANKA_DISTRICTS, generateCaseNumber } from "@/lib/constants/dracp";
import { AidCategory, CasePriority, Vulnerability } from "@/lib/types/dracp";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  UserPlus,
  MapPin,
  Phone,
  Users,
  Package,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  Home,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 'contact', title: 'Contact', icon: Phone },
  { id: 'location', title: 'Location', icon: MapPin },
  { id: 'household', title: 'Household', icon: Users },
  { id: 'need', title: 'Need', icon: Package },
];

export function BeneficiaryRegistrationPage() {
  const navigate = useNavigate();
  const { location, getLocation, isLoading: locationLoading } = useGeolocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Contact
    name: '',
    phone: '',
    alternatePhone: '',
    nationalId: '',
    optInSms: true,
    
    // Location
    address: '',
    district: '',
    gsDivision: '',
    village: '',
    latitude: 0,
    longitude: 0,
    
    // Household
    householdSize: 1,
    vulnerabilities: [] as Vulnerability[],
    
    // Need
    category: '' as AidCategory | '',
    priority: 'MEDIUM' as CasePriority,
    description: '',
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleVulnerability = (v: Vulnerability) => {
    setFormData(prev => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.includes(v)
        ? prev.vulnerabilities.filter(x => x !== v)
        : [...prev.vulnerabilities, v]
    }));
  };

  const handleGetLocation = async () => {
    try {
      const loc = await getLocation();
      updateForm('latitude', loc.latitude);
      updateForm('longitude', loc.longitude);
      if (loc.address) {
        updateForm('address', loc.address);
      }
      if (loc.district) {
        updateForm('district', loc.district);
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    }
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

  const canProceed = () => {
    switch (currentStep) {
      case 0: return formData.name.length >= 2 && formData.phone.length >= 9;
      case 1: return formData.address.length >= 5 && formData.district !== '';
      case 2: return formData.householdSize >= 1;
      case 3: return formData.category !== '' && formData.description.length >= 10;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const caseNumber = generateCaseNumber();
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    navigate('/cases', { state: { newCase: caseNumber } });
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
            <UserPlus className="h-6 w-6 text-cyan-400" />
            Register for Aid
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submit your request for disaster relief assistance
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
                  {currentStep === 0 && "Enter your contact information"}
                  {currentStep === 1 && "Provide your location details"}
                  {currentStep === 2 && "Tell us about your household"}
                  {currentStep === 3 && "Describe what assistance you need"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 0: Contact */}
                {currentStep === 0 && (
                  <>
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => updateForm('name', e.target.value)}
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
                          value={formData.phone}
                          onChange={(e) => updateForm('phone', e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Alternate Phone (Optional)</Label>
                      <Input
                        type="tel"
                        placeholder="Alternative contact number"
                        value={formData.alternatePhone}
                        onChange={(e) => updateForm('alternatePhone', e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>National ID (Optional)</Label>
                      <Input
                        placeholder="NIC number"
                        value={formData.nationalId}
                        onChange={(e) => updateForm('nationalId', e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="flex items-center space-x-2 p-3 rounded-xl bg-white/5 border border-white/10">
                      <Checkbox
                        id="optInSms"
                        checked={formData.optInSms}
                        onCheckedChange={(checked) => updateForm('optInSms', checked)}
                      />
                      <div>
                        <label htmlFor="optInSms" className="text-sm font-medium">
                          Receive SMS updates
                        </label>
                        <p className="text-xs text-muted-foreground">
                          Get notified about your case status via SMS
                        </p>
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
                      <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                        <p className="text-sm text-green-400 font-medium">📍 Location captured</p>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>District *</Label>
                      <select
                        value={formData.district}
                        onChange={(e) => updateForm('district', e.target.value)}
                        className="w-full h-10 px-3 rounded-md bg-white/5 border border-white/10 text-foreground"
                      >
                        <option value="">Select district</option>
                        {SRI_LANKA_DISTRICTS.map(district => (
                          <option key={district} value={district}>{district}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Address *</Label>
                      <Textarea
                        placeholder="Enter your full address"
                        value={formData.address}
                        onChange={(e) => updateForm('address', e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>GS Division</Label>
                        <Input
                          placeholder="GS Division"
                          value={formData.gsDivision}
                          onChange={(e) => updateForm('gsDivision', e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Village</Label>
                        <Input
                          placeholder="Village name"
                          value={formData.village}
                          onChange={(e) => updateForm('village', e.target.value)}
                          className="bg-white/5 border-white/10"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Step 2: Household */}
                {currentStep === 2 && (
                  <>
                    <div className="space-y-2">
                      <Label>Household Size *</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateForm('householdSize', Math.max(1, formData.householdSize - 1))}
                          className="border-white/20"
                        >
                          -
                        </Button>
                        <span className="text-2xl font-bold w-12 text-center">{formData.householdSize}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => updateForm('householdSize', formData.householdSize + 1)}
                          className="border-white/20"
                        >
                          +
                        </Button>
                        <span className="text-sm text-muted-foreground">people</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Vulnerabilities (Select all that apply)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {VULNERABILITIES.map(v => (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => toggleVulnerability(v.id)}
                            className={cn(
                              "flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left",
                              formData.vulnerabilities.includes(v.id)
                                ? "border-purple-500 bg-purple-500/10"
                                : "border-white/20 hover:border-white/40"
                            )}
                          >
                            <span className="text-xl">{v.icon}</span>
                            <span className="text-sm">{v.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Need */}
                {currentStep === 3 && (
                  <>
                    <div className="space-y-3">
                      <Label>Type of Aid Needed *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {AID_CATEGORIES.map(category => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => updateForm('category', category.id)}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                              formData.category === category.id
                                ? "border-cyan-500 bg-cyan-500/10"
                                : "border-white/20 hover:border-white/40"
                            )}
                          >
                            <span className="text-2xl mb-1">{category.icon}</span>
                            <span className="text-xs text-center">{category.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Urgency Level</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {CASE_PRIORITIES.map(priority => (
                          <button
                            key={priority.id}
                            type="button"
                            onClick={() => updateForm('priority', priority.id)}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all text-center",
                              formData.priority === priority.id
                                ? `border-${priority.color}-500 bg-${priority.color}-500/10`
                                : "border-white/20 hover:border-white/40"
                            )}
                          >
                            <span className="text-sm font-medium">{priority.label}</span>
                            <p className="text-xs text-muted-foreground mt-1">{priority.slaHours}h response</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Describe Your Need *</Label>
                      <Textarea
                        placeholder="Please describe your situation and what assistance you need..."
                        value={formData.description}
                        onChange={(e) => updateForm('description', e.target.value)}
                        className="min-h-[100px] bg-white/5 border-white/10"
                      />
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
              className="bg-green-600 hover:bg-green-500"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info Card */}
        <Card className="glass-card border-cyan-500/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-cyan-400 mt-0.5" />
              <div>
                <h4 className="font-medium">What happens next?</h4>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• You'll receive a unique case number via SMS</li>
                  <li>• A volunteer will be assigned to your case</li>
                  <li>• You'll be contacted within the response time</li>
                  <li>• Track your case status using the case number</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
