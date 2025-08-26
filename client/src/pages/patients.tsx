import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PatientForm } from "@/components/patients/patient-form";
import { PatientSearch } from "@/components/patients/patient-search";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Eye, Edit, CalendarPlus } from "lucide-react";
import type { Patient } from "@/types";

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients", { search: searchQuery, limit: 50 }],
    enabled: true,
  });

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const response = await apiRequest("POST", "/api/patients", patientData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsFormOpen(false);
      toast({
        title: "Succès",
        description: "Patient créé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la création du patient",
        variant: "destructive",
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/patients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setIsFormOpen(false);
      setSelectedPatient(null);
      toast({
        title: "Succès",
        description: "Patient mis à jour avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la mise à jour du patient",
        variant: "destructive",
      });
    },
  });

  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (isEditMode && selectedPatient) {
      updatePatientMutation.mutate({ id: selectedPatient.id, data });
    } else {
      createPatientMutation.mutate(data);
    }
  };

  const filteredPatients = patients.filter((patient: Patient) => {
    const matchesSearch = !searchQuery || 
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.fileNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !statusFilter || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif':
        return 'bg-green-100 text-green-800';
      case 'inactif':
        return 'bg-gray-100 text-gray-800';
      case 'decede':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 animate-pulse rounded w-1/4"></div>
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
            <CardTitle>Gestion des Patients</CardTitle>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="button-new-patient"
                  onClick={handleCreatePatient}
                  className="bg-medical-primary text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Patient
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Modifier Patient" : "Nouveau Patient"}
                  </DialogTitle>
                </DialogHeader>
                <PatientForm
                  patient={selectedPatient}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsFormOpen(false)}
                  isLoading={createPatientMutation.isPending || updatePatientMutation.isPending}
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
                data-testid="input-search-patients"
                type="text"
                placeholder="Rechercher par nom, numéro dossier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter" className="w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
                <SelectItem value="decede">Décédé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Patient List */}
          <div className="space-y-4">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || statusFilter ? "Aucun patient trouvé avec ces critères" : "Aucun patient enregistré"}
              </div>
            ) : (
              filteredPatients.map((patient: Patient) => (
                <div 
                  key={patient.id} 
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-medical-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {patient.firstName[0]}{patient.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900" data-testid={`patient-name-${patient.id}`}>
                          {patient.firstName} {patient.lastName}
                        </h3>
                        <Badge className={getStatusColor(patient.status)} data-testid={`patient-status-${patient.id}`}>
                          {patient.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span>Dossier: {patient.fileNumber}</span>
                        {patient.birthDate && (
                          <span className="ml-4">
                            Né(e) le {new Date(patient.birthDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                      {patient.phone && (
                        <div className="text-sm text-gray-500">
                          Tél: {patient.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      data-testid={`button-view-${patient.id}`}
                      variant="ghost"
                      size="icon"
                      className="text-medical-primary hover:text-blue-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid={`button-edit-${patient.id}`}
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPatient(patient)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid={`button-schedule-${patient.id}`}
                      variant="ghost"
                      size="icon"
                      className="text-medical-success hover:text-green-700"
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {filteredPatients.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Affichage de {filteredPatients.length} patients
              </div>
              <div className="flex space-x-2">
                <Button 
                  data-testid="button-previous-page"
                  variant="outline" 
                  size="sm" 
                  disabled
                >
                  Précédent
                </Button>
                <Button variant="outline" size="sm" className="bg-medical-primary text-white">
                  1
                </Button>
                <Button 
                  data-testid="button-next-page"
                  variant="outline" 
                  size="sm" 
                  disabled
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
