import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MedicationInventory } from "@/components/pharmacy/medication-inventory";
import { PrescriptionDispense } from "@/components/pharmacy/prescription-dispense";
import { StatsCard } from "@/components/ui/stats-card";
import { Pill, AlertTriangle, Clock, Euro, Search, Plus, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get medications
  const { data: medications = [], isLoading: medicationsLoading } = useQuery({
    queryKey: ["/api/medications"],
  });

  // Mock data for pharmacy stats - replace with real API calls
  const pharmacyStats = {
    totalMedications: medications.length || 847,
    lowStock: 12,
    expiringSoon: 5,
    stockValue: 45230,
  };

  // Mock pending prescriptions - replace with real API
  const pendingPrescriptions = [
    {
      id: "1",
      patient: "Marie Dubois",
      doctor: "Dr. Jean Martin",
      time: "14:45",
      itemCount: 3,
    },
    {
      id: "2", 
      patient: "Pierre Leclerc",
      doctor: "Dr. Sophie Blanc",
      time: "15:12",
      itemCount: 2,
    },
  ];

  // Mock stock alerts
  const stockAlerts = [
    {
      id: "1",
      medication: "Aspirine 500mg",
      stock: 3,
      type: "low_stock",
    },
    {
      id: "2",
      medication: "Ibuprofène 200mg",
      expiry: "15/03/2024",
      type: "expiring",
    },
  ];

  if (medicationsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                <Input
                  data-testid="input-search-medications"
                  placeholder="Rechercher médicament, ordonnance..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="select-category-filter">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="antibiotiques">Antibiotiques</SelectItem>
                <SelectItem value="antalgiques">Antalgiques</SelectItem>
                <SelectItem value="vitamines">Vitamines</SelectItem>
                <SelectItem value="cardiovasculaire">Cardiovasculaire</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger data-testid="select-stock-filter">
                <SelectValue placeholder="Tous les stocks" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les stocks</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="expiring">Bientôt périmé</SelectItem>
                <SelectItem value="out">En rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Médicaments"
          value={pharmacyStats.totalMedications}
          icon={Pill}
          iconColor="text-medical-primary"
        />
        
        <StatsCard
          title="Stock Faible"
          value={pharmacyStats.lowStock}
          icon={AlertTriangle}
          iconColor="text-medical-warning"
        />
        
        <StatsCard
          title="Bientôt Périmés"
          value={pharmacyStats.expiringSoon}
          icon={Clock}
          iconColor="text-medical-danger"
        />
        
        <StatsCard
          title="Valeur Stock"
          value={`€${pharmacyStats.stockValue.toLocaleString()}`}
          icon={Euro}
          iconColor="text-medical-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Inventory */}
        <div className="lg:col-span-3">
          <MedicationInventory
            medications={medications}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            stockFilter={stockFilter}
          />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pending Prescriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Ordonnances en Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingPrescriptions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucune ordonnance en attente
                  </p>
                ) : (
                  pendingPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {prescription.patient}
                        </span>
                        <span className="text-xs text-gray-500">
                          {prescription.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {prescription.doctor}
                      </p>
                      <div className="text-xs text-gray-500 mb-2">
                        {prescription.itemCount} médicaments prescrits
                      </div>
                      <Button
                        data-testid={`button-process-prescription-${prescription.id}`}
                        size="sm"
                        className="w-full bg-medical-primary hover:bg-blue-700 text-xs"
                      >
                        Traiter
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Alertes Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stockAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Aucune alerte
                  </p>
                ) : (
                  stockAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        alert.type === 'low_stock' 
                          ? 'bg-red-50' 
                          : 'bg-yellow-50'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {alert.medication}
                        </p>
                        <p className="text-xs text-gray-500">
                          {alert.type === 'low_stock' 
                            ? `Stock: ${alert.stock} unités`
                            : `Expire: ${alert.expiry}`
                          }
                        </p>
                      </div>
                      <AlertTriangle
                        className={
                          alert.type === 'low_stock'
                            ? 'text-red-500 h-4 w-4'
                            : 'text-yellow-500 h-4 w-4'
                        }
                      />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
