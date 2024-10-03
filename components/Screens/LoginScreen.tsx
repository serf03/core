"use client"

import { ArrowRightIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"


export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [step, setStep] = useState(1)
    const [error, setError] = useState('')

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            setStep(2)
        } else {
            setError('Please enter your email')
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        // Aquí iría la lógica de autenticación real
        console.log('Login attempt with:', email, password)
        // Simulando un error de login para demostración
        setError('Invalid email or password')
    }

    const slideVariants = {
        enter: (direction: number) => {
            return {
                x: direction > 0 ? 1000 : -1000,
                opacity: 0
            }
        },
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => {
            return {
                zIndex: 0,
                x: direction < 0 ? 1000 : -1000,
                opacity: 0
            }
        }
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen overflow-hidden">
            <div className="relative z-10">
                <Card className="w-[350px] bg-white/80 backdrop-blur-md shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-800">Welcome Back</CardTitle>
                        <CardDescription className="text-gray-600">Sign in to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait" initial={false}>
                            {step === 1 && (
                                <motion.form
                                    key="email"
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    onSubmit={handleEmailSubmit}
                                >
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="text-gray-700">Email</Label>
                                            <Input
                                                id="email"
                                                placeholder="name@example.com"
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="bg-white/50 border-gray-300"
                                            />
                                        </div>
                                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                                            Continue
                                            <ArrowRightIcon className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.form>
                            )}
                            {step === 2 && (
                                <motion.form
                                    key="password"
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                    onSubmit={handleLogin}
                                >
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password" className="text-gray-700">Password</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                autoCapitalize="none"
                                                autoComplete="current-password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="bg-white/50 border-gray-300"
                                            />
                                        </div>
                                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Sign In</Button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </CardContent>
                    <CardFooter>
                        {error && (
                            <Alert variant="destructive" className="bg-red-100 border-red-400 text-red-700">
                                <ExclamationTriangleIcon className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}