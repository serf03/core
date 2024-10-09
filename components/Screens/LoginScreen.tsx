"use client";

import { useToast } from "@/components/ui/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setShowPassword(true);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            toast({
                title: "Invalid Input",
                description: "Email and password cannot be empty.",
                variant: "destructive",
            });
            return;
        }
        try {
            await login(email, password);
            toast({
                title: "Login successful",
                description: "Redirecting to dashboard...",
            });
        } catch {
            toast({
                title: "Login failed",
                description: "Please check your credentials and try again.",
                variant: "destructive",
            });
        }
    };

    const inputVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50 },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Welcome Qc</h1>
                <form onSubmit={showPassword ? handleLogin : handleEmailSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                        {!showPassword && (
                            <motion.div
                                key="email"
                                variants={inputVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white bg-opacity-50 backdrop-blur-md border-none rounded-lg py-3 px-4 text-lg focus:ring-2 focus:ring-purple-400 transition duration-300"
                                />
                            </motion.div>
                        )}
                        {showPassword && (
                            <motion.div
                                key="password"
                                variants={inputVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}  // Revisar que el valor sea el adecuado
                                    onChange={(e) => setPassword(e.target.value)}  // Asegúrate que el onChange actualiza el estado
                                    required
                                    className="w-full bg-white bg-opacity-50 backdrop-blur-md border-none rounded-lg py-3 px-4 text-lg focus:ring-2 focus:ring-purple-400 transition duration-300"
                                />

                            </motion.div>
                        )}
                    </AnimatePresence>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 px-4 text-lg font-semibold transition duration-300 flex items-center justify-center"
                        >
                            {showPassword ? "Login" : "Next"}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>
                </form>
                {showPassword && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        <Button
                            variant="ghost"
                            onClick={() => setShowPassword(false)}
                            className="mt-4 w-full text-gray-600 hover:text-gray-800 transition duration-300 flex items-center justify-center"
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Back to Email
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
