import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Eye, Edit, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Invoice, Patient } from "@/types";

export default function BillingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  // Get patients for dropdown
  const { data: patients = [] } = useQuery({
    queryKey: ["/api/patients", { limit: 100 }],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest("POST", "/api/invoices", invoiceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsFormOpen(false);
      toast({
        title: "Succès",
        description: "Facture créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de la facture",
        variant: "destructive",
      });
    },
  });

  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const matchesSearch = !searchQuery || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'brouillon':
        return 'bg-gray-100 text-gray-800';
      case 'validee':
        return 'bg-blue-100 text-blue-800';
      case 'payee':
        return 'bg-green-100 text-green-800';
      case 'partiellement_payee':
        return 'bg-yellow-100 text-yellow-800';
      case 'annulee':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'brouillon':
        return 'Brouillon';
      case 'validee':
        return 'Validée';
      case 'payee':
        return 'Payée';
      case 'partiellement_payee':
        return 'Partiellement payée';
      case 'annulee':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (invoicesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Gestion des Factures</span>
            </CardTitle>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="button-new-invoice"
                  className="bg-medical-primary text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Facture
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Créer une Nouvelle Facture</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Fonctionnalité de création de facture en cours de développement.
                  </p>
                  <Button 
                    onClick={() => setIsFormOpen(false)}
                    variant="outline"
                  >
                    Fermer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Input
                data-testid="input-search-invoices"
                type="text"
                placeholder="Rechercher par numéro de facture, patient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter" className="w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="brouillon">Brouillon</SelectItem>
                <SelectItem value="validee">Validée</SelectItem>
                <SelectItem value="payee">Payée</SelectItem>
                <SelectItem value="partiellement_payee">Partiellement payée</SelectItem>
                <SelectItem value="annulee">Annulée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoice List */}
          <div className="space-y-4">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || statusFilter ? "Aucune facture trouvée avec ces critères" : "Aucune facture enregistrée"}
              </div>
            ) : (
              filteredInvoices.map((invoice: Invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-medical-secondary rounded-full flex items-center justify-center">
                      <FileText className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900" data-testid={`invoice-number-${invoice.id}`}>
                          {invoice.invoiceNumber}
                        </h3>
                        <Badge 
                          className={getStatusColor(invoice.status)}
                          data-testid={`invoice-status-${invoice.id}`}
                        >
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span>Patient ID: {invoice.patientId.slice(-8)}</span>
                        <span className="ml-4">
                          Date: {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                        </span>
                        {invoice.dueDate && (
                          <span className="ml-4">
                            Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">
                          Total: €{parseFloat(invoice.totalAmount).toFixed(2)}
                        </span>
                        {invoice.insuranceCoverage && parseFloat(invoice.insuranceCoverage) > 0 && (
                          <span className="ml-4 text-blue-600">
                            Assurance: €{parseFloat(invoice.insuranceCoverage).toFixed(2)}
                          </span>
                        )}
                        <span className="ml-4 text-green-600">
                          Patient: €{parseFloat(invoice.patientAmount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      data-testid={`button-view-invoice-${invoice.id}`}
                      variant="ghost"
                      size="icon"
                      className="text-medical-primary hover:text-blue-700"
                      title="Voir la facture"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {invoice.status === 'brouillon' && (
                      <Button
                        data-testid={`button-edit-invoice-${invoice.id}`}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-gray-600"
                        title="Modifier la facture"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {(invoice.status === 'validee' || invoice.status === 'partiellement_payee') && (
                      <Button
                        data-testid={`button-pay-invoice-${invoice.id}`}
                        variant="ghost"
                        size="icon"
                        className="text-medical-success hover:text-green-700"
                        title="Encaisser"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Cards */}
          {filteredInvoices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredInvoices.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Factures</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    €{filteredInvoices
                      .filter((inv: Invoice) => inv.status === 'payee')
                      .reduce((sum, inv: Invoice) => sum + parseFloat(inv.totalAmount), 0)
                      .toFixed(2)
                    }
                  </div>
                  <div className="text-sm text-gray-600">Factures Payées</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    €{filteredInvoices
                      .filter((inv: Invoice) => inv.status === 'validee' || inv.status === 'partiellement_payee')
                      .reduce((sum, inv: Invoice) => sum + parseFloat(inv.patientAmount), 0)
                      .toFixed(2)
                    }
                  </div>
                  <div className="text-sm text-gray-600">En Attente</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    €{filteredInvoices
                      .reduce((sum, inv: Invoice) => sum + parseFloat(inv.insuranceCoverage || '0'), 0)
                      .toFixed(2)
                    }
                  </div>
                  <div className="text-sm text-gray-600">Assurances</div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
