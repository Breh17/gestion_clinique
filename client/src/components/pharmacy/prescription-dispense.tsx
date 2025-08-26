import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, User, FileText } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const dispenseSchema = z.object({
  quantity: z.number().min(1, "La quantité doit être supérieure à 0"),
  lotNumber: z.string().min(1, "Le numéro de lot est requis"),
  unitPrice: z.number().min(0, "Le prix unitaire doit être positif"),
  notes: z.string().optional(),
});

interface PrescriptionDispenseProps {
  isOpen: boolean;
  onClose: () => void;
  prescription?: any;
  onDispense: (data: any) => void;
  isLoading?: boolean;
}

export function PrescriptionDispense({ 
  isOpen, 
  onClose, 
  prescription, 
  onDispense,
  isLoading = false 
}: PrescriptionDispenseProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const form = useForm<z.infer<typeof dispenseSchema>>({
    resolver: zodResolver(dispenseSchema),
    defaultValues: {
      quantity: 1,
      lotNumber: "",
      unitPrice: 0,
      notes: "",
    },
  });

  if (!prescription) {
    return null;
  }

  const handleDispense = (data: z.infer<typeof dispenseSchema>) => {
    onDispense({
      prescriptionId: prescription.id,
      items: selectedItems.map(itemId => ({
        itemId,
        ...data,
      })),
    });
  };

  // Mock prescription items - replace with real data
  const prescriptionItems = [
    {
      id: "1",
      medicationName: "Paracétamol 500mg",
      prescribedQuantity: 20,
      dosage: "1 comprimé 3 fois par jour",
      duration: "7 jours",
    },
    {
      id: "2", 
      medicationName: "Ibuprofène 400mg",
      prescribedQuantity: 12,
      dosage: "1 comprimé matin et soir",
      duration: "6 jours",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Délivrance d'Ordonnance</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informations Patient</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-medical-secondary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {prescription.patient?.firstName?.[0]}{prescription.patient?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {prescription.patient?.firstName} {prescription.patient?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Dossier: {prescription.patient?.fileNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    Prescripteur: Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prescription Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Médicaments Prescrits</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prescriptionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      selectedItems.includes(item.id)
                        ? 'border-medical-primary bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedItems([...selectedItems, item.id]);
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item.id));
                            }
                          }}
                          className="h-4 w-4 text-medical-primary rounded focus:ring-medical-primary"
                        />
                        <div>
                          <h4 className="font-medium text-gray-900" data-testid={`medication-${item.id}`}>
                            {item.medicationName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantité prescrite: {item.prescribedQuantity}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.dosage} - {item.duration}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Disponible
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dispensing Form */}
          {selectedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Informations de Délivrance</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleDispense)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantité délivrée</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-dispense-quantity"
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lotNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Numéro de lot</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-lot-number"
                                placeholder="LOT2024001"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unitPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix unitaire (€)</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-unit-price"
                                type="number"
                                step="0.01"
                                min="0"
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
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (optionnel)</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-dispense-notes"
                              placeholder="Notes sur la délivrance..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Warnings */}
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <AlertTriangle className="text-yellow-500 mr-2 h-4 w-4" />
                        <span className="text-sm font-medium text-yellow-700">Vérifications:</span>
                      </div>
                      <ul className="text-sm text-yellow-600 mt-1 ml-6 list-disc">
                        <li>Vérifier l'identité du patient</li>
                        <li>Contrôler les dates de péremption</li>
                        <li>Vérifier les interactions médicamenteuses</li>
                        <li>Expliquer la posologie au patient</li>
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4 pt-4">
                      <Button
                        data-testid="button-cancel-dispense"
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Annuler
                      </Button>
                      <Button
                        data-testid="button-confirm-dispense"
                        type="submit"
                        disabled={isLoading}
                        className="bg-medical-primary hover:bg-blue-700"
                      >
                        {isLoading ? "Délivrance..." : "Délivrer"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
