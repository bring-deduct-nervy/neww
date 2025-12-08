import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  CreditCard,
  Package,
  TrendingUp,
  Users,
  CheckCircle,
  Building2,
  Utensils,
  Droplets,
  Pill,
  Shirt,
  Baby,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const donationAmounts = [500, 1000, 2500, 5000, 10000];

const supplyCategories = [
  { id: 'FOOD', label: 'Food Items', icon: <Utensils className="h-5 w-5" />, color: 'text-orange-400' },
  { id: 'WATER', label: 'Drinking Water', icon: <Droplets className="h-5 w-5" />, color: 'text-blue-400' },
  { id: 'MEDICINE', label: 'Medicine', icon: <Pill className="h-5 w-5" />, color: 'text-red-400' },
  { id: 'CLOTHING', label: 'Clothing', icon: <Shirt className="h-5 w-5" />, color: 'text-purple-400' },
  { id: 'BABY', label: 'Baby Supplies', icon: <Baby className="h-5 w-5" />, color: 'text-pink-400' },
];

const fundAllocation = [
  { category: 'Emergency Relief', percentage: 40, color: 'bg-red-500' },
  { category: 'Food & Water', percentage: 25, color: 'bg-orange-500' },
  { category: 'Medical Supplies', percentage: 20, color: 'bg-blue-500' },
  { category: 'Shelter Support', percentage: 10, color: 'bg-green-500' },
  { category: 'Operations', percentage: 5, color: 'bg-gray-500' },
];

const recentDonations = [
  { name: 'Anonymous', amount: 5000, time: '2 minutes ago' },
  { name: 'Kasun P.', amount: 2500, time: '15 minutes ago' },
  { name: 'Nimali S.', amount: 10000, time: '1 hour ago' },
  { name: 'Anonymous', amount: 1000, time: '2 hours ago' },
];

export function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState<'monetary' | 'supplies'>('monetary');

  const totalRaised = 2450000;
  const goal = 5000000;
  const progressPercentage = (totalRaised / goal) * 100;

  const handleDonate = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    alert(`Thank you for your donation of LKR ${amount?.toLocaleString()}!`);
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
            <Heart className="h-6 w-6 text-red-400" />
            Donate
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your contribution saves lives
          </p>
        </motion.div>

        {/* Campaign Progress */}
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 p-6">
            <h3 className="font-semibold text-lg">Flood Relief Fund 2024</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Help families affected by the recent floods in Sri Lanka
            </p>
            
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>LKR {totalRaised.toLocaleString()} raised</span>
                <span className="text-muted-foreground">Goal: LKR {goal.toLocaleString()}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">1,234</p>
                <p className="text-xs text-muted-foreground">Donors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">5,678</p>
                <p className="text-xs text-muted-foreground">Families Helped</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">15</p>
                <p className="text-xs text-muted-foreground">Districts</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Donation Type Tabs */}
        <Tabs defaultValue="monetary" className="space-y-4" onValueChange={(v) => setDonationType(v as any)}>
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="monetary" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Monetary
            </TabsTrigger>
            <TabsTrigger value="supplies" className="gap-2">
              <Package className="h-4 w-4" />
              Supplies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monetary" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Select Amount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {donationAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      onClick={() => {
                        setSelectedAmount(amount);
                        setCustomAmount("");
                      }}
                      className={cn(
                        "h-14 text-lg font-semibold",
                        selectedAmount === amount && !customAmount
                          ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
                          : "border-white/20"
                      )}
                    >
                      {amount.toLocaleString()}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Custom Amount (LKR)</Label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="bg-white/5 border-white/10 text-lg h-12"
                  />
                </div>

                <Button
                  className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"
                  onClick={handleDonate}
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Donate LKR {(customAmount ? parseInt(customAmount) : selectedAmount)?.toLocaleString() || 0}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by PayHere. All donations are tax-deductible.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supplies" className="space-y-4">
            <Card className="glass-card border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Donate Supplies</CardTitle>
                <CardDescription>
                  Select items you can donate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplyCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg bg-white/10", category.color)}>
                        {category.icon}
                      </div>
                      <span className="font-medium">{category.label}</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </motion.div>
                ))}

                <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 mt-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cyan-400" />
                    Drop-off Locations
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    You can drop off supplies at any of our collection centers:
                  </p>
                  <ul className="text-sm mt-2 space-y-1">
                    <li>• Colombo - Town Hall</li>
                    <li>• Gampaha - District Secretariat</li>
                    <li>• Kalutara - Municipal Council</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fund Allocation */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-400" />
              Fund Allocation
            </CardTitle>
            <CardDescription>
              How your donation is used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fundAllocation.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.category}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full", item.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Donations */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              Recent Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDonations.map((donation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                      {donation.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{donation.name}</p>
                      <p className="text-xs text-muted-foreground">{donation.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                    LKR {donation.amount.toLocaleString()}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impact Stories */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/20">
                <p className="text-3xl font-bold text-blue-400">50,000</p>
                <p className="text-sm text-muted-foreground">Meals Provided</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-600/20 to-emerald-600/20 border border-green-500/20">
                <p className="text-3xl font-bold text-green-400">2,500</p>
                <p className="text-sm text-muted-foreground">Families Sheltered</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20">
                <p className="text-3xl font-bold text-purple-400">10,000</p>
                <p className="text-sm text-muted-foreground">Medical Kits</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-600/20 to-red-600/20 border border-orange-500/20">
                <p className="text-3xl font-bold text-orange-400">500</p>
                <p className="text-sm text-muted-foreground">Rescues Supported</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-400" />
            Verified NGO
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-400" />
            Tax Deductible
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-400" />
            Secure Payment
          </div>
        </div>
      </div>
    </div>
  );
}
