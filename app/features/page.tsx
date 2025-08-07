"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Shield,
  Fingerprint,
  Activity,
  Bot,
  LineChart,
  Wifi,
  Heart,
} from "lucide-react";

const features = [
  {
    icon: <Bot className="w-10 h-10 text-primary" />,
    title: "Intelligent AI Therapy",
    description:
      "Experience therapy like never before with our advanced AI that adapts to your personality and provides personalized support 24/7.",
  },
  {
    icon: <Shield className="w-10 h-10 text-primary" />,
    title: "Bank-Level Security",
    description:
      "Your deepest thoughts are protected with military-grade encryption and blockchain technology that ensures complete privacy.",
  },
  {
    icon: <Brain className="w-10 h-10 text-primary" />,
    title: "Emotional Intelligence",
    description:
      "Our AI doesn't just listen - it understands. Advanced emotion detection and analysis provide insights that truly matter.",
  },
  {
    icon: <Activity className="w-10 h-10 text-primary" />,
    title: "Crisis Protection",
    description:
      "Advanced monitoring detects when you need immediate help and provides instant support during critical moments.",
  },
  {
    icon: <Wifi className="w-10 h-10 text-primary" />,
    title: "Smart Environment",
    description:
      "Transform your space into a therapeutic sanctuary with IoT integration that adapts lighting, sound, and ambiance to your mood.",
  },
  {
    icon: <LineChart className="w-10 h-10 text-primary" />,
    title: "Your Wellness Journey",
    description:
      "Track your progress with detailed insights and celebrate milestones with blockchain-verified achievements and growth records.",
  },
  {
    icon: <Fingerprint className="w-10 h-10 text-primary" />,
    title: "Complete Privacy",
    description:
      "Your conversations stay between you and Brainthera. Zero-knowledge technology means even we can't access your data.",
  },
  {
    icon: <Heart className="w-10 h-10 text-primary" />,
    title: "Comprehensive Care",
    description:
      "Connect your wearables and health data for a complete picture of your mental wellness journey.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Revolutionary Features
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover the breakthrough technology that makes Brainthera the most advanced AI emotional wellness platform in the world.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="text-center mt-16"
      >
        <h2 className="text-2xl font-semibold mb-4">Ready to Transform Your Emotional Wellness?</h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of users who have already discovered the power of AI-powered emotional intelligence.
        </p>
        <a
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Start Your Journey
          <Heart className="ml-2 w-5 h-5" />
        </a>
      </motion.div>
    </div>
  );
}
