import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, CalendarPlus } from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  fileNumber: string;
  birthDate?: string;
  status: string;
}

interface PatientCardProps {
  patient: Patient;
  onView?: (patient: Patient) => void;
  onEdit?: (patient: Patient) => void;
  onSchedule?: (patient: Patient) => void;
}

export function PatientCard({ patient, onView, onEdit, onSchedule }: PatientCardProps) {
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-medical-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">{initials}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900" data-testid={`patient-name-${patient.id}`}>
                {patient.firstName} {patient.lastName}
              </div>
              <div className="text-sm text-gray-500">
                Dossier: {patient.fileNumber}
              </div>
              {patient.birthDate && (
                <div className="text-sm text-gray-500">
                  {new Date(patient.birthDate).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(patient.status)} data-testid={`patient-status-${patient.id}`}>
              {patient.status}
            </Badge>
            
            <div className="flex space-x-1">
              {onView && (
                <Button
                  data-testid={`button-view-${patient.id}`}
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(patient)}
                  className="text-medical-primary hover:text-blue-700"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              
              {onEdit && (
                <Button
                  data-testid={`button-edit-${patient.id}`}
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(patient)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              
              {onSchedule && (
                <Button
                  data-testid={`button-schedule-${patient.id}`}
                  variant="ghost"
                  size="icon"
                  onClick={() => onSchedule(patient)}
                  className="text-medical-success hover:text-green-700"
                >
                  <CalendarPlus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
