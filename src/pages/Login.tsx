import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/syntaxweb-logo.jpg";
import { apiRequest } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

  const handleGoogleCredential = async (credential?: string) => {
    if (!credential) {
      toast.error("Não foi possível autenticar com o Google");
      return;
    }
    try {
      setGoogleLoading(true);
      const data = await apiRequest<{ token: string }>("/login/google", "POST", { credential });
      localStorage.setItem("auth_token", data.token);
      toast.success("Login com Google realizado com sucesso");
      navigate("/app");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Não foi possível autenticar com o Google";
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const scriptId = "google-identity-services";
    if (window.google) {
      setGoogleScriptLoaded(true);
      return;
    }
    if (document.getElementById(scriptId)) {
      setGoogleScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!googleScriptLoaded || !googleClientId || !window.google || !googleButtonRef.current) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        void handleGoogleCredential(response.credential);
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: "outline",
      size: "large",
      width: "100%",
      text: "signin_with",
      shape: "rectangular",
    });
  }, [googleScriptLoaded, googleClientId]);

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
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-border" />
              <span className="text-sm text-muted-foreground">ou</span>
              <div className="flex-1 border-t border-border" />
            </div>
            {googleClientId ? (
              <>
                <div ref={googleButtonRef} className="flex justify-center" />
                {googleLoading && (
                  <p className="text-xs text-center text-muted-foreground">Aguarde, conectando ao Google...</p>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Configure <code className="text-muted-foreground">VITE_GOOGLE_CLIENT_ID</code> para habilitar o login com
                Google.
              </p>
            )}
          </div>
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
