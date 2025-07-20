import {
  Home,
  BarChart2,
  Building2,
  Folder,
  Wallet,
  Receipt,
  CreditCard,
  Users2,
  Shield,
  MessagesSquare,
  Video,
  Settings,
  HelpCircle,
} from "lucide-react"

type SidebarLink = {
  section: string
  items: {
    label: string
    to: string
    icon: React.ElementType
  }[]
}

export const sidebarLinks: SidebarLink[] = [
  {
    section: "Panel",
    items: [
      { label: "Principal", to: "/dashboard", icon: Home },
      { label: "Agenda", to: "/analytics", icon: BarChart2 },
      { label: "Pacientes", to: "/organization", icon: Building2 },
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
      { label: "Stock", to: "/members", icon: Users2 },
      { label: "Categorias", to: "/permissions", icon: Shield },
    ],
  },
  {
    section: "Otros",
    items: [
      { label: "Ajustes", to: "/settings", icon: Settings },
      { label: "Ayuda", to: "/help", icon: HelpCircle },
    ],
  },
]
