"use client";

import { navConfig } from "@/lib/configs/nav.config";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-full min-h-screen p-4 gap-3 backdrop-blur-sm">
      {/* Sidebar Header / Title */}
      <div className="bg-primary text-white font-sans text-center py-3 rounded-lg shadow-lg mb-4">
        <span className="font-bold text-sm uppercase tracking-wider">MENU</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {navConfig.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "px-4 py-3 text-sm font-semibold text-foreground font-sans transition-all rounded-lg relative",
                // Default state
                "bg-muted/50 hover:bg-muted hover:scale-[1.02]",
                // Active state
                isActive && "bg-primary text-white shadow-lg scale-[1.02]"
              )}
            >
              <div className="flex items-center gap-3">
                {item.Icon && <item.Icon className="size-5" />}
                <span className="">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Extra info or footer in sidebar */}
      <div className="mt-auto p-4 bg-muted/50 rounded-lg border border-border">
        <div className="text-xs text-muted-foreground font-sans text-center leading-relaxed">
          Launch.Fun v0.1
          <br />
          Confidential Launchpad
        </div>
      </div>
    </aside>
  );
}
