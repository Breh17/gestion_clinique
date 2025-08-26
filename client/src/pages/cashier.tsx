import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentForm } from "@/components/cashier/payment-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard, DollarSign, Clock, CheckCircle, TrendingUp, Calculator, Lock, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Payment, Invoice } from "@/types";

export default function CashierPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current cash register
  const { data: cashRegister } = useQuery({
    queryKey: ["/api/cash-register/current"],
  });

  // Get today's payments
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
  });

  // Get unpaid invoices
  const { data: unpaidInvoices = [] } = useQuery({
    queryKey: ["/api/invoices", { status: "validee,partiellement_payee" }],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/payments", paymentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cash-register/current"] });
      setIsPaymentFormOpen(false);
      setSelectedInvoice(null);
      toast({
        title: "Succès",
        description: "Paiement enregistré avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'enregistrement du paiement",
        variant: "destructive",
      });
    },
  });

  const openCashRegisterMutation = useMutation({
    mutationFn: async (openingBalance: number) => {
      const response = await apiRequest("POST", "/api/cash-register/open", { openingBalance });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-register/current"] });
      toast({
        title: "Succès",
        description: "Caisse ouverte avec succès",
      });
    },
  });

  const closeCashRegisterMutation = useMutation({
    mutationFn: async ({ id, closingBalance }: { id: string; closingBalance: number }) => {
      const response = await apiRequest("POST", `/api/cash-register/${id}/close`, { closingBalance });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cash-register/current"] });
      toast({
        title: "Succès",
        description: "Caisse fermée avec succès",
      });
    },
  });

  const handleProcessPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentFormOpen(true);
  };

  const handleSubmitPayment = (data: any) => {
    if (selectedInvoice) {
      createPaymentMutation.mutate({
        ...data,
        invoiceId: selectedInvoice.id,
      });
    }
  };

  const handleOpenCashRegister = () => {
    const openingBalance = parseFloat(prompt("Solde d'ouverture (€):") || "0");
    if (openingBalance >= 0) {
      openCashRegisterMutation.mutate(openingBalance);
    }
  };

  const handleCloseCashRegister = () => {
    if (!cashRegister) return;
    
    const closingBalance = parseFloat(prompt("Solde de fermeture (€):") || "0");
    if (closingBalance >= 0) {
      closeCashRegisterMutation.mutate({
        id: cashRegister.id,
        closingBalance,
      });
    }
  };

  // Calculate statistics
  const todayRevenue = payments.reduce((sum, payment: Payment) => sum + parseFloat(payment.amount), 0);
  
  const paymentsByMethod = payments.reduce((acc: any, payment: Payment) => {
    acc[payment.method] = (acc[payment.method] || 0) + parseFloat(payment.amount);
    return acc;
  }, {});

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'especes': return '💵';
      case 'carte': return '💳';
      case 'cheque': return '📝';
      case 'virement': return '🏦';
      case 'mobile_money': return '📱';
      default: return '💰';
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'especes': return 'Espèces';
      case 'carte': return 'Carte bancaire';
      case 'cheque': return 'Chèque';
      case 'virement': return 'Virement';
      case 'mobile_money': return 'Mobile Money';
      default: return method;
    }
  };

  if (paymentsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Register Operations */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Caisse Principale</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={cashRegister?.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {cashRegister?.isOpen ? 'Ouverte' : 'Fermée'}
                  </Badge>
                  {cashRegister?.isOpen && (
                    <span className="text-sm text-gray-500">
                      Ouverte: {new Date(cashRegister.openingDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {cashRegister?.isOpen ? (
                <div className="space-y-6">
                  {/* Cash Register Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Solde d'ouverture</p>
                      <p className="text-2xl font-bold text-medical-primary" data-testid="opening-balance">
                        €{parseFloat(cashRegister.openingBalance).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">Recettes du jour</p>
                      <p className="text-2xl font-bold text-medical-success" data-testid="daily-revenue">
                        €{todayRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Solde actuel</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="current-balance">
                        €{(parseFloat(cashRegister.openingBalance) + todayRevenue).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Today's Transactions */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Transactions du Jour</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heure</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facture</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payments.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                Aucune transaction aujourd'hui
                              </td>
                            </tr>
                          ) : (
                            payments.slice(0, 10).map((payment: Payment) => (
                              <tr key={payment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(payment.paymentDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  #{payment.invoiceId.slice(-8)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <span>{getMethodIcon(payment.method)}</span>
                                    <span className="text-sm text-gray-600">{getMethodLabel(payment.method)}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-medical-success">
                                  €{parseFloat(payment.amount).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <Button
                                    data-testid={`button-print-receipt-${payment.id}`}
                                    variant="ghost"
                                    size="icon"
                                    className="text-medical-primary hover:text-blue-700"
                                    title="Imprimer reçu"
                                  >
                                    <Printer className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">La caisse est fermée</p>
                  <Button
                    data-testid="button-open-cash-register"
                    onClick={handleOpenCashRegister}
                    disabled={openCashRegisterMutation.isPending}
                    className="bg-medical-primary hover:bg-blue-700"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Ouvrir la Caisse
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Payment Methods Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition Paiements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(paymentsByMethod).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucun paiement aujourd'hui</p>
                ) : (
                  Object.entries(paymentsByMethod).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span>{getMethodIcon(method)}</span>
                        <span className="text-sm text-gray-600">{getMethodLabel(method)}</span>
                      </div>
                      <span className="font-medium text-gray-900">€{(amount as number).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Factures Impayées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unpaidInvoices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune facture impayée</p>
                ) : (
                  unpaidInvoices.slice(0, 5).map((invoice: Invoice) => (
                    <div
                      key={invoice.id}
                      className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </span>
                        <span className="text-sm font-bold text-medical-warning">
                          €{parseFloat(invoice.patientAmount).toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">
                        Date: {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
                      </p>
                      <Button
                        data-testid={`button-process-payment-${invoice.id}`}
                        onClick={() => handleProcessPayment(invoice)}
                        size="sm"
                        className="w-full bg-medical-primary hover:bg-blue-700 text-xs"
                      >
                        Encaisser
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cash Register Actions */}
          {cashRegister?.isOpen && (
            <Card>
              <CardHeader>
                <CardTitle>Actions Caisse</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  data-testid="button-cash-report"
                  className="w-full bg-medical-primary hover:bg-blue-700"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Journal de Caisse
                </Button>
                <Button
                  data-testid="button-cash-count"
                  variant="outline"
                  className="w-full"
                >
                  <Calculator className="mr-2 h-4 w-4" />
                  Comptage Caisse
                </Button>
                <Button
                  data-testid="button-close-cash-register"
                  onClick={handleCloseCashRegister}
                  disabled={closeCashRegisterMutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Fermer Caisse
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Payment Form Dialog */}
      <Dialog open={isPaymentFormOpen} onOpenChange={setIsPaymentFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enregistrer un Paiement</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <PaymentForm
              invoice={selectedInvoice}
              onSubmit={handleSubmitPayment}
              onCancel={() => setIsPaymentFormOpen(false)}
              isLoading={createPaymentMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
