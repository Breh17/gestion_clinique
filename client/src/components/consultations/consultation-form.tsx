import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Patient } from "@/types";

const consultationSchema = z.object({
  reason: z.string().min(1, "Le motif de consultation est requis"),
  anamnesis: z.string().optional(),
  clinicalExam: z.string().optional(),
  bloodPressure: z.string().optional(),
  heartRate: z.string().optional(),
  temperature: z.string().optional(),
  weight: z.string().optional(),
  diagnosis: z.string().optional(),
  diagnosisCode: z.string().optional(),
  recommendations: z.string().optional(),
  followUpDate: z.string().optional(),
});

interface ConsultationFormProps {
  patient: Patient;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ConsultationForm({ patient, onSubmit, onCancel, isLoading }: ConsultationFormProps) {
  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      reason: "",
      anamnesis: "",
      clinicalExam: "",
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      weight: "",
      diagnosis: "",
      diagnosisCode: "",
      recommendations: "",
      followUpDate: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof consultationSchema>) => {
    // Combine vitals into a single object
    const vitals = {
      bloodPressure: data.bloodPressure,
      heartRate: data.heartRate,
      temperature: data.temperature,
      weight: data.weight,
    };

    const consultationData = {
      reason: data.reason,
      anamnesis: data.anamnesis,
      clinicalExam: data.clinicalExam,
      vitals,
      diagnosis: data.diagnosis,
      diagnosisCode: data.diagnosisCode,
      recommendations: data.recommendations,
      followUpDate: data.followUpDate || null,
    };

    onSubmit(consultationData);
  };

  const saveDraft = () => {
    const data = form.getValues();
    console.log("Saving draft:", data);
    // TODO: Implement draft saving functionality
  };

  return (
    <div className="space-y-6">
      {/* Patient Summary */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-medical-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {patient.firstName[0]}{patient.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                Dossier: {patient.fileNumber} • {patient.phone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Motif de consultation */}
          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motif de consultation *</FormLabel>
                <FormControl>
                  <Input 
                    data-testid="input-consultation-reason"
                    placeholder="Ex: Douleurs abdominales, fièvre..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Anamnèse */}
          <FormField
            control={form.control}
            name="anamnesis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anamnèse</FormLabel>
                <FormControl>
                  <Textarea 
                    data-testid="textarea-anamnesis"
                    rows={4}
                    placeholder="Histoire de la maladie actuelle, antécédents pertinents..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Signes vitaux */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Signes vitaux</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="bloodPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tension artérielle</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-blood-pressure"
                          placeholder="120/80 mmHg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="heartRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fréquence cardiaque</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-heart-rate"
                          placeholder="72 bpm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="temperature"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Température</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-temperature"
                          placeholder="37.0°C" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poids</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-weight"
                          placeholder="70 kg" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Examen clinique */}
          <FormField
            control={form.control}
            name="clinicalExam"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Examen clinique</FormLabel>
                <FormControl>
                  <Textarea 
                    data-testid="textarea-clinical-exam"
                    rows={4}
                    placeholder="Observations cliniques détaillées..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Diagnostic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Diagnostic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="diagnosisCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Code CIM-10 (optionnel)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-diagnosis-code">
                            <SelectValue placeholder="Sélectionner un code CIM-10" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="K59.1">K59.1 - Diarrhée fonctionnelle</SelectItem>
                          <SelectItem value="R50.9">R50.9 - Fièvre non spécifiée</SelectItem>
                          <SelectItem value="Z00.0">Z00.0 - Examen médical général</SelectItem>
                          <SelectItem value="M25.50">M25.50 - Douleur articulaire</SelectItem>
                          <SelectItem value="R06.00">R06.00 - Dyspnée</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  data-testid="button-search-diagnosis"
                  type="button" 
                  variant="outline" 
                  className="mt-8"
                >
                  🔍
                </Button>
              </div>
              
              <FormField
                control={form.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description du diagnostic</FormLabel>
                    <FormControl>
                      <Textarea 
                        data-testid="textarea-diagnosis"
                        rows={3}
                        placeholder="Description détaillée du diagnostic..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Recommandations */}
          <FormField
            control={form.control}
            name="recommendations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommandations</FormLabel>
                <FormControl>
                  <Textarea 
                    data-testid="textarea-recommendations"
                    rows={3}
                    placeholder="Conseils, repos, régime alimentaire..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Suivi */}
          <FormField
            control={form.control}
            name="followUpDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date de suivi (optionnel)</FormLabel>
                <FormControl>
                  <Input 
                    data-testid="input-follow-up-date"
                    type="date" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button
              data-testid="button-save-draft"
              type="button"
              variant="outline"
              onClick={saveDraft}
              disabled={isLoading}
            >
              Sauvegarder Brouillon
            </Button>
            <Button
              data-testid="button-cancel-consultation"
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              data-testid="button-finish-consultation"
              type="submit"
              disabled={isLoading}
              className="bg-medical-primary hover:bg-blue-700"
            >
              {isLoading ? "Enregistrement..." : "Terminer Consultation"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
