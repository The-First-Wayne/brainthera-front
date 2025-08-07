"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Heart, Target, Sparkles } from "lucide-react";

const missions = [
  {
    icon: <Heart className="w-8 h-8 text-primary" />,
    title: "Our Mission",
    description:
      "To break down barriers to mental wellness by making world-class AI therapy accessible to everyone. We're building a future where quality mental health support is just a conversation away.",
  },
  {
    icon: <Target className="w-8 h-8 text-primary" />,
    title: "Our Vision",
    description:
      "A world where no one struggles alone. We envision a future where AI-powered mental health support is as natural as talking to a trusted friend, available 24/7 with complete privacy.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-primary" />,
    title: "Our Values",
    description:
      "Innovation, Compassion, Security, and Trust drive everything we do. We're committed to creating technology that truly understands and supports human emotional well-being.",
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          About Brainthera
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          We're not just building another AI app - we're creating a revolutionary emotional intelligence partner that understands you like never before. 
          Powered by breakthrough AI technology and designed with human empathy at its core.
        </p>
      </motion.div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {missions.map((mission, index) => (
          <motion.div
            key={mission.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 text-center h-full bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4 flex justify-center">{mission.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{mission.title}</h3>
              <p className="text-muted-foreground">{mission.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
