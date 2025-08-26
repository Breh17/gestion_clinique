import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FinancialChart } from "@/components/reports/financial-chart";
import { BarChart3, FileText, Download, Eye, Mail, TrendingUp, DollarSign, Users, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const reportTypes = [
  { id: "financial", name: "Journal des recettes", icon: DollarSign, description: "Recettes par utilisateur, mode de paiement" },
  { id: "cash", name: "Journal de caisse", icon: BarChart3, description: "Ouverture, mouvements, clôture" },
  { id: "geography", name: "Répartition géographique", icon: MapPin, description: "Patients par commune, région, pays" },
  { id: "commissions", name: "Commissions intervenants", icon: TrendingUp, description: "Base de calcul, montants, statuts" },
  { id: "stock", name: "Valorisation stock", icon: FileText, description: "Stock en PA et PV, marge théorique" },
  { id: "expiry", name: "Péremptions", icon: FileText, description: "Lots à 30/60/90 jours" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("pdf");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock recent reports data
  const recentReports = [
    {
      id: "1",
      name: "Journal des recettes par utilisateur",
      description: "Détail des paiements par caissier",
      period: "01/01/2024 - 15/01/2024",
      generatedDate: "15/01/2024 16:30",
      status: "Prêt",
      format: "PDF"
    },
    {
      id: "2",
      name: "Répartition géographique patients",
      description: "Analyse par commune et région",
      period: "Janvier 2024",
      generatedDate: "14/01/2024 09:15",
      status: "En cours",
      format: "Excel"
    },
  ];

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      let endpoint = "";
      switch (reportData.type) {
        case "financial":
          endpoint = "/api/reports/financial";
          break;
        case "geography":
          endpoint = "/api/reports/patients";
          break;
        default:
          throw new Error("Type de rapport non supporté");
      }
      
      const response = await apiRequest("POST", endpoint, {
        startDate: reportData.startDate,
        endDate: reportData.endDate,
        format: reportData.format,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Rapport généré avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la génération du rapport",
        variant: "destructive",
      });
    },
  });

  const handleGenerateReport = () => {
    if (!selectedReport || !startDate || !endDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de rapport et une période",
        variant: "destructive",
      });
      return;
    }

    generateReportMutation.mutate({
      type: selectedReport,
      startDate,
      endDate,
      format,
    });
  };

  const handleQuickReport = (reportId: string) => {
    const report = reportTypes.find(r => r.id === reportId);
    if (report) {
      setSelectedReport(reportId);
      // Set default dates (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      setStartDate(startDate.toISOString().split('T')[0]);
      setEndDate(endDate.toISOString().split('T')[0]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'prêt':
        return 'bg-green-100 text-green-800';
      case 'en cours':
        return 'bg-yellow-100 text-yellow-800';
      case 'erreur':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card 
              key={report.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                selectedReport === report.id ? 'ring-2 ring-medical-primary bg-blue-50' : ''
              }`}
              onClick={() => handleQuickReport(report.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="text-medical-primary text-xl h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Report Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Génération de Rapport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de rapport</label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger data-testid="select-report-type">
                  <SelectValue placeholder="Sélectionner un rapport" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <Input
                data-testid="input-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de fin</label>
              <Input
                data-testid="input-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger data-testid="select-report-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              data-testid="button-preview-report"
              variant="outline"
              disabled={!selectedReport || !startDate || !endDate}
            >
              Aperçu
            </Button>
            <Button
              data-testid="button-generate-report"
              onClick={handleGenerateReport}
              disabled={generateReportMutation.isPending || !selectedReport || !startDate || !endDate}
              className="bg-medical-primary hover:bg-blue-700"
            >
              {generateReportMutation.isPending ? "Génération..." : "Générer Rapport"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports Récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rapport</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Généré le</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Aucun rapport récent
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900" data-testid={`report-name-${report.id}`}>
                            {report.name}
                          </div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.generatedDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={getStatusColor(report.status)}
                          data-testid={`report-status-${report.id}`}
                        >
                          {report.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            data-testid={`button-download-report-${report.id}`}
                            variant="ghost"
                            size="icon"
                            className="text-medical-primary hover:text-blue-700"
                            disabled={report.status !== 'Prêt'}
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            data-testid={`button-view-report-${report.id}`}
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-gray-600"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            data-testid={`button-email-report-${report.id}`}
                            variant="ghost"
                            size="icon"
                            className="text-medical-success hover:text-green-700"
                            disabled={report.status !== 'Prêt'}
                            title="Envoyer par email"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Dashboard Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Recettes</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Prestations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-500">Répartition des prestations</p>
                <p className="text-sm text-gray-400">Par volume et CA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
