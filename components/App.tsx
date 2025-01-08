"use client";

import dynamic from 'next/dynamic';
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from './Module/LayoutAnimate';
import { LoginScreen } from "./Screens/LoginScreen";
import { System } from './System';
import { ToastProvider } from "./ui/use-toast";

const DynamicCinematicPlanetLoading = dynamic(() => import('./Loading'), {
    ssr: false,
});

export function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <AppContent />
            </ToastProvider>
        </AuthProvider>
    );
}

function AppContent() {
    const { user, loading } = useAuth();

    if (loading) {
        return <DynamicCinematicPlanetLoading />;
    }

    return (
        <Layout>
            {user ? <System /> : <LoginScreen />}
        </Layout>
    );
}

