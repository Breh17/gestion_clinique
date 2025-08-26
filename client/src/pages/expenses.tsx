import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { StatsCard } from "@/components/ui/stats-card";
import { Receipt, Plus, Eye, Edit, Download, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Expense } from "@/types";

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get expenses
  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["/api/expenses"],
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      const response = await apiRequest("POST", "/api/expenses", expenseData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      setIsFormOpen(false);
      toast({
        title: "Succès",
        description: "Dépense enregistrée avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'enregistrement de la dépense",
        variant: "destructive",
      });
    },
  });

  const handleCreateExpense = () => {
    setSelectedExpense(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (isEditMode && selectedExpense) {
      // Update mutation would go here
      console.log("Update expense:", data);
    } else {
      createExpenseMutation.mutate(data);
    }
  };

  const filteredExpenses = expenses.filter((expense: Expense) => {
    const matchesSearch = !searchQuery || 
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !categoryFilter || expense.category === categoryFilter;
    
    const expenseMonth = new Date(expense.expenseDate).toISOString().slice(0, 7);
    const matchesMonth = !monthFilter || expenseMonth === monthFilter;
    
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Calculate statistics
  const totalExpenses = filteredExpenses.reduce((sum, expense: Expense) => sum + parseFloat(expense.amount), 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses
    .filter((expense: Expense) => expense.expenseDate.startsWith(currentMonth))
    .reduce((sum, expense: Expense) => sum + parseFloat(expense.amount), 0);

  const categories = [...new Set(expenses.map((expense: Expense) => expense.category))];

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'especes':
        return '💵';
      case 'carte':
        return '💳';
      case 'cheque':
        return '📝';
      case 'virement':
        return '🏦';
      case 'mobile_money':
        return '📱';
      default:
        return '💰';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Dépenses"
          value={`€${totalExpenses.toFixed(2)}`}
          icon={DollarSign}
          iconColor="text-medical-danger"
        />
        
        <StatsCard
          title="Ce Mois"
          value={`€${monthlyExpenses.toFixed(2)}`}
          icon={Calendar}
          iconColor="text-medical-warning"
        />
        
        <StatsCard
          title="Nombre de Dépenses"
          value={filteredExpenses.length}
          icon={Receipt}
          iconColor="text-medical-primary"
        />
        
        <StatsCard
          title="Catégories"
          value={categories.length}
          icon={TrendingUp}
          iconColor="text-medical-secondary"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Receipt className="h-5 w-5" />
              <span>Gestion des Dépenses</span>
            </CardTitle>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button 
                  data-testid="button-new-expense"
                  onClick={handleCreateExpense}
                  className="bg-medical-primary text-white hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Dépense
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {isEditMode ? "Modifier Dépense" : "Nouvelle Dépense"}
                  </DialogTitle>
                </DialogHeader>
                <ExpenseForm
                  expense={selectedExpense}
                  onSubmit={handleSubmit}
                  onCancel={() => setIsFormOpen(false)}
                  isLoading={createExpenseMutation.isPending}
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
                data-testid="input-search-expenses"
                type="text"
                placeholder="Rechercher par description, fournisseur, catégorie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="select-category-filter" className="w-48">
                <SelectValue placeholder="Toutes catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger data-testid="select-month-filter" className="w-48">
                <SelectValue placeholder="Tous les mois" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous les mois</SelectItem>
                <SelectItem value={currentMonth}>Ce mois</SelectItem>
                <SelectItem value="2024-01">Janvier 2024</SelectItem>
                <SelectItem value="2024-02">Février 2024</SelectItem>
                <SelectItem value="2024-03">Mars 2024</SelectItem>
              </SelectContent>
            </Select>

            <Button
              data-testid="button-export-expenses"
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Expense List */}
          <div className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchQuery || categoryFilter || monthFilter ? "Aucune dépense trouvée avec ces critères" : "Aucune dépense enregistrée"}
              </div>
            ) : (
              filteredExpenses.map((expense: Expense) => (
                <div 
                  key={expense.id} 
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-medical-danger rounded-full flex items-center justify-center">
                      <Receipt className="text-white h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900" data-testid={`expense-description-${expense.id}`}>
                          {expense.description || "Dépense sans description"}
                        </h3>
                        <Badge className="bg-blue-100 text-blue-800">
                          {expense.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <span>Date: {new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</span>
                        {expense.supplier && (
                          <span className="ml-4">Fournisseur: {expense.supplier}</span>
                        )}
                        {expense.receiptNumber && (
                          <span className="ml-4">Reçu: {expense.receiptNumber}</span>
                        )}
                      </div>
                      {expense.paymentMethod && (
                        <div className="text-sm text-gray-500">
                          <span className="mr-2">{getPaymentMethodIcon(expense.paymentMethod)}</span>
                          Mode de paiement: {expense.paymentMethod}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-medical-danger">
                        €{parseFloat(expense.amount).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(expense.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        data-testid={`button-view-expense-${expense.id}`}
                        variant="ghost"
                        size="icon"
                        className="text-medical-primary hover:text-blue-700"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid={`button-edit-expense-${expense.id}`}
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditExpense(expense)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary by Category */}
          {filteredExpenses.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Catégorie</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const categoryExpenses = filteredExpenses.filter((expense: Expense) => expense.category === category);
                  const categoryTotal = categoryExpenses.reduce((sum, expense: Expense) => sum + parseFloat(expense.amount), 0);
                  
                  return (
                    <Card key={category}>
                      <CardContent className="p-4 text-center">
                        <div className="text-xl font-bold text-gray-900">
                          €{categoryTotal.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">{category}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {categoryExpenses.length} dépense{categoryExpenses.length > 1 ? 's' : ''}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
