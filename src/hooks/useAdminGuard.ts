/**
 * Admin Guard Hook
 * 
 * Verifies that the current user has Admin role and redirects unauthorized users.
 * Use this hook in layouts or pages that should only be accessible to admins.
 * 
 * @example
 * ```tsx
 * function SellerLayout({ children }) {
 *   const { isAdmin, loading } = useAdminGuard();
 *   
 *   if (loading) return <LoadingSpinner />;
 *   if (!isAdmin) return null; // Will redirect automatically
 *   
 *   return <div>{children}</div>;
 * }
 * ```
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AdminGuardResult {
    isAdmin: boolean | null;
    loading: boolean;
    role: string | null;
}

export function useAdminGuard(): AdminGuardResult {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAdminRole() {
            try {
                const response = await fetch("/api/auth/get-role");

                if (!response.ok) {
                    throw new Error("Failed to verify role");
                }

                const data = await response.json();

                // Handle expired token
                if (data.expired) {
                    toast.error("Session expired. Please log in again.");
                    router.replace("/login?redirect=/seller");
                    return;
                }

                // Handle not authenticated (no token)
                if (!data.authenticated) {
                    toast.info("Please log in to access seller pages.");
                    router.replace("/login?redirect=/seller");
                    return;
                }

                // Check if user has Admin role
                const hasAdminRole = data.role === "ADMIN";
                setIsAdmin(hasAdminRole);
                setRole(data.role);

                if (!hasAdminRole) {
                    toast.error("Access denied. Admin role required for seller pages.");
                    router.replace("/?error=unauthorized");
                }
            } catch (error) {
                console.error("[Admin Guard] Error checking role:", error);
                toast.error("Failed to verify access. Please try logging in again.");
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        }

        checkAdminRole();
    }, [router]);

    return { isAdmin, loading, role };
}
