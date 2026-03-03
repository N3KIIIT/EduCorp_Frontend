import React from "react";
import {useSessionStore} from "@/entities/session";

interface ProtectedElementProps {
    role: string;
    children: React.ReactNode;
}

    const ProtectedElement = ({ role, children } : ProtectedElementProps) => {
    const { user } = useSessionStore();

    if (!user?.hasRole(role)) {
        return null;
    }

    return children;
};

export default ProtectedElement;