import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { EmergencyReport, SeverityLevel } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/constants";
import {
  Heart,
  MapPin,
  Clock,
  Users,
  Navigation,
  Phone,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  TrendingUp,
  Truck,
  Stethoscope,
  Utensils,
  Wrench,
  Radio,
  Anchor
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const skills = [
  { id: 'FIRST_AID', label: 'First Aid', icon: <Stethoscope className="h-4 w-4" /> },
  { id: 'SWIMMING', label: 'Swimming', icon: <Anchor className="h-4 w-4" /> },
  { id: 'DRIVING', label: 'Driving', icon: <Truck className="h-4 w-4" /> },
  { id: 'COOKING', label: 'Cooking', icon: <Utensils className="h-4 w-4" /> },
  { id: 'CONSTRUCTION', label: 'Construction', icon: <Wrench className="h-4 w-4" /> },
  { id: 'COMMUNICATION', label: 'Communication', icon: <Radio className="h-4 w-4" /> },
];

const equipment = [
  { id: 'BOAT', label: 'Boat' },
  { id: 'FOUR_WHEEL_DRIVE', label: '4WD Vehicle' },
  { id: 'MOTORCYCLE', label: 'Motorcycle' },
  { id: 'FIRST_AID_KIT', label: 'First Aid Kit' },
  { id: 'GENERATOR', label: 'Generator' },
  { id: 'RADIO', label: 'Radio Equipment' },
];

// Fallback assignments
const fallbackAssignments: (EmergencyReport & { assignmentStatus: string; distance: number })[] = [
  {
    id: '1',
    category: 'SUPPLIES',
    severity: 'MEDIUM',
    title: 'Food distribution needed',
    description: 'Help distribute food packages to 50 families in the area',
    latitude: 6.9271,
    longitude: 79.8612,
    address: 'Colombo 07 Community Center',
    district: 'Colombo',
    peopleAffected: 150,
    hasChildren: true,
    hasElderly: true,
    hasDisabled: false,
    hasMedicalNeeds: false,
    contactName: 'Relief Coordinator',
    contactPhone: '0771234567',
    isAnonymous: false,
    images: [],
    status: 'ASSIGNED',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
    assignmentStatus: 'ASSIGNED',
    distance: 3.2
  },
  {
    id: '2',
    category: 'RESCUE',
    severity: 'HIGH',
    title: 'Boat rescue assistance',
    description: 'Need volunteers with boats to help evacuate stranded families',
    latitude: 6.9350,
    longitude: 79.8500,
    address: 'Wellawatte Canal Area',
    district: 'Colombo',
    peopleAffected: 25,
    hasChildren: true,
    hasElderly: false,
    hasDisabled: false,
    hasMedicalNeeds: false,
    contactName: 'Navy Coordinator',
    contactPhone: '0779876543',
    isAnonymous: false,
    images: [],
    status: 'IN_PROGRESS',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(),
    assignmentStatus: 'IN_PROGRESS',
    distance: 5.8
  }
];

const categoryIcons: Record<string, string> = {
  FLOOD_TRAPPED: '🌊',
  MEDICAL: '🚑',
  RESCUE: '🚁',
  SUPPLIES: '📦',
  INFRASTRUCTURE: '🏚️',
  FIRE: '🔥',
  LANDSLIDE: '⛰️',
  OTHER: '⚠️'
};

export function VolunteerPage() {
  const [isRegistered, setIsRegistered] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['FIRST_AID', 'DRIVING']);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['FOUR_WHEEL_DRIVE']);

  const stats = {
    tasksCompleted: 12,
    hoursContributed: 48,
    peopleHelped: 156,
    rating: 4.8
  };

  if (!isRegistered) {
    return (
      <div className="min-h-screen pb-20">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-cyan-400" />
              Become a Volunteer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Join our community of disaster response volunteers
            </p>
          </motion.div>

          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle>Volunteer Registration</CardTitle>
              <CardDescription>
                Help your community during emergencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="Enter your name" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="07XXXXXXXX" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input placeholder="Your district" className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Skills</Label>
                <div className="grid grid-cols-2 gap-3">
                  {skills.map(skill => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={skill.id}
                        checked={selectedSkills.includes(skill.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSkills([...selectedSkills, skill.id]);
                          } else {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill.id));
                          }
                        }}
                      />
                      <label htmlFor={skill.id} className="text-sm flex items-center gap-2">
                        {skill.icon}
                        {skill.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Available Equipment</Label>
                <div className="grid grid-cols-2 gap-3">
                  {equipment.map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={selectedEquipment.includes(item.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedEquipment([...selectedEquipment, item.id]);
                          } else {
                            setSelectedEquipment(selectedEquipment.filter(e => e !== item.id));
                          }
                        }}
                      />
                      <label htmlFor={item.id} className="text-sm">{item.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-cyan-600 hover:bg-cyan-500"
                onClick={() => setIsRegistered(true)}
              >
                <Heart className="h-4 w-4 mr-2" />
                Register as Volunteer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="h-6 w-6 text-cyan-400" />
              Volunteer Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Thank you for helping your community
            </p>
          </div>
          <Button
            variant={isAvailable ? "default" : "outline"}
            onClick={() => setIsAvailable(!isAvailable)}
            className={isAvailable ? "bg-green-600 hover:bg-green-500" : "border-white/20"}
          >
            {isAvailable ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Available
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 mr-2" />
                Unavailable
              </>
            )}
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Tasks Completed</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.hoursContributed}</p>
              <p className="text-xs text-muted-foreground">Hours</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.peopleHelped}</p>
              <p className="text-xs text-muted-foreground">People Helped</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.rating}</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="assignments" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="assignments">Active Assignments</TabsTrigger>
            <TabsTrigger value="available">Available Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4">
            {fallbackAssignments.filter(a => a.assignmentStatus !== 'COMPLETED').length === 0 ? (
              <Card className="glass-card border-white/10">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <p className="text-muted-foreground">No active assignments</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check available tasks to help your community
                  </p>
                </CardContent>
              </Card>
            ) : (
              fallbackAssignments.map((assignment, index) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AssignmentCard assignment={assignment} isAssigned />
                </motion.div>
              ))
            )}
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            {fallbackAssignments.map((assignment, index) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AssignmentCard assignment={assignment} />
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Skills & Equipment */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-cyan-400" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skillId => {
                  const skill = skills.find(s => s.id === skillId);
                  return skill ? (
                    <Badge key={skillId} variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                      {skill.icon}
                      <span className="ml-1">{skill.label}</span>
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Equipment</p>
              <div className="flex flex-wrap gap-2">
                {selectedEquipment.map(equipId => {
                  const equip = equipment.find(e => e.id === equipId);
                  return equip ? (
                    <Badge key={equipId} variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                      {equip.label}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            <Button variant="outline" className="w-full border-white/20">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="glass-card border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              Top Volunteers This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Kasun P.', tasks: 15, rank: 1 },
                { name: 'Nimali S.', tasks: 12, rank: 2 },
                { name: 'You', tasks: 12, rank: 3, isYou: true },
                { name: 'Ruwan F.', tasks: 10, rank: 4 },
                { name: 'Chamari D.', tasks: 8, rank: 5 },
              ].map((volunteer) => (
                <div
                  key={volunteer.rank}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    volunteer.isYou ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      volunteer.rank === 1 && "bg-yellow-500 text-black",
                      volunteer.rank === 2 && "bg-gray-400 text-black",
                      volunteer.rank === 3 && "bg-orange-600 text-white",
                      volunteer.rank > 3 && "bg-white/10"
                    )}>
                      {volunteer.rank}
                    </span>
                    <span className={volunteer.isYou ? "text-cyan-400 font-medium" : ""}>
                      {volunteer.name}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {volunteer.tasks} tasks
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AssignmentCard({
  assignment,
  isAssigned = false
}: {
  assignment: EmergencyReport & { assignmentStatus: string; distance: number };
  isAssigned?: boolean;
}) {
  const severityConfig = SEVERITY_CONFIG[assignment.severity];

  return (
    <Card className={cn("glass-card border", severityConfig.borderColor)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-xl text-2xl",
            severityConfig.bgColor
          )}>
            {categoryIcons[assignment.category]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{assignment.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {assignment.description}
                </p>
              </div>
              <Badge className={cn("ml-2 shrink-0", severityConfig.bgColor, severityConfig.textColor)}>
                {assignment.severity}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                {assignment.distance} km
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-cyan-400" />
                {assignment.peopleAffected} people
              </span>
            </div>

            <div className="flex gap-2 mt-4">
              {isAssigned ? (
                <>
                  <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-500">
                    <Navigation className="h-4 w-4 mr-1" />
                    Navigate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20"
                    onClick={() => window.location.href = `tel:${assignment.contactPhone}`}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="border-green-500/30 text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </>
              ) : (
                <>
                  <Button size="sm" className="flex-1 bg-cyan-600 hover:bg-cyan-500">
                    Accept Task
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20">
                    View Details
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
