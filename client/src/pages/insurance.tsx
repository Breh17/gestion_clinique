import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { InsuranceForm } from "@/components/insurance/insurance-form";
import { Shield, Plus, Eye, Edit, FileText, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { InsuranceCompany } from "@/types";

export default function InsurancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedInsurance, setSelectedInsurance] = useState<InsuranceCompany | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get insurance companies
  const { data: insuranceCompanies = [], isLoading } = useQuery({
    queryKey: ["/api/insurance-companies"],
  });

  const createInsuranceMutation = useMutation({
    mutationFn: async (insuranceData: any) => {
      const response = await apiRequest("POST", "/api/insurance-companies", insuranceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insurance-companies"] });
      setIsFormOpen(false);
      toast({
        title: "Succès",
        description: "Compagnie d'assurance créée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création de la compagnie d'assurance",
        variant: "destructive",
      });
    },
  });

  const handleCreateInsurance = () => {
    setSelectedInsurance(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditInsurance = (insurance: InsuranceCompany) => {
    setSelectedInsurance(insurance);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (isEditMode && selectedInsurance) {
      // Update mutation would go here
      console.log("Update insurance:", data);
    } else {
      createInsuranceMutation.mutate(data);
    }
  };

  const filteredInsurances = insuranceCompanies.filter((insurance: InsuranceCompany) => {
    const matchesSearch = !searchQuery || 
      insurance.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !typeFilter || insurance.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
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
              <Shield className="h-5 w-5" />
              <span>Gestion des Assurances</span>
            </CardTitle>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="button-new-insurance"
                  onClick={handleCreateInsurance}
                  className="bg-medical-primary text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Assurance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Modifier Assurance" : "Nouvelle Assurance"}
                  </DialogTitle>
                </DialogHeader>
                <InsuranceForm
                  insurance={selectedInsurance}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsFormOpen(false)}
                  isLoading={createInsuranceMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1 relative">
              <Input
                data-testid="input-search-insurance"
                type="text"
                placeholder="Rechercher par nom d'assurance..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="select-type-filter" className="w-48">
                <SelectValue placeholder="Tous les types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les types</SelectItem>
                <SelectItem value="principale">Principale</SelectItem>
                <SelectItem value="complementaire">Complémentaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Insurance List */}
          <div className="space-y-4">
            {filteredInsurances.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || typeFilter ? "Aucune assurance trouvée avec ces critères" : "Aucune compagnie d'assurance enregistrée"}
              </div>
            ) : (
              filteredInsurances.map((insurance: InsuranceCompany) => (
                <div 
                  key={insurance.id} 
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-medical-secondary rounded-full flex items-center justify-center">
                      <Shield className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900" data-testid={`insurance-name-${insurance.id}`}>
                          {insurance.name}
                        </h3>
                        <Badge 
                          className={insurance.type === 'principale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}
                          data-testid={`insurance-type-${insurance.id}`}
                        >
                          {insurance.type}
                        </Badge>
                        <Badge 
                          className={insurance.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        >
                          {insurance.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span>Créée le {new Date(insurance.createdAt).toLocaleDateString('fr-FR')}</span>
                        {insurance.coverageRates && (
                          <span className="ml-4">
                            Taux de couverture configurés
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      data-testid={`button-view-insurance-${insurance.id}`}
                      variant="ghost"
                      size="icon"
                      className="text-medical-primary hover:text-blue-700"
                      title="Voir les détails"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid={`button-edit-insurance-${insurance.id}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditInsurance(insurance)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid={`button-reimbursement-${insurance.id}`}
                      variant="ghost"
                      size="icon"
                      className="text-medical-success hover:text-green-700"
                      title="Dossier de remboursement"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Statistics */}
          {filteredInsurances.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredInsurances.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Assurances</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredInsurances.filter((ins: InsuranceCompany) => ins.type === 'principale').length}
                  </div>
                  <div className="text-sm text-gray-600">Assurances Principales</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredInsurances.filter((ins: InsuranceCompany) => ins.type === 'complementaire').length}
                  </div>
                  <div className="text-sm text-gray-600">Complémentaires</div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
