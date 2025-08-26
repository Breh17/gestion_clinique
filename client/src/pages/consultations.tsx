import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConsultationForm } from "@/components/consultations/consultation-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Stethoscope, User, Calendar, AlertTriangle, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, Consultation, Appointment } from "@/types";

export default function ConsultationsPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationId, setConsultationId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get today's appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments", new Date().toISOString().split('T')[0]],
  });

  // Get all consultations for history
  const { data: consultations = [], isLoading: consultationsLoading } = useQuery({
    queryKey: ["/api/consultations"],
  });

  // Don't fetch patient details separately since we already have them from selectedPatient

  const createConsultationMutation = useMutation({
    mutationFn: async (consultationData: any) => {
      const response = await apiRequest("POST", "/api/consultations", consultationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consultations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsConsultationOpen(false);
      toast({
        title: "Succès",
        description: "Consultation enregistrée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'enregistrement de la consultation",
        variant: "destructive",
      });
    },
  });

  const startConsultation = async (appointment: Appointment) => {
    try {
      // Update appointment status to "en_consultation"
      await apiRequest("PUT", `/api/appointments/${appointment.id}`, {
        status: "en_consultation"
      });

      // Get patient details - ensure patientId is a string
      const patientId = typeof appointment.patientId === 'string' ? appointment.patientId : appointment.patientId?.id || appointment.patientId;
      if (typeof patientId !== 'string') {
        throw new Error("Invalid patient ID in appointment");
      }
      const patientResponse = await apiRequest("GET", `/api/patients/${patientId}`);
      const patientData = await patientResponse.json();
      
      // Ensure we have a valid patient object with string ID
      if (patientData && typeof patientData.id === 'string') {
        setSelectedPatient(patientData);
      } else {
        throw new Error("Invalid patient data received");
      }
      setIsConsultationOpen(true);
      
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du démarrage de la consultation",
        variant: "destructive",
      });
    }
  };

  const handleSubmitConsultation = (data: any) => {
    if (selectedPatient) {
      createConsultationMutation.mutate({
        ...data,
        patientId: selectedPatient.id,
      });
    }
  };

  if (appointmentsLoading || consultationsLoading) {
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
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Rendez-vous du jour</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    Aucun rendez-vous programmé aujourd'hui
                  </div>
                ) : (
                  appointments.map((appointment: Appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        appointment.status === 'en_consultation' 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      data-testid={`appointment-card-${appointment.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-medical-secondary rounded-full flex items-center justify-center">
                            <User className="text-white h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900" data-testid={`appointment-patient-${appointment.id}`}>
                                Patient #{appointment.id.slice(-6)}
                              </h3>
                              <Badge
                                className={
                                  appointment.status === 'programme' ? 'bg-gray-100 text-gray-800' :
                                  appointment.status === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                                  appointment.status === 'en_consultation' ? 'bg-blue-100 text-blue-800' :
                                  appointment.status === 'termine' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }
                                data-testid={`appointment-status-${appointment.id}`}
                              >
                                {appointment.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              <span>
                                {new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {appointment.reason && (
                                <span className="ml-2">• {appointment.reason}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {appointment.status === 'en_attente' && (
                            <Button
                              data-testid={`button-start-consultation-${appointment.id}`}
                              onClick={() => startConsultation(appointment)}
                              className="bg-medical-primary hover:bg-blue-700"
                            >
                              <Stethoscope className="mr-2 h-4 w-4" />
                              Commencer
                            </Button>
                          )}
                          {appointment.status === 'en_consultation' && (
                            <Button
                              data-testid={`button-continue-consultation-${appointment.id}`}
                              onClick={() => startConsultation(appointment)}
                              variant="outline"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            >
                              Continuer
                            </Button>
                          )}
                          {appointment.status === 'termine' && (
                            <Badge className="bg-green-100 text-green-800">
                              Terminé
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Consultations */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Consultations récentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {consultations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucune consultation récente
                  </div>
                ) : (
                  consultations.slice(0, 10).map((consultation: Consultation) => (
                    <div key={consultation.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition duration-150">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-gray-500 w-20">
                          {new Date(consultation.consultationDate).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900" data-testid={`consultation-patient-${consultation.id}`}>
                            Patient #{consultation.patientId.slice(-6)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {consultation.reason || 'Consultation générale'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {consultation.diagnosis && (
                          <div className="text-sm text-gray-600">
                            {consultation.diagnosis.substring(0, 30)}...
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patient Info Sidebar */}
        <div className="lg:col-span-1">
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Patient Sélectionné</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="h-20 w-20 bg-medical-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">
                      {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900" data-testid="selected-patient-name">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h4>
                  <p className="text-gray-500">
                    {selectedPatient.birthDate ? 
                      new Date().getFullYear() - new Date(selectedPatient.birthDate).getFullYear() : '?'} ans 
                    • {selectedPatient.gender || 'Non spécifié'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Dossier: {selectedPatient.fileNumber}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Groupe sanguin:</span>
                    <span className="font-medium">{selectedPatient.bloodType || 'Non défini'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="font-medium">{selectedPatient.phone || 'Non défini'}</span>
                  </div>
                </div>

                {selectedPatient.allergies && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="text-red-500 mr-2 h-4 w-4" />
                      <span className="text-sm font-medium text-red-700">Allergies:</span>
                    </div>
                    <p className="text-sm text-red-600 mt-1">{selectedPatient.allergies}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Sélectionnez un patient pour commencer une consultation
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistiques du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Consultations</span>
                  <span className="font-semibold text-medical-primary" data-testid="daily-consultations">
                    {consultations.filter((c: Consultation) => 
                      new Date(c.consultationDate).toDateString() === new Date().toDateString()
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">En attente</span>
                  <span className="font-semibold text-yellow-600">
                    {appointments.filter((a: Appointment) => a.status === 'en_attente').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Terminées</span>
                  <span className="font-semibold text-green-600">
                    {appointments.filter((a: Appointment) => a.status === 'termine').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Consultation Dialog */}
      <Dialog open={isConsultationOpen} onOpenChange={setIsConsultationOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Consultation - {selectedPatient?.firstName} {selectedPatient?.lastName}
            </DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <ConsultationForm
              patient={selectedPatient}
              onSubmit={handleSubmitConsultation}
              onCancel={() => setIsConsultationOpen(false)}
              isLoading={createConsultationMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
