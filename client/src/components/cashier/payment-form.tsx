import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import type { Invoice } from "@/types";

const paymentSchema = z.object({
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  method: z.enum(["especes", "carte", "cheque", "virement", "mobile_money"], {
    required_error: "Le mode de paiement est requis",
  }),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

interface PaymentFormProps {
  invoice: Invoice;
  onSubmit: (data: z.infer<typeof paymentSchema>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function PaymentForm({ invoice, onSubmit, onCancel, isLoading }: PaymentFormProps) {
  const remainingAmount = parseFloat(invoice.patientAmount);
  
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      method: "especes",
      reference: "",
      notes: "",
    },
  });

  const watchedMethod = form.watch("method");

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

  const getReferenceLabel = (method: string) => {
    switch (method) {
      case 'carte': return 'Numéro de transaction';
      case 'cheque': return 'Numéro de chèque';
      case 'virement': return 'Référence de virement';
      case 'mobile_money': return 'ID de transaction';
      default: return 'Référence';
    }
  };

  return (
    <div className="space-y-6">
      {/* Invoice Summary */}
      <Card className="bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Facture {invoice.invoiceNumber}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Montant total</p>
              <p className="text-lg font-bold text-gray-900">€{parseFloat(invoice.totalAmount).toFixed(2)}</p>
            </div>
            {invoice.insuranceCoverage && parseFloat(invoice.insuranceCoverage) > 0 && (
              <div>
                <p className="text-sm text-gray-600">Prise en charge assurance</p>
                <p className="text-lg font-medium text-blue-600">€{parseFloat(invoice.insuranceCoverage).toFixed(2)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Reste à payer</p>
              <p className="text-xl font-bold text-medical-primary">€{remainingAmount.toFixed(2)}</p>
            </div>
            <div className="flex items-center">
              <Badge 
                className={
                  invoice.status === 'validee' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'partiellement_payee' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }
              >
                {invoice.status === 'validee' ? 'À payer' :
                 invoice.status === 'partiellement_payee' ? 'Partiellement payée' :
                 invoice.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant à encaisser (€) *</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-payment-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      max={remainingAmount}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mode de paiement *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-payment-method">
                        <SelectValue placeholder="Sélectionner le mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="especes">
                        <div className="flex items-center space-x-2">
                          <span>💵</span>
                          <span>Espèces</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="carte">
                        <div className="flex items-center space-x-2">
                          <span>💳</span>
                          <span>Carte bancaire</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cheque">
                        <div className="flex items-center space-x-2">
                          <span>📝</span>
                          <span>Chèque</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="virement">
                        <div className="flex items-center space-x-2">
                          <span>🏦</span>
                          <span>Virement</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mobile_money">
                        <div className="flex items-center space-x-2">
                          <span>📱</span>
                          <span>Mobile Money</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {watchedMethod && watchedMethod !== 'especes' && (
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{getReferenceLabel(watchedMethod)}</FormLabel>
                  <FormControl>
                    <Input
                      data-testid="input-payment-reference"
                      placeholder={`Saisir la ${getReferenceLabel(watchedMethod).toLowerCase()}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optionnel)</FormLabel>
                <FormControl>
                  <Textarea 
                    data-testid="textarea-payment-notes"
                    placeholder="Notes sur le paiement..."
                    rows={3}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Payment Summary */}
          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getMethodIcon(watchedMethod)}</span>
                  <div>
                    <p className="font-medium text-gray-900">Paiement par {watchedMethod}</p>
                    <p className="text-sm text-gray-600">
                      Montant: €{form.watch("amount")?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
                {form.watch("amount") === remainingAmount && (
                  <Badge className="bg-green-100 text-green-800">
                    Paiement complet
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              data-testid="button-cancel-payment"
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              data-testid="button-process-payment"
              type="submit"
              disabled={isLoading}
              className="bg-medical-primary hover:bg-blue-700"
            >
              {isLoading ? "Traitement..." : "Enregistrer Paiement"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
