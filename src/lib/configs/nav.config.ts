import { ClipboardList, Home, Info, Plus, Rocket, Shield } from "lucide-react";

export type TNavConfig = {
  id: string;
  label: string;
  href: string;
  Icon?: React.ElementType; // Optional: Add icon property if needed
};

export const navConfig: TNavConfig[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    Icon: Home,
  },
  {
    id: "create-token",
    label: "Create Token",
    href: "/create-token",
    Icon: Plus,
  },
  {
    id: "create-launchpad",
    label: "Create Launchpad",
    href: "/create-launchpad",
    Icon: Rocket,
  },
  {
    id: "manage-launchpad",
    label: "Manage Presales",
    href: "/manage-launchpad",
    Icon: Shield,
  },
  {
    id: "manage-assets",
    label: "Manage Assets",
    href: "/dashboard/manage-assets",
    Icon: ClipboardList,
  },
  {
    id: "about",
    label: "About",
    href: "/about",
    Icon: Info,
  },
];
