import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InsuranceCompany } from "@/types";

const insuranceSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  type: z.enum(["principale", "complementaire"], {
    required_error: "Le type est requis",
  }),
  consultationRate: z.number().min(0).max(100).optional(),
  medicationRate: z.number().min(0).max(100).optional(),
  examinationRate: z.number().min(0).max(100).optional(),
  consultationCeiling: z.number().min(0).optional(),
  medicationCeiling: z.number().min(0).optional(),
  annualCeiling: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

interface InsuranceFormProps {
  insurance?: InsuranceCompany | null;
  onSubmit: (data: z.infer<typeof insuranceSchema>) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function InsuranceForm({ insurance, onSubmit, onCancel, isLoading }: InsuranceFormProps) {
  const form = useForm<z.infer<typeof insuranceSchema>>({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      name: insurance?.name || "",
      type: insurance?.type as "principale" | "complementaire" || "principale",
      consultationRate: insurance?.coverageRates?.consultation || 70,
      medicationRate: insurance?.coverageRates?.medication || 80,
      examinationRate: insurance?.coverageRates?.examination || 60,
      consultationCeiling: insurance?.ceilings?.consultation || 0,
      medicationCeiling: insurance?.ceilings?.medication || 0,
      annualCeiling: insurance?.ceilings?.annual || 0,
      isActive: insurance?.isActive ?? true,
    },
  });

  const handleSubmit = (data: z.infer<typeof insuranceSchema>) => {
    const formattedData = {
      name: data.name,
      type: data.type,
      coverageRates: {
        consultation: data.consultationRate,
        medication: data.medicationRate,
        examination: data.examinationRate,
      },
      ceilings: {
        consultation: data.consultationCeiling,
        medication: data.medicationCeiling,
        annual: data.annualCeiling,
      },
      isActive: data.isActive,
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations Générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'assurance *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-insurance-name" placeholder="Ex: CNSS, CIMR..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d'assurance *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-insurance-type">
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="principale">Principale</SelectItem>
                        <SelectItem value="complementaire">Complémentaire</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Coverage Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Taux de Prise en Charge (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="consultationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultations</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-consultation-rate"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="70"
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
                name="medicationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Médicaments</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-medication-rate"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="80"
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
                name="examinationRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Examens</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-examination-rate"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="60"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Ceilings */}
        <Card>
          <CardHeader>
            <CardTitle>Plafonds de Remboursement (€)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="consultationCeiling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plafond Consultations</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-consultation-ceiling"
                        type="number"
                        min="0"
                        placeholder="0 = illimité"
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
                name="medicationCeiling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plafond Médicaments</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-medication-ceiling"
                        type="number"
                        min="0"
                        placeholder="0 = illimité"
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
                name="annualCeiling"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plafond Annuel</FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-annual-ceiling"
                        type="number"
                        min="0"
                        placeholder="0 = illimité"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            data-testid="button-cancel-insurance"
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            data-testid="button-save-insurance"
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
