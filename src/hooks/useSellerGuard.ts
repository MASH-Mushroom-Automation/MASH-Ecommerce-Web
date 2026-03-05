import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SellerGuardResult {
    hasAccess: boolean | null;
    loading: boolean;
    role: string | null;
}

export function useSellerGuard(): SellerGuardResult {
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSellerRole() {
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

                // Allow access for SELLER or ADMIN roles
                const allowed = data.role === "SELLER" || data.role === "ADMIN";
                setHasAccess(allowed);
                setRole(data.role);

                if (!allowed) {
                    toast.error("Access denied. Seller or Admin role required.");
                    router.replace("/?error=unauthorized");
                }
            } catch (error) {
                console.error("[Seller Guard] Error checking role:", error);
                toast.error("Failed to verify access. Please try logging in again.");
                router.replace("/login");
            } finally {
                setLoading(false);
            }
        }

        checkSellerRole();
    }, [router]);

    return { hasAccess, loading, role };
}
