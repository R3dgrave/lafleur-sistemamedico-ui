import {
  Home,
  Wallet,
  Receipt,
  CreditCard,
  User,
  Shield,
  Settings,
  Users2,
  CalendarDays,
  BaggageClaim,
} from "lucide-react";


type SidebarLink = {
  section: string;
  items: {
    label: string;
    to: string;
    icon: React.ElementType;
  }[];
};

export const sidebarLinks: SidebarLink[] = [
  {
    section: "Panel",
    items: [
      { label: "Principal", to: "/dashboard", icon: Home },
      { label: "Pacientes", to: "/pacientes", icon: Users2 },
      { label: "Citas", to: "/citas", icon: CalendarDays },
      { label: "reserva", to: "/reserva", icon: CalendarDays },
    ],
  },
  {
    section: "Finanzas",
    items: [
      { label: "Gastos", to: "/transactions", icon: Wallet },
      { label: "Ingresos", to: "/invoices", icon: Receipt },
      { label: "Balance", to: "/payments", icon: CreditCard },
    ],
  },
  {
    section: "Inventario",
    items: [
      { label: "Stock", to: "/members", icon: BaggageClaim },
      { label: "Categorias", to: "/permissions", icon: Shield },
    ],
  },
  {
    section: "Otros",
    items: [
      { label: "Perfil", to: "/perfil", icon: User },
      { label: "Ajustes", to: "/ajustes", icon: Settings },
    ],
  },
];
