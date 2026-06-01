import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Get the authenticated user's ID from the session.
 * Returns null if not authenticated.
 */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}
