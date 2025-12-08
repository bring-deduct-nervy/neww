import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  MapPin,
  Users,
  Bell,
  Heart,
  Phone,
  CloudRain,
  Building2,
  Search,
  MessageSquare,
  ChevronRight,
  CheckCircle,
  Zap,
  Globe,
  Clock,
  LogIn
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: <Bell className="h-6 w-6" />, title: "Real-time Alerts", desc: "Instant emergency notifications" },
  { icon: <MapPin className="h-6 w-6" />, title: "Crisis Map", desc: "Live emergency locations" },
  { icon: <Building2 className="h-6 w-6" />, title: "Shelter Finder", desc: "Find nearby safe shelters" },
  { icon: <Users className="h-6 w-6" />, title: "Volunteer Network", desc: "Coordinate relief efforts" },
  { icon: <Search className="h-6 w-6" />, title: "Missing Persons", desc: "Help reunite families" },
  { icon: <CloudRain className="h-6 w-6" />, title: "Weather Monitoring", desc: "Flood risk predictions" },
  { icon: <Heart className="h-6 w-6" />, title: "Donation Portal", desc: "Support relief efforts" },
  { icon: <MessageSquare className="h-6 w-6" />, title: "AI Assistant", desc: "24/7 emergency guidance" },
];

const stats = [
  { value: "25+", label: "Districts Covered" },
  { value: "10K+", label: "People Helped" },
  { value: "500+", label: "Active Volunteers" },
  { value: "24/7", label: "Emergency Support" },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/landing" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-cyan-400" />
            <span className="font-bold text-xl gradient-text">ResQ-Unified</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth/signin">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-background to-purple-600/20" />
        <div className="absolute inset-0 opacity-10 bg-grid-pattern" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              🇱🇰 Sri Lanka Strong
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-white to-purple-400 bg-clip-text text-transparent">
              ResQ-Unified
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Disaster Response & Community Alert System
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              A comprehensive platform for flood prediction, emergency response, volunteer coordination, and community support during natural disasters.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-lg h-14 px-8">
                  <Shield className="h-5 w-5 mr-2" />
                  Request Emergency Aid
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-lg h-14 px-8">
                  Open Dashboard
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Free to use
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                Real-time updates
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-400" />
                24/7 support
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/10 bg-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-cyan-400">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Disaster Response</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to stay safe, get help, and support your community during emergencies.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass-card border-white/10 h-full hover:border-cyan-500/30 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mx-auto mb-4 text-cyan-400">
                      {feature.icon}
                    </div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-600/20 to-purple-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Help or Need Assistance?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of Sri Lankans using ResQ-Unified to stay safe and support their communities.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500">
                <Users className="h-5 w-5 mr-2" />
                Become a Volunteer
              </Button>
            </Link>
            <Link to="/track">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20">
                <Search className="h-5 w-5 mr-2" />
                Track Your Case
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold mb-2">Emergency Hotlines</h3>
            <p className="text-sm text-muted-foreground">Available 24/7</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: "Emergency", number: "117" },
              { name: "Police", number: "119" },
              { name: "Ambulance", number: "1990" },
              { name: "Fire", number: "110" },
              { name: "DMC", number: "117" },
            ].map((contact) => (
              <a
                key={contact.number}
                href={`tel:${contact.number}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors"
              >
                <Phone className="h-4 w-4 text-cyan-400" />
                <span className="text-sm">{contact.name}:</span>
                <span className="font-bold">{contact.number}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="mb-2">
            🇱🇰 Sri Lanka Strong - One Nation, One Rise
          </p>
          <p>
            ResQ-Unified © {new Date().getFullYear()} | Built with ❤️ for Sri Lanka
          </p>
        </div>
      </footer>
    </div>
  );
}
