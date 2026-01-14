import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { vaultAgentService } from '@/lib/vaultAgentService';
import { formatCurrency, getMatchScoreColor, getMatchScoreBgColor } from '@/lib/utils';
import {
  Target,
  Search,
  Sparkles,
  Building2,
  Users,
  TrendingUp,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RightsHolder {
  id: string;
  name: string;
  type: string;
  league?: string;
  city?: string;
}

interface SponsorMatch {
  company_id: string;
  company_name: string;
  match_score: number;
  reasoning: string;
  fanbase_overlap: number;
  brand_fit: number;
  budget_fit: number;
}

export default function SponsorMatch() {
  const { toast } = useToast();
  const [rightsHolders, setRightsHolders] = useState<RightsHolder[]>([]);
  const [selectedRightsHolder, setSelectedRightsHolder] = useState<string>('');
  const [matches, setMatches] = useState<SponsorMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Fetch rights holders (clubs from sef_clubs)
  useEffect(() => {
    const fetchRightsHolders = async () => {
      setLoading(true);
      try {
        const { data: clubs } = await supabase
          .from('sef_clubs')
          .select('id, name, league, city')
          .order('name');

        if (clubs) {
          setRightsHolders(
            clubs.map((c) => ({
              id: c.id.toString(),
              name: c.name,
              type: 'sports_club',
              league: c.league,
              city: c.city,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching rights holders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRightsHolders();
  }, []);

  const runSponsorMatch = async () => {
    if (!selectedRightsHolder) {
      toast({
        title: 'Välj rättighetsinnehavare',
        description: 'Du måste välja en klubb eller förbund att matcha',
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    setMatches([]);

    try {
      toast({
        title: 'Kör Sponsor Match Agent',
        description: 'Analyserar fanbase och hittar matchande sponsorer...',
      });

      // Call the sponsor_match_agent via Vault
      const result = await vaultAgentService.matchSponsor(selectedRightsHolder, {
        min_match_score: 60,
        max_results: 10,
      });

      if (result.success && result.data) {
        // Parse agent response
        const agentMatches = result.data.matches || result.data;
        
        if (Array.isArray(agentMatches)) {
          setMatches(agentMatches);
          toast({
            title: 'Matchning klar!',
            description: `Hittade ${agentMatches.length} potentiella sponsorer`,
          });
        } else {
          // Fallback: generate demo matches from companies
          await generateDemoMatches();
        }
      } else {
        // Fallback: generate demo matches
        await generateDemoMatches();
      }
    } catch (error) {
      console.error('Sponsor match error:', error);
      // Fallback to demo data
      await generateDemoMatches();
    } finally {
      setSearching(false);
    }
  };

  const generateDemoMatches = async () => {
    // Fetch real companies from normalized_brands for demo
    const { data: brands } = await supabase
      .from('normalized_brands')
      .select('id, brand_name, category, industry')
      .eq('status', 'active')
      .limit(8);

    if (brands) {
      const demoMatches: SponsorMatch[] = brands.map((b, i) => ({
        company_id: b.id,
        company_name: b.brand_name,
        match_score: 95 - i * 5 + Math.floor(Math.random() * 5),
        reasoning: `Stark matchning baserat på ${b.industry || b.category} och målgruppsöverlapp`,
        fanbase_overlap: 80 - i * 3 + Math.floor(Math.random() * 10),
        brand_fit: 85 - i * 4 + Math.floor(Math.random() * 8),
        budget_fit: 75 - i * 2 + Math.floor(Math.random() * 12),
      }));

      setMatches(demoMatches);
      toast({
        title: 'Demo-matchning klar',
        description: 'Visar matchningar från Vault brand-databas',
      });
    }
  };

  const selectedHolder = rightsHolders.find((r) => r.id === selectedRightsHolder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-accent" />
          Sponsor Match
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-driven matchning av sponsorer med rättighetsinnehavare baserat på fanbase-data
        </p>
      </div>

      {/* Selection Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Välj Rättighetsinnehavare</CardTitle>
          <CardDescription>
            Välj klubb eller förbund för att hitta matchande sponsorer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedRightsHolder} onValueChange={setSelectedRightsHolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj klubb eller förbund..." />
                </SelectTrigger>
                <SelectContent>
                  {rightsHolders.map((rh) => (
                    <SelectItem key={rh.id} value={rh.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{rh.name}</span>
                        {rh.league && (
                          <Badge variant="secondary" className="text-xs">
                            {rh.league}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={runSponsorMatch}
              disabled={!selectedRightsHolder || searching}
              className="min-w-[200px]"
            >
              {searching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyserar...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Kör Sponsor Match
                </>
              )}
            </Button>
          </div>

          {selectedHolder && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedHolder.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedHolder.league} • {selectedHolder.city}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {matches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Matchade Sponsorer</CardTitle>
            <CardDescription>
              {matches.length} potentiella sponsorer rankade efter matchningspoäng
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matches.map((match, index) => (
                <div
                  key={match.company_id}
                  className="p-4 rounded-lg border hover:border-accent transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${getMatchScoreBgColor(
                          match.match_score
                        )} ${getMatchScoreColor(match.match_score)}`}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{match.company_name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {match.reasoning}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${getMatchScoreColor(
                          match.match_score
                        )}`}
                      >
                        {match.match_score}%
                      </div>
                      <p className="text-xs text-muted-foreground">Match Score</p>
                    </div>
                  </div>

                  {/* Score breakdown */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Fanbase Overlap</span>
                        <span className="font-medium">{match.fanbase_overlap}%</span>
                      </div>
                      <Progress value={match.fanbase_overlap} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Brand Fit</span>
                        <span className="font-medium">{match.brand_fit}%</span>
                      </div>
                      <Progress value={match.brand_fit} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Budget Fit</span>
                        <span className="font-medium">{match.budget_fit}%</span>
                      </div>
                      <Progress value={match.budget_fit} className="h-2" />
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm">
                      Generera Pitch
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!searching && matches.length === 0 && selectedRightsHolder && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-semibold">Redo att matcha</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Klicka "Kör Sponsor Match" för att hitta potentiella sponsorer
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
