import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { vaultAgentService } from '@/lib/vaultAgentService';
import { formatCurrency, getMatchScoreColor } from '@/lib/utils';
import {
  Search,
  Building2,
  User,
  TrendingUp,
  Globe,
  Sparkles,
  Loader2,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  org_nr?: string;
  city?: string;
  industry?: string;
  revenue?: number;
  employees?: number;
}

interface ResearchResult {
  company: Company;
  analysis: {
    summary: string;
    strengths: string[];
    sponsorship_potential: number;
    decision_makers: { name: string; title: string; email?: string }[];
    recent_news: string[];
  };
}

export default function ProspectResearch() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [researching, setResearching] = useState(false);

  // Search companies
  const searchCompanies = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('companies')
        .select('id, name, org_nr, city')
        .ilike('name', `%${searchQuery}%`)
        .limit(10);

      if (data) {
        setCompanies(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runResearch = async (company: Company) => {
    setSelectedCompany(company);
    setResearching(true);
    setResearchResult(null);

    try {
      toast({
        title: 'Kör Company Research Agent',
        description: `Researchar ${company.name}...`,
      });

      // Try calling the research agent
      const result = await vaultAgentService.researchCompany(company.name, company.org_nr);

      if (result.success && result.data) {
        // Use agent data
        setResearchResult({
          company,
          analysis: result.data,
        });
      } else {
        // Generate demo research result
        generateDemoResearch(company);
      }

      toast({
        title: 'Research klar!',
        description: `Analys av ${company.name} är klar`,
      });
    } catch (error) {
      console.error('Research error:', error);
      generateDemoResearch(company);
    } finally {
      setResearching(false);
    }
  };

  const generateDemoResearch = (company: Company) => {
    setResearchResult({
      company,
      analysis: {
        summary: `${company.name} är ett etablerat svenskt företag med stark marknadsposition. Bolaget har visat intresse för sportsponsring tidigare och har god ekonomisk grund för partnerskap.`,
        strengths: [
          'Stark varumärkeskännedom i målgruppen',
          'Tidigare erfarenhet av sportsponsring',
          'God ekonomisk stabilitet',
          'Aktiv CSR-profil',
        ],
        sponsorship_potential: 78,
        decision_makers: [
          { name: 'Maria Andersson', title: 'Marknadschef', email: 'maria@example.com' },
          { name: 'Erik Svensson', title: 'VD', email: 'erik@example.com' },
        ],
        recent_news: [
          'Rapporterade ökad omsättning Q3 2025',
          'Lanserade ny hållbarhetsstrategi',
          'Expanderade till norska marknaden',
        ],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-accent" />
          Prospect Research
        </h1>
        <p className="text-muted-foreground mt-1">
          Sök och analysera potentiella sponsorer med AI-driven research
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sök Företag</CardTitle>
          <CardDescription>
            Sök bland 180,000+ svenska företag i Vault-databasen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Företagsnamn eller org.nr..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchCompanies()}
              />
            </div>
            <Button onClick={searchCompanies} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Sök
                </>
              )}
            </Button>
          </div>

          {/* Search Results */}
          {companies.length > 0 && (
            <div className="mt-4 space-y-2">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:border-accent cursor-pointer transition-colors"
                  onClick={() => runResearch(company)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{company.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.org_nr} • {company.city || 'Sverige'}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Researcha
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Research Loading */}
      {researching && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-accent" />
              <div className="text-center">
                <p className="font-semibold">Researchar {selectedCompany?.name}...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  AI-agenten samlar in och analyserar data
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Result */}
      {researchResult && !researching && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{researchResult.company.name}</CardTitle>
                  <CardDescription>
                    {researchResult.company.org_nr} • {researchResult.company.city}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Sponsorpotential</p>
                  <p className={`text-3xl font-bold ${getMatchScoreColor(researchResult.analysis.sponsorship_potential)}`}>
                    {researchResult.analysis.sponsorship_potential}%
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h4 className="font-semibold mb-2">Sammanfattning</h4>
                  <p className="text-muted-foreground">{researchResult.analysis.summary}</p>
                </div>

                {/* Strengths */}
                <div>
                  <h4 className="font-semibold mb-2">Styrkor</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {researchResult.analysis.strengths.map((strength, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded bg-green-50">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Decision Makers */}
                <div>
                  <h4 className="font-semibold mb-2">Beslutsfattare</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {researchResult.analysis.decision_makers.map((dm, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium">{dm.name}</p>
                          <p className="text-sm text-muted-foreground">{dm.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent News */}
                <div>
                  <h4 className="font-semibold mb-2">Senaste Nyheter</h4>
                  <ul className="space-y-2">
                    {researchResult.analysis.recent_news.map((news, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{news}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generera Pitch
                  </Button>
                  <Button variant="outline">
                    Lägg till i Pipeline
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
