"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lock } from "lucide-react";

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const handleLock = async () => {
    // Call server-side logout to clear HttpOnly cookies
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    // Full reload to clear session state
    window.location.reload();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 text-xs">
          <Lock className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Lock</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleLock}
          className="text-destructive cursor-pointer"
        >
          <Lock className="h-4 w-4 mr-2" />
          Lock App
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
