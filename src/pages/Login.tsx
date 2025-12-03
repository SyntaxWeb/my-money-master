import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/syntaxweb-logo.jpg";
import { apiRequest } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Preencha e-mail e senha");
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<{ token: string }>("/login", "POST", { email, password });

      localStorage.setItem("auth_token", data.token);
      toast.success("Login realizado com sucesso");
      navigate("/app");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Não foi possível conectar ao servidor";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-4">
          <img
            src={logo}
            alt="Syntax Finance"
            className="h-16 w-auto rounded-md object-contain"
          />
          <CardTitle className="text-2xl font-bold text-center">
            Entrar no SyntaxFinance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center text-muted-foreground">
            Ainda não tem conta?{" "}
            <Link to="/register" className="text-primary underline-offset-4 hover:underline">
              Crie sua conta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
