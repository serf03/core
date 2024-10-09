import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push("/login"); // Redirigir al login si no está autenticado
        }
    }, [user, router]);

    return user ? <>{children}</> : null;
}
