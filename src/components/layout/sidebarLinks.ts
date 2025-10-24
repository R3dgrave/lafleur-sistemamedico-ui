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
    disabled?: boolean;
  }[];
};

export const sidebarLinks: SidebarLink[] = [
  {
    section: "Panel",
    items: [
      { label: "Principal", to: "/dashboard", icon: Home, disabled: true },
      { label: "Pacientes", to: "/pacientes", icon: Users2 },
      { label: "Citas", to: "/citas", icon: CalendarDays },
      { label: "reserva", to: "/reserva", icon: CalendarDays, disabled: true },
    ],
  },
  {
    section: "Finanzas",
    items: [
      { label: "Gastos", to: "/transactions", icon: Wallet, disabled: true },
      { label: "Ingresos", to: "/invoices", icon: Receipt, disabled: true },
      { label: "Balance", to: "/payments", icon: CreditCard, disabled: true },
    ],
  },
  {
    section: "Inventario",
    items: [
      { label: "Stock", to: "/members", icon: BaggageClaim, disabled: true },
      { label: "Categorias", to: "/permissions", icon: Shield, disabled: true },
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
