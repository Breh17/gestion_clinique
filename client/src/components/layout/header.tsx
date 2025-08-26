import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900" data-testid="text-page-title">
          Tableau de bord
        </h1>
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              data-testid="button-notifications"
              variant="ghost"
              size="icon"
              className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-medical-primary rounded-lg"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-medical-danger rounded-full flex items-center justify-center text-xs text-white">
                3
              </span>
            </Button>
          </div>

          {/* Quick Actions */}
          <Button
            data-testid="button-quick-action"
            className="bg-medical-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-150"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Action
          </Button>
        </div>
      </div>
    </header>
  );
}
