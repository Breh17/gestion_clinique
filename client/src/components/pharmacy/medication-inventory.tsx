import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HandHeart, Edit, Plus, Download } from "lucide-react";
import type { Medication } from "@/types";

interface MedicationInventoryProps {
  medications: Medication[];
  searchQuery: string;
  categoryFilter: string;
  stockFilter: string;
}

export function MedicationInventory({ 
  medications, 
  searchQuery, 
  categoryFilter, 
  stockFilter 
}: MedicationInventoryProps) {
  
  // Mock stock data - replace with real API data
  const getMedicationStock = (medicationId: string) => {
    // This should come from medication lots API
    const mockStocks = {
      [medicationId]: {
        quantity: Math.floor(Math.random() * 100) + 1,
        threshold: 20,
        expiryDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.8 ? 'stock_faible' : 'disponible'
      }
    };
    return mockStocks[medicationId] || {
      quantity: 50,
      threshold: 20,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      status: 'disponible'
    };
  };

  const filteredMedications = medications.filter((medication: Medication) => {
    const matchesSearch = !searchQuery || 
      medication.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medication.dci?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || categoryFilter === "all" ||
      medication.category?.toLowerCase() === categoryFilter.toLowerCase();
    
    const stock = getMedicationStock(medication.id);
    const matchesStock = !stockFilter || stockFilter === "all" ||
      (stockFilter === 'low' && stock.quantity < stock.threshold) ||
      (stockFilter === 'expiring' && stock.expiryDate < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) ||
      (stockFilter === 'out' && stock.quantity === 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const getStatusColor = (status: string, quantity: number, threshold: number) => {
    if (quantity === 0) return 'bg-red-100 text-red-800';
    if (quantity < threshold) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusLabel = (status: string, quantity: number, threshold: number) => {
    if (quantity === 0) return 'Rupture';
    if (quantity < threshold) return 'Stock Faible';
    return 'Disponible';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Inventaire Médicaments</CardTitle>
          <div className="flex space-x-2">
            <Button
              data-testid="button-add-stock"
              className="bg-medical-success hover:bg-green-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter Stock
            </Button>
            <Button
              data-testid="button-export-inventory"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Médicament
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Péremption
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery || categoryFilter || stockFilter 
                      ? "Aucun médicament trouvé avec ces critères" 
                      : "Aucun médicament dans l'inventaire"
                    }
                  </td>
                </tr>
              ) : (
                filteredMedications.map((medication: Medication) => {
                  const stock = getMedicationStock(medication.id);
                  const isLowStock = stock.quantity < stock.threshold;
                  const isExpiringSoon = stock.expiryDate < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <tr key={medication.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900" data-testid={`medication-name-${medication.id}`}>
                            {medication.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {medication.form} - {medication.packaging}
                          </div>
                          {medication.dci && (
                            <div className="text-xs text-gray-400">
                              DCI: {medication.dci}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isLowStock ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {stock.quantity} unités
                        </div>
                        <div className="text-sm text-gray-500">
                          Seuil: {stock.threshold}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {stock.expiryDate.toLocaleDateString('fr-FR')}
                        </div>
                        <div className={`text-sm ${isExpiringSoon ? 'text-red-500' : 'text-gray-500'}`}>
                          {isExpiringSoon ? 'Bientôt périmé' : 'Valide'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          €{parseFloat(medication.salePrice || '0').toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          PA: €{parseFloat(medication.purchasePrice || '0').toFixed(2)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={getStatusColor(stock.status, stock.quantity, stock.threshold)}
                          data-testid={`medication-status-${medication.id}`}
                        >
                          {getStatusLabel(stock.status, stock.quantity, stock.threshold)}
                        </Badge>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            data-testid={`button-dispense-${medication.id}`}
                            variant="ghost"
                            size="icon"
                            className="text-medical-primary hover:text-blue-700"
                            title="Délivrer médicament"
                          >
                            <HandHeart className="h-4 w-4" />
                          </Button>
                          <Button
                            data-testid={`button-edit-medication-${medication.id}`}
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600"
                            title="Modifier médicament"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            data-testid={`button-add-stock-${medication.id}`}
                            variant="ghost"
                            size="icon"
                            className="text-medical-success hover:text-green-700"
                            title="Ajouter stock"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
