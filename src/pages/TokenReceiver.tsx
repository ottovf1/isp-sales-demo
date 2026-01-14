import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * TokenReceiver - SSO Callback Handler
 * 
 * This page receives tokens from the-vaultai.com portal SSO flow.
 * URL format: /auth/callback?access_token=xxx&refresh_token=xxx
 * 
 * Flow:
 * 1. User logs in at the-vaultai.com
 * 2. Portal redirects to this page with tokens
 * 3. We set the Supabase session
 * 4. Redirect to dashboard
 */
export default function TokenReceiver() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleTokens = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
          // Check hash fragment (some OAuth flows use hash)
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const hashAccessToken = hashParams.get('access_token');
          const hashRefreshToken = hashParams.get('refresh_token');

          if (!hashAccessToken || !hashRefreshToken) {
            throw new Error('Inga tokens hittades i URL');
          }

          // Use hash tokens
          await setSession(hashAccessToken, hashRefreshToken);
        } else {
          await setSession(accessToken, refreshToken);
        }
      } catch (err) {
        console.error('TokenReceiver error:', err);
        setError(err instanceof Error ? err.message : 'Okänt fel');
        setStatus('error');
      }
    };

    const setSession = async (accessToken: string, refreshToken: string) => {
      console.log('ISP Sales Demo: Setting session from SSO tokens...');
      
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (error) {
        throw new Error(`Session error: ${error.message}`);
      }

      if (!data.session) {
        throw new Error('Ingen session skapad');
      }

      console.log('ISP Sales Demo: SSO session established successfully');
      setStatus('success');

      // Clean URL and redirect
      window.history.replaceState({}, document.title, '/auth/callback');
      
      // Small delay for UX
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 500);
    };

    handleTokens();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <h1 className="text-xl font-semibold">Loggar in...</h1>
            <p className="text-muted-foreground">Autentiserar med Vault portal</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-green-600">Inloggad!</h1>
            <p className="text-muted-foreground">Omdirigerar till dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-red-600">Inloggning misslyckades</h1>
            <p className="text-muted-foreground">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Tillbaka till login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
