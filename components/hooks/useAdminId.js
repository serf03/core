// hooks/useAdminId.js
import { useAuth } from '../context/AuthContext';

export const useAdminId = () => {
    const { user } = useAuth();
    return user?.uid; // Esto devolverá el adminId
};
