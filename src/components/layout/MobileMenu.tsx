"use client";

import { navConfig } from "@/lib/configs/nav.config";
import { cn } from "@/lib/utils";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const pathname = usePathname();

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="left">
      <DrawerContent className="w-80 max-w-[85vw]">
        <DrawerHeader className="border-b border-border">
          <DrawerTitle className="text-xl font-bold text-foreground">Menu</DrawerTitle>
        </DrawerHeader>

        <nav className="flex flex-col gap-2 p-4 flex-1 overflow-y-auto">
          {navConfig.map((item) => {
            const isActive = pathname === item.href;

            return (
              <DrawerClose key={item.id} asChild>
                <Link
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
                    <span>{item.label}</span>
                  </div>
                </Link>
              </DrawerClose>
            );
          })}
        </nav>

        <DrawerFooter className="border-t border-border">
          <div className="text-xs text-muted-foreground font-sans text-center leading-relaxed">
            Launch.Fun v0.1
            <br />
            Confidential Launchpad
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
