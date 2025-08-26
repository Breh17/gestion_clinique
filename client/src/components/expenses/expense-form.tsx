import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Expense } from "@/types";

const expenseSchema = z.object({
  category: z.string().min(1, "La catégorie est requise"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  supplier: z.string().optional(),
  paymentMethod: z.enum(["especes", "carte", "cheque", "virement", "mobile_money"]).optional(),
  receiptNumber: z.string().optional(),
  expenseDate: z.string().min(1, "La date est requise"),
});

interface ExpenseFormProps {
  expense?: Expense | null;
  onSubmit: (data: z.infer<typeof expenseSchema>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ExpenseForm({ expense, onSubmit, onCancel, isLoading }: ExpenseFormProps) {
  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: expense?.category || "",
      description: expense?.description || "",
      amount: expense ? parseFloat(expense.amount) : 0,
      supplier: expense?.supplier || "",
      paymentMethod: expense?.paymentMethod as any || undefined,
      receiptNumber: expense?.receiptNumber || "",
      expenseDate: expense?.expenseDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    },
  });

  const categories = [
    "Fournitures médicales",
    "Équipement",
    "Loyer",
    "Électricité",
    "Eau",
    "Téléphone/Internet",
    "Maintenance",
    "Formation",
    "Transport",
    "Marketing",
    "Assurances",
    "Taxes",
    "Autres",
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-expense-category">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant (€) *</FormLabel>
                <FormControl>
                  <Input
                    data-testid="input-expense-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  data-testid="textarea-expense-description"
                  placeholder="Description détaillée de la dépense..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fournisseur</FormLabel>
                <FormControl>
                  <Input 
                    data-testid="input-expense-supplier"
                    placeholder="Nom du fournisseur" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="receiptNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de reçu</FormLabel>
                <FormControl>
                  <Input 
                    data-testid="input-receipt-number"
                    placeholder="Numéro du reçu/facture" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mode de paiement</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-payment-method">
                      <SelectValue placeholder="Sélectionner le mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="especes">Espèces</SelectItem>
                    <SelectItem value="carte">Carte bancaire</SelectItem>
                    <SelectItem value="cheque">Chèque</SelectItem>
                    <SelectItem value="virement">Virement</SelectItem>
                    <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="expenseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de la dépense *</FormLabel>
                <FormControl>
                  <Input 
                    data-testid="input-expense-date"
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            data-testid="button-cancel-expense"
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            data-testid="button-save-expense"
            type="submit"
            disabled={isLoading}
            className="bg-medical-primary hover:bg-blue-700"
          >
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
