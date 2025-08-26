import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import PatientsPage from "@/pages/patients";
import ConsultationPage from "@/pages/consultation";
import PharmacyPage from "@/pages/pharmacy";
import BillingPage from "@/pages/billing";
import CashierPage from "@/pages/cashier";
import InsurancePage from "@/pages/insurance";
import CommissionsPage from "@/pages/commissions";
import ExpensesPage from "@/pages/expenses";
import ReportsPage from "@/pages/reports";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/patients" component={PatientsPage} />
            <Route path="/consultation" component={ConsultationPage} />
            <Route path="/pharmacie" component={PharmacyPage} />
            <Route path="/facturation" component={BillingPage} />
            <Route path="/caisse" component={CashierPage} />
            <Route path="/assurances" component={InsurancePage} />
            <Route path="/commissions" component={CommissionsPage} />
            <Route path="/depenses" component={ExpensesPage} />
            <Route path="/rapports" component={ReportsPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
