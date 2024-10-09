// components/App.tsx
"use client";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CinematicPlanetLoading from "./Loading";
import Layout from './Module/LayoutAnimate';
import { LoginScreen } from "./Screens/LoginScreen";
import { System } from './System';
import { ToastProvider } from "./ui/use-toast";

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
    const { user, loading } = useAuth(); // Asegúrate de que `useAuth` se usa aquí correctamente

    // Muestra un componente de carga mientras se verifica el estado de autenticación
    if (loading) {
        return <CinematicPlanetLoading />; // Componente de carga
    }

    return (
        <Layout>
            {user ? <System /> : <LoginScreen />} {/* Renderiza dashboard si hay usuario, de lo contrario, pantalla de login */}
        </Layout>
    );
}
