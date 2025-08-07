"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  X,
  Trophy,
  Star,
  Clock,
  Smile,
  PlusCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BreathingGame } from "@/components/games/breathing-game";
import { ZenGarden } from "@/components/games/zen-garden";
import { ForestGame } from "@/components/games/forest-game";
import { OceanWaves } from "@/components/games/ocean-waves";
import { Badge } from "@/components/ui/badge";
import {
  createChatSession,
  sendChatMessage,
  getChatHistory,
  ChatMessage,
  getAllChatSessions,
  ChatSession,
} from "@/lib/api/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Separator } from "@/components/ui/separator";

interface SuggestedQuestion {
  id: string;
  text: string;
}

interface StressPrompt {
  trigger: string;
  activity: {
    type: "breathing" | "garden" | "forest" | "waves";
    title: string;
    description: string;
  };
}

interface ApiResponse {
  message: string;
  metadata: {
    technique: string;
    goal: string;
    progress: any[];
  };
}

const SUGGESTED_QUESTIONS = [
  { text: "How can I manage my anxiety better?" },
  { text: "I've been feeling overwhelmed lately" },
  { text: "Can we talk about improving sleep?" },
  { text: "I need help with work-life balance" },
];

const glowAnimation = {
  initial: { opacity: 0.5, scale: 1 },
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const COMPLETION_THRESHOLD = 5;

export default function TherapyPage() {
  const params = useParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stressPrompt, setStressPrompt] = useState<StressPrompt | null>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [isChatPaused, setIsChatPaused] = useState(false);
  const [showNFTCelebration, setShowNFTCelebration] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    params.sessionId as string
  );
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      const newSessionId = await createChatSession();
      console.log("New session created:", newSessionId);

      // Update sessions list immediately
      const newSession: ChatSession = {
        sessionId: newSessionId,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update all state in one go
      setSessions((prev) => [newSession, ...prev]);
      setSessionId(newSessionId);
      setMessages([]);

      // Update URL without refresh
      window.history.pushState({}, "", `/therapy/${newSessionId}`);

      // Force a re-render of the chat area
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to create new session:", error);
      setIsLoading(false);
    }
  };

  // Initialize chat session and load history
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        if (!sessionId || sessionId === "new") {
          console.log("Creating new chat session...");
          const newSessionId = await createChatSession();
          console.log("New session created:", newSessionId);
          setSessionId(newSessionId);
          window.history.pushState({}, "", `/therapy/${newSessionId}`);
        } else {
          console.log("Loading existing chat session:", sessionId);
          try {
            const history = await getChatHistory(sessionId);
            console.log("Loaded chat history:", history);
            if (Array.isArray(history)) {
              const formattedHistory = history.map((msg) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              }));
              console.log("Formatted history:", formattedHistory);
              setMessages(formattedHistory);
            } else {
              console.error("History is not an array:", history);
              setMessages([]);
            }
          } catch (historyError) {
            console.error("Error loading chat history:", historyError);
            setMessages([]);
          }
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setMessages([
          {
            role: "assistant",
            content:
              "I apologize, but I'm having trouble loading the chat session. Please try refreshing the page.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [sessionId]);

  // Load all chat sessions
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allSessions = await getAllChatSessions();
        setSessions(allSessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    loadSessions();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  useEffect(() => {
    if (!isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted");
    const currentMessage = message.trim();
    console.log("Current message:", currentMessage);
    console.log("Session ID:", sessionId);
    console.log("Is typing:", isTyping);
    console.log("Is chat paused:", isChatPaused);

    if (!currentMessage || isTyping || isChatPaused || !sessionId) {
      console.log("Submission blocked:", {
        noMessage: !currentMessage,
        isTyping,
        isChatPaused,
        noSessionId: !sessionId,
      });
      return;
    }

    setMessage("");
    setIsTyping(true);

    try {
      // Add user message
      const userMessage: ChatMessage = {
        role: "user",
        content: currentMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Check for stress signals
      const stressCheck = detectStressSignals(currentMessage);
      if (stressCheck) {
        setStressPrompt(stressCheck);
        setIsTyping(false);
        return;
      }

      console.log("Sending message to API...");
      // Send message to API
      const response = await sendChatMessage(sessionId, currentMessage);
      console.log("Raw API response:", response);

      // Parse the response if it's a string
      const aiResponse =
        typeof response === "string" ? JSON.parse(response) : response;
      console.log("Parsed AI response:", aiResponse);

      // Add AI response with metadata
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          aiResponse.response ||
          aiResponse.message ||
          "I'm here to support you. Could you tell me more about what's on your mind?",
        timestamp: new Date(),
        metadata: {
          analysis: aiResponse.analysis || {
            emotionalState: "neutral",
            riskLevel: 0,
            themes: [],
            recommendedApproach: "supportive",
            progressIndicators: [],
          },
          technique: aiResponse.metadata?.technique || "supportive",
          goal: aiResponse.metadata?.currentGoal || "Provide support",
          progress: aiResponse.metadata?.progress || {
            emotionalState: "neutral",
            riskLevel: 0,
          },
        },
      };

      console.log("Created assistant message:", assistantMessage);

      // Add the message immediately
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      scrollToBottom();
    } catch (error) {
      console.error("Error in chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const detectStressSignals = (message: string): StressPrompt | null => {
    const stressKeywords = [
      "stress",
      "anxiety",
      "worried",
      "panic",
      "overwhelmed",
      "nervous",
      "tense",
      "pressure",
      "can't cope",
      "exhausted",
    ];

    const lowercaseMsg = message.toLowerCase();
    const foundKeyword = stressKeywords.find((keyword) =>
      lowercaseMsg.includes(keyword)
    );

    if (foundKeyword) {
      const activities = [
        {
          type: "breathing" as const,
          title: "Breathing Exercise",
          description:
            "Follow calming breathing exercises with visual guidance",
        },
        {
          type: "garden" as const,
          title: "Zen Garden",
          description: "Create and maintain your digital peaceful space",
        },
        {
          type: "forest" as const,
          title: "Mindful Forest",
          description: "Take a peaceful walk through a virtual forest",
        },
        {
          type: "waves" as const,
          title: "Ocean Waves",
          description: "Match your breath with gentle ocean waves",
        },
      ];

      return {
        trigger: foundKeyword,
        activity: activities[Math.floor(Math.random() * activities.length)],
      };
    }

    return null;
  };

  const handleSuggestedQuestion = async (text: string) => {
    if (!sessionId) {
      const newSessionId = await createChatSession();
      setSessionId(newSessionId);
      router.push(`/therapy/${newSessionId}`);
    }

    setMessage(text);
    setTimeout(() => {
      const event = new Event("submit") as unknown as React.FormEvent;
      handleSubmit(event);
    }, 0);
  };

  const handleCompleteSession = async () => {
    if (isCompletingSession) return;
    setIsCompletingSession(true);
    try {
      setShowNFTCelebration(true);
    } catch (error) {
      console.error("Error completing session:", error);
    } finally {
      setIsCompletingSession(false);
    }
  };

  const handleSessionSelect = async (selectedSessionId: string) => {
    if (selectedSessionId === sessionId) return;

    try {
      setIsLoading(true);
      const history = await getChatHistory(selectedSessionId);
      if (Array.isArray(history)) {
        const formattedHistory = history.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(formattedHistory);
        setSessionId(selectedSessionId);
        window.history.pushState({}, "", `/therapy/${selectedSessionId}`);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[800px] h-[800px] blur-3xl top-0 -left-20 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-primary/30 to-transparent animate-pulse-gentle" style={{ 
            clipPath: 'polygon(50% 0%, 0% 38%, 12% 25%, 25% 25%, 37% 38%, 50% 0%, 63% 38%, 75% 25%, 88% 25%, 100% 38%, 50% 100%)' 
          }} />
        </div>
        <div className="absolute w-[600px] h-[600px] blur-3xl bottom-0 right-0 opacity-20 animate-pulse delay-1000">
          <div className="w-full h-full bg-gradient-to-r from-secondary/30 to-transparent" style={{ 
            clipPath: 'polygon(50% 0%, 0% 38%, 12% 25%, 25% 25%, 37% 38%, 50% 0%, 63% 38%, 75% 25%, 88% 25%, 100% 38%, 50% 100%)' 
          }} />
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)] mt-20 gap-6">
        {/* Enhanced Sidebar with chat history */}
        <div className="w-80 flex flex-col border-r bg-muted/30 backdrop-blur-sm">
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-semibold">Your Sessions</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewSession}
                className="hover:bg-primary/10 transition-all duration-200 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
              </Button>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 transition-all duration-200"
              onClick={handleNewSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
              Start New Session
            </Button>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {sessions.map((session) => (
                <motion.div
                  key={session.sessionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "p-4 rounded-xl text-sm cursor-pointer transition-all duration-200 border",
                    session.sessionId === sessionId
                      ? "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary shadow-lg"
                      : "bg-secondary/10 hover:bg-secondary/20 border-transparent hover:border-primary/10"
                  )}
                  onClick={() => handleSessionSelect(session.sessionId)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      session.sessionId === sessionId
                        ? "bg-gradient-to-r from-primary to-primary/80"
                        : "bg-secondary"
                    )}>
                      <MessageSquare className={cn(
                        "w-4 h-4",
                        session.sessionId === sessionId ? "text-white" : "text-secondary-foreground"
                      )} />
                    </div>
                    <span className="font-medium line-clamp-1">
                      {session.messages[0]?.content.slice(0, 25) || "New Session"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-muted-foreground text-xs mb-3">
                    {session.messages[session.messages.length - 1]?.content ||
                      "Start your wellness journey"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-xs text-muted-foreground">
                        {session.messages.length} messages
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(() => {
                        try {
                          const date = new Date(session.updatedAt);
                          if (isNaN(date.getTime())) {
                            return "Just now";
                          }
                          return formatDistanceToNow(date, {
                            addSuffix: true,
                          });
                        } catch (error) {
                          return "Just now";
                        }
                      })()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-background rounded-lg border">
          {/* Enhanced Chat header */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="font-semibold text-lg">AI Wellness Partner</h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    {messages.length} messages
                  </p>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-primary">AI Ready</span>
              </div>
            </div>
          </div>

          {messages.length === 0 ? (
            // Welcome screen with suggested questions
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="max-w-2xl w-full space-y-8">
                <div className="text-center space-y-4">
                  <div className="relative inline-flex flex-col items-center">
                    <motion.div
                      className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
                      initial="initial"
                      animate="animate"
                      variants={glowAnimation}
                    />
                    <div className="relative flex items-center gap-3 text-3xl font-bold">
                      <div className="relative">
                        <Sparkles className="w-8 h-8 text-primary" />
                        <motion.div
                          className="absolute inset-0 text-primary"
                          initial="initial"
                          animate="animate"
                          variants={glowAnimation}
                        >
                          <Sparkles className="w-8 h-8" />
                        </motion.div>
                      </div>
                      <span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
                        AI Wellness Partner
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-3 text-lg">
                      Ready to transform your emotional wellness? ✨
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">AI Active & Ready</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 relative">
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  {SUGGESTED_QUESTIONS.map((q, index) => (
                    <motion.div
                      key={q.text}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-auto py-6 px-6 text-left justify-start hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:border-primary/50 transition-all duration-300 rounded-xl border-2 group"
                        onClick={() => handleSuggestedQuestion(q.text)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </div>
                          <span className="font-medium">{q.text}</span>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Chat messages
            <div className="flex-1 overflow-y-auto scroll-smooth">
              <div className="max-w-3xl mx-auto">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.timestamp.toISOString()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        "px-6 py-8",
                        msg.role === "assistant"
                          ? "bg-muted/30"
                          : "bg-background"
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="w-10 h-10 shrink-0 mt-1">
                          {msg.role === "assistant" ? (
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white flex items-center justify-center ring-2 ring-primary/20 shadow-lg">
                                <Bot className="w-5 h-5" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground flex items-center justify-center ring-2 ring-secondary/20 shadow-lg">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-2 overflow-hidden min-h-[2rem]">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm">
                              {msg.role === "assistant"
                                ? "AI Therapist"
                                : "You"}
                            </p>
                            {msg.metadata?.technique && (
                              <Badge variant="secondary" className="text-xs">
                                {msg.metadata.technique}
                              </Badge>
                            )}
                          </div>
                          <div className="prose prose-sm dark:prose-invert leading-relaxed">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          {msg.metadata?.goal && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Goal: {msg.metadata.goal}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-6 py-8 flex gap-4 bg-muted/30"
                  >
                    <div className="w-8 h-8 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-sm">AI Therapist</p>
                      <p className="text-sm text-muted-foreground">Typing...</p>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Enhanced Input area */}
          <div className="border-t bg-gradient-to-r from-background/50 to-background/30 backdrop-blur supports-[backdrop-filter]:bg-background/50 p-6">
            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto flex gap-4 items-end relative"
            >
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isChatPaused
                      ? "Complete the activity to continue..."
                      : "Share your thoughts with your AI wellness partner..."
                  }
                  className={cn(
                    "w-full resize-none rounded-2xl border-2 bg-background/80 backdrop-blur-sm",
                    "p-4 pr-14 min-h-[56px] max-h-[200px]",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50",
                    "transition-all duration-300",
                    "placeholder:text-muted-foreground/70",
                    (isTyping || isChatPaused) &&
                      "opacity-50 cursor-not-allowed",
                    "group-hover:border-primary/30"
                  )}
                  rows={1}
                  disabled={isTyping || isChatPaused}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    "absolute right-2 bottom-2 h-[40px] w-[40px]",
                    "rounded-xl transition-all duration-300",
                    "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                    "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
                    (isTyping || isChatPaused || !message.trim()) &&
                      "opacity-50 cursor-not-allowed",
                    "group-hover:scale-110 group-focus-within:scale-110"
                  )}
                  disabled={isTyping || isChatPaused || !message.trim()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
            <div className="mt-3 text-xs text-center text-muted-foreground flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded-md bg-muted border">Enter ↵</kbd>
                <span>to send</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded-md bg-muted border">Shift + Enter</kbd>
                <span>for new line</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
