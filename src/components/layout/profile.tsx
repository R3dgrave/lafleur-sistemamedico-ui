// src/components/layout/Profile01.tsx
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { LogOut, Settings, User } from "lucide-react";
import type { Administrador } from "@/types";
import useAuthStore from "@/store/authStore";

interface ProfileProps {
  user: Administrador | null;
}

export default function Profile({ user }: ProfileProps) {
  const { logout } = useAuthStore();

  if (!user) {
    // Si no hay datos de usuario, muestra un estado de carga o un placeholder simple
    return (
      <DropdownMenuLabel className="font-normal">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="flex flex-col space-y-1">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </DropdownMenuLabel>
    );
  }

  return (
    <>
      {/* Sección de información del usuario */}
      <DropdownMenuLabel className="font-normal">
        <div className="flex items-center space-x-2">
          <img
            src={
              user.profilePictureUrl ||
              "https://placehold.co/40x40/cccccc/333333?text=User"
            } // Imagen de perfil dinámica
            alt="User avatar"
            className="rounded-full object-cover w-10 h-10"
          />
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">
              {user.nombre} {user.apellido}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-blue-500 dark:text-blue-400 uppercase mt-1">
              {user.role}
            </p>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {/* Opciones del menú */}
      <DropdownMenuItem asChild>
        <Link to="/perfil" className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <Link to="/ajustes" className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Ajustes</span>
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={logout} className="cursor-pointer">
        <LogOut className="mr-2 h-4 w-4" />
        <span>Cerrar Sesión</span>
      </DropdownMenuItem>
    </>
  );
}
