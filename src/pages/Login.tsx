import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { PORTAL_LOGIN_URL } from '@/lib/portalNavigation';
import { ExternalLink } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/', { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleVaultLogin = () => {
    // Redirect to Vault portal login with return URL
    const returnUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${PORTAL_LOGIN_URL}?returnUrl=${encodeURIComponent(returnUrl)}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-white">ISP</span>
          </div>
          <div>
            <CardTitle className="text-2xl">ISP Sales Demo</CardTitle>
            <CardDescription className="mt-2">
              Logga in med ditt Vault-konto för att komma åt säljdemon
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full h-12 text-base"
            onClick={handleVaultLogin}
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Logga in med Vault
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Powered by
              </span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              the-vaultai.com Single Sign-On
            </p>
            <p className="text-xs text-muted-foreground">
              Säker autentisering via Vault Business Engine
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>
    </div>
  );
}
