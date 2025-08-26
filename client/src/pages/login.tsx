import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ROLES, ROLE_LABELS } from "@/lib/auth";
import { Hospital } from "lucide-react";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    role: "",
  });

  const { login, isLoginPending, loginError } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.username || !credentials.password || !credentials.role) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    login(credentials, {
      onError: (error: any) => {
        toast({
          title: "Erreur de connexion",
          description: error.message || "Identifiants invalides",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-primary to-medical-secondary p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-medical-primary rounded-full flex items-center justify-center mb-4">
              <Hospital className="text-white text-2xl h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">MediClinic Pro</h2>
            <p className="mt-2 text-gray-600">Système de Gestion Clinique</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  data-testid="input-username"
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <Input
                  data-testid="input-password"
                  type="password"
                  placeholder="Mot de passe"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-transparent"
                />
              </div>
              
              <div>
                <Select
                  value={credentials.role}
                  onValueChange={(value) => setCredentials({ ...credentials, role: value })}
                >
                  <SelectTrigger 
                    data-testid="select-role"
                    className="px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-primary focus:border-transparent"
                  >
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loginError && (
              <div className="text-red-600 text-sm text-center">
                {(loginError as any)?.message || "Erreur de connexion"}
              </div>
            )}

            <Button
              data-testid="button-login"
              type="submit"
              disabled={isLoginPending}
              className="w-full py-3 px-4 bg-medical-primary hover:bg-blue-700 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center"
            >
              {isLoginPending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span className="mr-2">🔑</span>
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
