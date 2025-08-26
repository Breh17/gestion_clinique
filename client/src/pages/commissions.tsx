import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/ui/stats-card";
import { Percent, DollarSign, Clock, CheckCircle, User, Eye, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Commission, ExternalPractitioner } from "@/types";

export default function CommissionsPage() {
  const [periodFilter, setPeriodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [practitionerFilter, setPractitionerFilter] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get commissions
  const { data: commissions = [], isLoading: commissionsLoading } = useQuery({
    queryKey: ["/api/commissions", { period: periodFilter }],
  });

  // Mock data for practitioners - replace with real API
  const practitioners = [
    { id: "1", firstName: "Jean", lastName: "Externe", specialty: "Radiologue" },
    { id: "2", firstName: "Marie", lastName: "Expert", specialty: "Échographiste" },
  ];

  const payCommissionMutation = useMutation({
    mutationFn: async (commissionId: string) => {
      const response = await apiRequest("PUT", `/api/commissions/${commissionId}/pay`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commissions"] });
      toast({
        title: "Succès",
        description: "Commission payée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du paiement de la commission",
        variant: "destructive",
      });
    },
  });

  const filteredCommissions = commissions.filter((commission: Commission) => {
    const matchesPeriod = !periodFilter || commission.period === periodFilter;
    const matchesStatus = !statusFilter || commission.status === statusFilter;
    const matchesPractitioner = !practitionerFilter || commission.practitionerId === practitionerFilter;
    
    return matchesPeriod && matchesStatus && matchesPractitioner;
  });

  // Calculate statistics
  const totalPending = filteredCommissions
    .filter((c: Commission) => c.status === 'a_payer')
    .reduce((sum, c: Commission) => sum + parseFloat(c.commissionAmount), 0);

  const totalPaid = filteredCommissions
    .filter((c: Commission) => c.status === 'payee')
    .reduce((sum, c: Commission) => sum + parseFloat(c.commissionAmount), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'a_payer':
        return 'bg-yellow-100 text-yellow-800';
      case 'payee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'a_payer':
        return 'À payer';
      case 'payee':
        return 'Payée';
      default:
        return status;
    }
  };

  if (commissionsLoading) {
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Commissions"
          value={filteredCommissions.length}
          icon={Percent}
          iconColor="text-medical-primary"
        />
        
        <StatsCard
          title="À Payer"
          value={`€${totalPending.toFixed(2)}`}
          icon={Clock}
          iconColor="text-medical-warning"
        />
        
        <StatsCard
          title="Payées"
          value={`€${totalPaid.toFixed(2)}`}
          icon={CheckCircle}
          iconColor="text-medical-success"
        />
        
        <StatsCard
          title="Intervenants"
          value={practitioners.length}
          icon={User}
          iconColor="text-medical-secondary"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Percent className="h-5 w-5" />
              <span>Gestion des Commissions</span>
            </CardTitle>
            <Button 
              data-testid="button-calculate-commissions"
              className="bg-medical-primary text-white hover:bg-blue-700"
            >
              Calculer Commissions
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger data-testid="select-period-filter" className="w-48">
                <SelectValue placeholder="Toutes les périodes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les périodes</SelectItem>
                <SelectItem value="2024-01">Janvier 2024</SelectItem>
                <SelectItem value="2024-02">Février 2024</SelectItem>
                <SelectItem value="2024-03">Mars 2024</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter" className="w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="a_payer">À payer</SelectItem>
                <SelectItem value="payee">Payée</SelectItem>
              </SelectContent>
            </Select>

            <Select value={practitionerFilter} onValueChange={setPractitionerFilter}>
              <SelectTrigger data-testid="select-practitioner-filter" className="w-64">
                <SelectValue placeholder="Tous les intervenants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les intervenants</SelectItem>
                {practitioners.map((practitioner) => (
                  <SelectItem key={practitioner.id} value={practitioner.id}>
                    Dr. {practitioner.firstName} {practitioner.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Commission List */}
          <div className="space-y-4">
            {filteredCommissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Aucune commission trouvée avec ces critères
              </div>
            ) : (
              filteredCommissions.map((commission: Commission) => {
                const practitioner = practitioners.find(p => p.id === commission.practitionerId);
                
                return (
                  <div 
                    key={commission.id} 
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-medical-secondary rounded-full flex items-center justify-center">
                        <User className="text-white h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-medium text-gray-900" data-testid={`commission-practitioner-${commission.id}`}>
                            Dr. {practitioner?.firstName} {practitioner?.lastName}
                          </h3>
                          <Badge 
                            className={getStatusColor(commission.status)}
                            data-testid={`commission-status-${commission.id}`}
                          >
                            {getStatusLabel(commission.status)}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          <span>Période: {commission.period}</span>
                          <span className="ml-4">
                            Base: €{parseFloat(commission.baseAmount).toFixed(2)}
                          </span>
                          {commission.commissionRate && (
                            <span className="ml-4">
                              Taux: {parseFloat(commission.commissionRate).toFixed(1)}%
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Calculée le {new Date(commission.calculatedAt).toLocaleDateString('fr-FR')}
                          {commission.paidAt && (
                            <span className="ml-4 text-green-600">
                              Payée le {new Date(commission.paidAt).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-medical-primary">
                          €{parseFloat(commission.commissionAmount).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Commission
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          data-testid={`button-view-commission-${commission.id}`}
                          variant="ghost"
                          size="icon"
                          className="text-medical-primary hover:text-blue-700"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {commission.status === 'a_payer' && (
                          <Button
                            data-testid={`button-pay-commission-${commission.id}`}
                            onClick={() => payCommissionMutation.mutate(commission.id)}
                            disabled={payCommissionMutation.isPending}
                            className="bg-medical-success hover:bg-green-700 text-white"
                            size="sm"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Payer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Summary */}
          {filteredCommissions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredCommissions.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Commissions</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    €{totalPending.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">À Payer</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    €{totalPaid.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Payées</div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
