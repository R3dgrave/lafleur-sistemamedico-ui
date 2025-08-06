import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react"; // Importa useEffect
import { sidebarLinks } from "./sidebarLinks";
import useAuthStore from "@/store/authStore";

export default function Sidebar({
  collapsed = false,
}: {
  collapsed?: boolean;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user: loggedInUser, isLoading: isLoadingUser } = useAuthStore();
  const handleNavigation = () => setIsMobileMenuOpen(false);

  const NavItem = ({
    to,
    icon: Icon,
    children,
  }: {
    to: string;
    icon: any;
    children: React.ReactNode;
  }) => (
    <Link
      to={to}
      onClick={handleNavigation}
      className="flex items-center px-3 py-2 text-sm rounded-md transition-colors text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
    >
      <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
      {!collapsed && children}
    </Link>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] lg:shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>

      <nav
        className={`
          fixed inset-y-0 left-0 z-[70] bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
          lg:translate-x-0 lg:static border-r border-gray-200 dark:border-[#1F1F23]
          ${collapsed ? "w-16" : "w-64"}
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 px-4 flex items-center justify-start border-b border-gray-200 dark:border-[#1F1F23]">
            {!collapsed ? (
              <>
                <img
                  src="https://kokonutui.com/logo.svg"
                  className="w-8 h-8 mr-2" // Añadido margen
                  alt="Logo"
                />
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  La Fleur
                </p>
              </>
            ) : (
              <img
                src="https://kokonutui.com/logo.svg"
                className="w-6 h-6"
                alt="Logo"
              />
            )}
          </div>

          {/* Sección de información del usuario */}
          {!isLoadingUser && loggedInUser && (
            <div className="px-4 py-4 border-b border-gray-200 dark:border-[#1F1F23] flex flex-col items-center">
              {/* Imagen de perfil */}
              <img
                src={
                  loggedInUser.profilePictureUrl ||
                  "https://placehold.co/80x80/cccccc/333333?text=User"
                } // Placeholder si no hay imagen
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover mb-3 border-2 border-gray-300 dark:border-gray-600"
              />
              {!collapsed && (
                <div className="text-center">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {loggedInUser.nombre} {loggedInUser.apellido}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {loggedInUser.email}
                  </p>
                </div>
              )}
            </div>
          )}
          {isLoadingUser && !collapsed && (
            <div className="px-4 py-4 border-b border-gray-200 dark:border-[#1F1F23] flex flex-col items-center animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mt-1"></div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
            {sidebarLinks.map((section) => (
              <div key={section.section}>
                {!collapsed && (
                  <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {section.section}
                  </div>
                )}
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <NavItem key={item.to} to={item.to} icon={item.icon}>
                      {item.label}
                    </NavItem>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
