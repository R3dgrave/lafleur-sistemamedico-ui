import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Bell, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useLocation } from "react-router-dom";
import { ModeToggle } from "../toggle/mode-toggle";
import Profile from "./profile";
import { createElement } from "react";
import { sidebarLinks } from "./sidebarLinks";
import useAuthStore from "@/store/authStore";

export default function TopNav({
  onToggleSidebar,
  isCollapsed,
}: {
  onToggleSidebar: () => void;
  isCollapsed: boolean;
}) {
  const location = useLocation();
  const { user: loggedInUser, isLoading: isLoadingUser } = useAuthStore();

  // Lógica para determinar el nombre y el icono de la sección actual
  const getCurrentSection = () => {
    // Itera sobre todas las secciones y sus elementos en sidebarLinks
    for (const section of sidebarLinks) {
      for (const item of section.items) {
        // Si la ruta actual coincide con la ruta de un elemento del sidebar
        if (location.pathname === item.to) {
          return { label: item.label, icon: item.icon };
        }
      }
    }
    // Si no se encuentra una coincidencia, por ejemplo, en la ruta raíz o una no definida
    return { label: "Dashboard", icon: null }; // Puedes usar un icono por defecto
  };

  const currentSection = getCurrentSection(); // Obtiene la información de la sección actual

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

      {/* Aquí se muestra el icono y el nombre de la sección actual */}
      <div className="ml-2 grow font-medium text-sm flex items-center space-x-2 truncate">
        {currentSection.icon &&
          // Renderiza el icono si existe
          createElement(currentSection.icon, {
            className: "h-5 w-5 text-gray-600 dark:text-gray-300",
          })}
        <span className="text-gray-400 dark:text-gray-100">
          / {currentSection.label}
        </span>
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
            {/* Muestra la imagen de perfil del usuario o un placeholder */}
            <img
              src={
                loggedInUser?.profilePictureUrl ||
                "https://placehold.co/80x80/cccccc/333333?text=User"
              }
              alt="User avatar"
              className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 w-7 h-7 object-cover cursor-pointer"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-[400px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
          >
            {/* Pasa los datos del usuario al componente Profile */}
            {isLoadingUser ? (
              // Muestra un estado de carga mientras se obtienen los datos del usuario
              <div className="px-4 py-2">Cargando usuario...</div>
            ) : (
              <Profile user={loggedInUser} />
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
