import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChatMessage } from "@/lib/types";
import {
  Send,
  Bot,
  User,
  Loader2,
  Phone,
  MapPin,
  AlertTriangle,
  Mic,
  Building2,
  CloudSun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const quickActions = [
  {
    label: "Find Shelter",
    message: "I need to find the nearest shelter or relief camp",
    icon: <Building2 className="h-4 w-4" />
  },
  {
    label: "Report Emergency",
    message: "I need to report an emergency",
    icon: <AlertTriangle className="h-4 w-4" />
  },
  {
    label: "Emergency Numbers",
    message: "What are the emergency contact numbers?",
    icon: <Phone className="h-4 w-4" />
  },
  {
    label: "Weather Update",
    message: "What is the current weather and flood risk?",
    icon: <CloudSun className="h-4 w-4" />
  }
];

const aiResponses: Record<string, string> = {
  "shelter": `🏕️ **Nearest Shelters:**

1. **Colombo Municipal School** - 2.5 km away
   - 180 spots available
   - Has medical facilities, food, water
   - Contact: 011-234-5678

2. **Kelaniya Temple Relief Camp** - 5.2 km away
   - 20 spots available
   - Has food, water, electricity
   - Contact: 011-298-7654

Would you like directions to any of these shelters?`,

  "emergency": `🆘 **To Report an Emergency:**

1. Tap the **SOS Button** on the home screen
2. Your location will be captured automatically
3. Select the type of emergency
4. Add details and submit

For immediate life-threatening emergencies, call:
- **119** - Police
- **1990** - Ambulance
- **110** - Fire

Do you need help reporting a specific emergency?`,

  "numbers": `📞 **Emergency Contact Numbers:**

🚔 **Police:** 119
🚑 **Ambulance (Suwa Seriya):** 1990
🚒 **Fire & Rescue:** 110
🏛️ **Disaster Management:** 117
⚡ **Electricity Board:** 1987
💧 **Water Board:** 1939

**Military:**
- Army: 011-243-2682
- Navy: 011-221-2231
- Air Force: 011-244-1044

Save these numbers for quick access!`,

  "weather": `🌤️ **Current Weather Update:**

**Colombo District:**
- Temperature: 28°C (Feels like 32°C)
- Humidity: 78%
- Rainfall: Light showers expected

⚠️ **Flood Risk: MEDIUM**

**Recommendations:**
- Monitor weather updates regularly
- Avoid low-lying areas during heavy rain
- Keep emergency supplies ready

Would you like a detailed forecast?`,

  "default": `I'm ResQ Assistant, here to help you during emergencies. I can help you with:

🏕️ Finding nearby shelters
🆘 Reporting emergencies
📞 Emergency contact numbers
🌤️ Weather and flood updates
🔍 Missing persons information
💊 First aid guidance

How can I assist you today?`
};

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('shelter') || lowerMessage.includes('camp') || lowerMessage.includes('relief')) {
      return aiResponses.shelter;
    }
    if (lowerMessage.includes('report') || lowerMessage.includes('emergency') || lowerMessage.includes('sos')) {
      return aiResponses.emergency;
    }
    if (lowerMessage.includes('number') || lowerMessage.includes('contact') || lowerMessage.includes('call') || lowerMessage.includes('phone')) {
      return aiResponses.numbers;
    }
    if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('flood') || lowerMessage.includes('forecast')) {
      return aiResponses.weather;
    }
    
    return aiResponses.default;
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: getAIResponse(text),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <Card className="flex-1 flex flex-col glass-card border-white/10 m-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-gradient-to-r from-purple-600/20 to-cyan-600/20">
          <Avatar className="h-10 w-10 bg-gradient-to-br from-purple-500 to-cyan-500">
            <AvatarFallback>
              <Bot className="h-5 w-5 text-white" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">ResQ Assistant</h3>
            <p className="text-xs text-muted-foreground">
              AI-powered disaster response helper
            </p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <Bot className="h-16 w-16 mx-auto text-purple-400 mb-4" />
                <h4 className="font-medium text-lg mb-2">How can I help you?</h4>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  I can help you report emergencies, find shelters, get weather updates, and more.
                </p>

                <div className="flex flex-wrap gap-2 justify-center">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSend(action.message)}
                      className="gap-2 border-white/20 hover:bg-white/10"
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' && "flex-row-reverse"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8 flex-shrink-0",
                    message.role === 'assistant' && "bg-gradient-to-br from-purple-500 to-cyan-500"
                  )}>
                    <AvatarFallback>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-[80%]",
                      message.role === 'user'
                        ? "bg-cyan-600 text-white"
                        : "bg-white/10"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      message.role === 'user'
                        ? "text-cyan-200"
                        : "text-muted-foreground"
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-500 to-cyan-500">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions (when there are messages) */}
        {messages.length > 0 && (
          <div className="px-4 py-2 border-t border-white/10">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSend(action.message)}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  {action.icon}
                  <span className="ml-1">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 hover:bg-white/10"
            >
              <Mic className="h-4 w-4" />
            </Button>

            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 bg-white/5 border-white/10"
            />

            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-cyan-600 hover:bg-cyan-500"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
