import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create the NextAuth handler once
const authHandler = NextAuth(authOptions);

async function handler(
  req: Request,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  // Dynamically determine the correct base URL from proxy headers.
  // This ensures NextAuth constructs redirect URLs using the actual external host
  // instead of localhost, which is critical when running behind a reverse proxy (Caddy).
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host");

  // Prefer X-Forwarded-Host over direct Host header
  const effectiveHost = forwardedHost || host || "localhost:3000";
  // Prefer X-Forwarded-Proto, otherwise infer from host
  const effectiveProto =
    forwardedProto || (effectiveHost.startsWith("localhost") ? "http" : "https");

  process.env.NEXTAUTH_URL = `${effectiveProto}://${effectiveHost}`;

  return authHandler(req, context);
}

export { handler as GET, handler as POST };
