import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

interface Props {
    children: React.ReactNode;
}

export default function Protected({ children }: Props) {
    const { isLoggedIn } = useAuthStore();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}