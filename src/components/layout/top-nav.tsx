import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Bell, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeToggle } from "../toggle/mode-toggle";
import Profile01 from "./profile-01";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function TopNav({
  onToggleSidebar,
  isCollapsed,
}: {
  onToggleSidebar: () => void;
  isCollapsed: boolean;
}) {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "kokonutUI", href: "/" },
    { label: "dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="px-3 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors"
      >
        {isCollapsed ? (
          <ChevronsRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronsLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        )}
      </button>

      <Separator
        orientation="vertical"
        className="hidden sm:flex mx-2 data-[orientation=vertical]:h-4"
      />

      <div className="ml-2 grow font-medium text-sm hidden sm:flex items-center space-x-1 truncate">
        {breadcrumbs.map((item, index) => (
          <div key={item.label} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1" />
            )}
            {item.href ? (
              <Link
                to={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-900 dark:text-gray-100">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
        <button
          type="button"
          className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <img
              src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
              alt="User avatar"
              className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 w-7 h-7 object-cover cursor-pointer"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            <Profile01 avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png" />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
