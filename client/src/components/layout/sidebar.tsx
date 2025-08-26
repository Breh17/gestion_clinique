import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { formatUserName, hasPermission, ROLES } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  CreditCard,
  Shield,
  Percent,
  Receipt,
  BarChart3,
  Hospital,
  LogOut,
  UserCircle,
} from "lucide-react";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard, roles: [] },
  { name: "Patients", href: "/patients", icon: Users, roles: [ROLES.SECRETAIRE, ROLES.MEDECIN] },
  { name: "Agenda", href: "/agenda", icon: Calendar, roles: [ROLES.SECRETAIRE, ROLES.MEDECIN] },
  { name: "Consultations", href: "/consultation", icon: Stethoscope, roles: [ROLES.MEDECIN] },
  { name: "Pharmacie", href: "/pharmacie", icon: Pill, roles: [ROLES.PHARMACIEN] },
  { name: "Facturation", href: "/facturation", icon: FileText, roles: [ROLES.CAISSIER, ROLES.MEDECIN] },
  { name: "Caisse", href: "/caisse", icon: CreditCard, roles: [ROLES.CAISSIER] },
  { name: "Assurances", href: "/assurances", icon: Shield, roles: [ROLES.CAISSIER, ROLES.COMPTABLE] },
  { name: "Commissions", href: "/commissions", icon: Percent, roles: [ROLES.COMPTABLE] },
  { name: "Dépenses", href: "/depenses", icon: Receipt, roles: [ROLES.COMPTABLE] },
  { name: "Rapports", href: "/rapports", icon: BarChart3, roles: [ROLES.COMPTABLE, ROLES.SUPERVISEUR] },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const visibleNavigation = navigation.filter(item => 
    item.roles.length === 0 || hasPermission(user.role as any, item.roles)
  );

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-medical-primary">
        <div className="flex items-center space-x-2">
          <Hospital className="text-white text-xl h-6 w-6" />
          <span className="text-white font-bold text-lg">MediClinic Pro</span>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-secondary rounded-full flex items-center justify-center">
            <UserCircle className="text-white h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900" data-testid="text-username">
              {formatUserName(user)}
            </p>
            <p className="text-xs text-gray-500" data-testid="text-role">
              {user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-4 px-2 space-y-1">
        {visibleNavigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "text-medical-primary bg-blue-50 border-r-2 border-medical-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              data-testid={`link-${item.href.slice(1) || 'dashboard'}`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-medical-primary" : "text-gray-400 group-hover:text-gray-500"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4">
        <Button
          data-testid="button-logout"
          onClick={() => logout()}
          variant="ghost"
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-150"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}
