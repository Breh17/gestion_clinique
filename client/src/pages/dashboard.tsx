import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Euro, Calendar, Pill, Clock, TrendingUp, Play, Eye } from "lucide-react";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments", new Date().toISOString().split('T')[0]],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Patients aujourd'hui"
          value={stats?.todayPatients || 0}
          icon={Users}
          trend={{ value: "+12% vs hier", isPositive: true }}
        />
        
        <StatsCard
          title="Recettes du jour"
          value={`€${stats?.todayRevenue || 0}`}
          icon={Euro}
          iconColor="text-medical-success"
          trend={{ value: "+8% vs hier", isPositive: true }}
        />
        
        <StatsCard
          title="RDV en attente"
          value={stats?.pendingAppointments || 0}
          icon={Calendar}
          iconColor="text-medical-warning"
          subtitle="3 retards"
        />
        
        <StatsCard
          title="Stock critique"
          value={stats?.lowStockMedications || 0}
          icon={Pill}
          iconColor="text-medical-danger"
          subtitle="Réappro urgent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Queue Management */}
        <Card>
          <CardHeader>
            <CardTitle>File d'attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!appointments?.length ? (
                <p className="text-gray-500 text-center py-8">Aucun patient en attente</p>
              ) : (
                appointments.slice(0, 5).map((appointment: any, index: number) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-medical-secondary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900" data-testid={`queue-patient-${appointment.id}`}>
                          Patient #{appointment.id.slice(-6)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - Consultation
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className="bg-medical-warning text-white"
                        data-testid={`queue-status-${appointment.id}`}
                      >
                        {appointment.status}
                      </Badge>
                      <Button
                        data-testid={`button-start-consultation-${appointment.id}`}
                        variant="ghost"
                        size="icon"
                        className="text-medical-primary hover:text-blue-700"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Agenda du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {!appointments?.length ? (
                <p className="text-gray-500 text-center py-8">Aucun rendez-vous aujourd'hui</p>
              ) : (
                appointments.slice(0, 6).map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition duration-150">
                    <div className="text-sm font-medium text-gray-500 w-16">
                      {new Date(appointment.appointmentDate).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900" data-testid={`schedule-patient-${appointment.id}`}>
                        Patient #{appointment.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">Consultation générale</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        className={
                          appointment.status === 'termine' ? 'bg-medical-success text-white' :
                          appointment.status === 'en_consultation' ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }
                        data-testid={`schedule-status-${appointment.id}`}
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertes Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Paracétamol 500mg</p>
                  <p className="text-sm text-gray-500">Stock: 12 unités</p>
                </div>
                <Clock className="text-medical-danger h-5 w-5" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Amoxicilline 250mg</p>
                  <p className="text-sm text-gray-500">Expire dans 15 jours</p>
                </div>
                <Clock className="text-medical-warning h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Résumé Financier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recettes du jour</span>
                <span className="font-semibold text-medical-success" data-testid="financial-revenue">
                  €{stats?.todayRevenue || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dépenses du jour</span>
                <span className="font-semibold text-medical-danger">€423</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Bénéfice net</span>
                  <span className="font-bold text-medical-success" data-testid="financial-profit">
                    €{(stats?.todayRevenue || 0) - 423}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commission Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Commissions à payer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Dr. Externe A</p>
                  <p className="text-sm text-gray-500">Janvier 2024</p>
                </div>
                <span className="font-semibold text-medical-primary">€850</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Dr. Externe B</p>
                  <p className="text-sm text-gray-500">Janvier 2024</p>
                </div>
                <span className="font-semibold text-medical-primary">€650</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
