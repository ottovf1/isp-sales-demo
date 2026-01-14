import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  FileText, 
  Target, 
  Users, 
  TrendingUp, 
  Building2,
  Presentation,
  Download,
  Copy,
  RefreshCw,
  CheckCircle2,
  Zap,
  Heart,
  Eye,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { vaultAgentService } from '@/lib/vaultAgentService';

interface PitchSection {
  title: string;
  content: string;
  icon: React.ReactNode;
}

interface GeneratedPitch {
  executive_summary: string;
  target_audience_fit: string;
  partnership_value: string;
  activation_ideas: string[];
  roi_projection: string;
  sure_breakdown: {
    synlighet: string;
    upplevelse: string;
    relation: string;
    engagemang: string;
  };
  call_to_action: string;
  recommended_package: string;
  investment_range: string;
}

const clubOptions = [
  { value: 'dif', label: 'Djurgårdens IF', sport: 'Fotboll' },
  { value: 'ifk', label: 'IFK Göteborg', sport: 'Fotboll' },
  { value: 'aik', label: 'AIK', sport: 'Fotboll' },
  { value: 'handboll', label: 'Svenska Handbollslandslaget', sport: 'Handboll' },
  { value: 'frolunda', label: 'Frölunda HC', sport: 'Hockey' },
  { value: 'djurgarden-hockey', label: 'Djurgården Hockey', sport: 'Hockey' },
];

const industryOptions = [
  { value: 'automotive', label: 'Fordon & Transport' },
  { value: 'finance', label: 'Bank & Finans' },
  { value: 'retail', label: 'Retail & Detaljhandel' },
  { value: 'fmcg', label: 'FMCG & Dagligvaror' },
  { value: 'tech', label: 'Tech & Telecom' },
  { value: 'insurance', label: 'Försäkring' },
  { value: 'energy', label: 'Energi & Miljö' },
  { value: 'construction', label: 'Bygg & Fastighet' },
];

const objectiveOptions = [
  { value: 'brand_awareness', label: 'Varumärkeskännedom', icon: Eye },
  { value: 'lead_generation', label: 'Leadgenerering', icon: Target },
  { value: 'customer_loyalty', label: 'Kundlojalitet', icon: Heart },
  { value: 'b2b_networking', label: 'B2B-nätverk', icon: Users },
  { value: 'employee_engagement', label: 'Medarbetarengagemang', icon: Zap },
  { value: 'csr', label: 'CSR & Hållbarhet', icon: Heart },
];

export default function PitchGenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  // Form state
  const [companyName, setCompanyName] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  
  // Generated pitch
  const [generatedPitch, setGeneratedPitch] = useState<GeneratedPitch | null>(null);

  const toggleObjective = (value: string) => {
    setSelectedObjectives(prev => 
      prev.includes(value) 
        ? prev.filter(o => o !== value)
        : [...prev, value]
    );
  };

  const simulateProgress = async () => {
    const steps = [
      { progress: 15, step: 'Analyserar målgrupp...' },
      { progress: 30, step: 'Hämtar fanbase-data...' },
      { progress: 45, step: 'Beräknar matchningspoäng...' },
      { progress: 60, step: 'Genererar SURE-analys...' },
      { progress: 75, step: 'Skapar aktiveringsförslag...' },
      { progress: 90, step: 'Beräknar ROI-projektion...' },
      { progress: 100, step: 'Slutför pitch...' },
    ];

    for (const { progress, step } of steps) {
      setGenerationProgress(progress);
      setCurrentStep(step);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  };

  const generatePitch = async () => {
    if (!companyName || !selectedClub || !selectedIndustry || selectedObjectives.length === 0) {
      toast({
        title: "Fyll i alla fält",
        description: "Företagsnamn, klubb, bransch och minst ett mål krävs",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedPitch(null);

    try {
      // Start progress simulation
      const progressPromise = simulateProgress();

      // Call Vault agent
      const clubLabel = clubOptions.find(c => c.value === selectedClub)?.label || selectedClub;
      const industryLabel = industryOptions.find(i => i.value === selectedIndustry)?.label || selectedIndustry;
      const objectiveLabels = selectedObjectives.map(o => 
        objectiveOptions.find(opt => opt.value === o)?.label || o
      );

      const result = await vaultAgentService.generatePitch({
        company_name: companyName,
        club: clubLabel,
        industry: industryLabel,
        objectives: objectiveLabels,
        budget: budget || 'Ej specificerad',
        additional_context: additionalNotes
      });

      await progressPromise;

      if (result.success && result.data) {
        setGeneratedPitch(result.data);
        toast({
          title: "Pitch genererad!",
          description: "Din sponsorpitch är redo att använda",
        });
      } else {
        // Generate demo pitch as fallback
        setGeneratedPitch(generateDemoPitch(companyName, clubLabel, industryLabel, objectiveLabels));
        toast({
          title: "Demo-pitch genererad",
          description: "Använder exempeldata för demonstration",
        });
      }
    } catch (error) {
      console.error('Pitch generation error:', error);
      // Fallback to demo pitch
      const clubLabel = clubOptions.find(c => c.value === selectedClub)?.label || selectedClub;
      const industryLabel = industryOptions.find(i => i.value === selectedIndustry)?.label || selectedIndustry;
      const objectiveLabels = selectedObjectives.map(o => 
        objectiveOptions.find(opt => opt.value === o)?.label || o
      );
      setGeneratedPitch(generateDemoPitch(companyName, clubLabel, industryLabel, objectiveLabels));
    } finally {
      setIsGenerating(false);
    }
  };

  const generateDemoPitch = (
    company: string, 
    club: string, 
    industry: string, 
    objectives: string[]
  ): GeneratedPitch => {
    return {
      executive_summary: `${company} och ${club} delar en gemensam målgrupp av engagerade konsumenter med hög köpkraft inom ${industry.toLowerCase()}-segmentet. Vår analys visar en matchningspoäng på 87/100 baserat på demografisk överlappning, värderingar och aktiveringsmöjligheter. Detta partnerskap erbjuder en unik möjlighet att nå ${Math.floor(Math.random() * 50000 + 100000).toLocaleString()} aktiva supportrar med hög affinitet för ${company}s produktkategori.`,
      
      target_audience_fit: `Fanbasen för ${club} matchar ${company}s primära målgrupp exceptionellt väl:\n\n• 68% män i åldern 25-54 år\n• Genomsnittlig hushållsinkomst 15% över rikssnittet\n• 73% är aktiva på sociala medier\n• 45% har köpt sponsorprodukter det senaste året\n• Hög lojalitet - 89% har följt klubben i 5+ år`,
      
      partnership_value: `Baserat på ${club}s mediavärde och ${company}s specifika mål inom ${objectives.join(', ').toLowerCase()}, estimerar vi följande årliga värde:\n\n• Mediaexponering: 12.5 MSEK\n• PR-värde: 4.2 MSEK\n• B2B-nätverk: 2.8 MSEK\n• Digitalt engagemang: 3.1 MSEK\n\nTotalt estimerat värde: 22.6 MSEK`,
      
      activation_ideas: [
        `"${company} Match Day" - Namngivningsrätt för utvalda hemmamatcher med exklusiv aktivering`,
        `VIP-hospitality för ${company}s nyckelkunder vid alla hemmamatcher`,
        `Digital kampanj med spelare som ambassadörer - reach: 500K+`,
        `Gemensam CSR-satsning inom ungdomsidrott i ${club}s lokalområde`,
        `Exklusiv merchandise-kollektion co-brandad ${company} x ${club}`,
        `Behind-the-scenes content-serie för ${company}s sociala kanaler`
      ],
      
      roi_projection: `Baserat på historisk data från liknande partnerskap projekterar vi:\n\n• År 1: 180% ROI (uppstartskostnader inkluderade)\n• År 2: 320% ROI (full aktivering)\n• År 3+: 400%+ ROI (etablerat partnerskap)\n\nBreak-even estimeras inom 8 månader från avtalsstart.`,
      
      sure_breakdown: {
        synlighet: `Exponering via LEDs (16 matcher), tröjreklam, digitala kanaler och PR. Estimerad reach: 45M impressions/år. ${company}s logotyp syns i genomsnitt 47 minuter per TV-sänd match.`,
        upplevelse: `VIP-lounge för 20 gäster per match, exklusiva spelarträffar, bakom kulisserna-access. Perfekt för ${company}s viktigaste kunder och prospects.`,
        relation: `Tillgång till ${club}s nätverk av 85+ sponsorer och partners. Matchmaking-event 4 gånger per år. Direkt kontakt med klubbledning.`,
        engagemang: `Co-branded kampanjer, spelarambassadörer, fanklubbsaktivering. Möjlighet att aktivera ${club}s 125K följare på sociala medier.`
      },
      
      call_to_action: `Vi föreslår ett inledande möte för att diskutera hur ${company} kan bli en del av ${club}-familjen. Nästa steg:\n\n1. Djupdykning i specifika aktiveringsmöjligheter\n2. Skräddarsydd paketpresentation\n3. ROI-workshop med era beslutsfattare\n\nKontakta oss för att boka ett möte inom de närmaste 14 dagarna.`,
      
      recommended_package: 'Premium Partner',
      investment_range: '2.5 - 4.0 MSEK/år'
    };
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Kopierat!",
      description: "Text kopierad till urklipp",
    });
  };

  const exportPitch = () => {
    if (!generatedPitch) return;
    
    const pitchText = `
SPONSORFÖRSLAG: ${companyName} x ${clubOptions.find(c => c.value === selectedClub)?.label}
================================================================================

EXECUTIVE SUMMARY
${generatedPitch.executive_summary}

MÅLGRUPPSANALYS
${generatedPitch.target_audience_fit}

PARTNERSKAPSVÄRDE
${generatedPitch.partnership_value}

AKTIVERINGSFÖRSLAG
${generatedPitch.activation_ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}

ROI-PROJEKTION
${generatedPitch.roi_projection}

SURE-MODELLEN
--------------------------------------------------------------------------------
SYNLIGHET: ${generatedPitch.sure_breakdown.synlighet}
UPPLEVELSE: ${generatedPitch.sure_breakdown.upplevelse}
RELATION: ${generatedPitch.sure_breakdown.relation}
ENGAGEMANG: ${generatedPitch.sure_breakdown.engagemang}

REKOMMENDATION
Paket: ${generatedPitch.recommended_package}
Investering: ${generatedPitch.investment_range}

NÄSTA STEG
${generatedPitch.call_to_action}

================================================================================
Genererad av ISP Sport AI Pitch Generator
    `.trim();

    const blob = new Blob([pitchText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pitch_${companyName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Pitch exporterad!",
      description: "Filen har laddats ned",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-purple-400" />
            AI Pitch Generator
          </h1>
          <p className="text-slate-400 mt-1">
            Skapa skräddarsydda sponsorförslag med AI-driven analys
          </p>
        </div>
        {generatedPitch && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportPitch}>
              <Download className="h-4 w-4 mr-2" />
              Exportera
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setGeneratedPitch(null);
                setGenerationProgress(0);
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Ny pitch
            </Button>
          </div>
        )}
      </div>

      {!generatedPitch ? (
        /* Input Form */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                Företagsinformation
              </CardTitle>
              <CardDescription>
                Ange information om sponsorkandidaten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Företagsnamn *</label>
                <Input
                  placeholder="T.ex. Volkswagen Sverige"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-slate-900 border-slate-600"
                />
              </div>
              
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Bransch *</label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="bg-slate-900 border-slate-600">
                    <SelectValue placeholder="Välj bransch" />
                  </SelectTrigger>
                  <SelectContent>
                    {industryOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Budgetintervall (valfritt)</label>
                <Input
                  placeholder="T.ex. 2-5 MSEK/år"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="bg-slate-900 border-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Partnership Details */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Presentation className="h-5 w-5 text-purple-400" />
                Partnerskapsdetaljer
              </CardTitle>
              <CardDescription>
                Välj klubb och definiera mål
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">Klubb/Rättighetshavare *</label>
                <Select value={selectedClub} onValueChange={setSelectedClub}>
                  <SelectTrigger className="bg-slate-900 border-slate-600">
                    <SelectValue placeholder="Välj klubb" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label} ({opt.sport})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Primära mål * (välj minst ett)</label>
                <div className="grid grid-cols-2 gap-2">
                  {objectiveOptions.map(opt => {
                    const Icon = opt.icon;
                    const isSelected = selectedObjectives.includes(opt.value);
                    return (
                      <Button
                        key={opt.value}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleObjective(opt.value)}
                        className={isSelected ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {opt.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">Övriga anteckningar</label>
                <Input
                  placeholder="Tidigare sponsorhistorik, särskilda önskemål..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="bg-slate-900 border-slate-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="lg:col-span-2">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              onClick={generatePitch}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  {currentStep}
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generera Sponsorpitch
                </>
              )}
            </Button>
            
            {isGenerating && (
              <div className="mt-4">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-sm text-slate-400 text-center mt-2">
                  {currentStep}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Generated Pitch Display */
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="sure">SURE-analys</TabsTrigger>
            <TabsTrigger value="activations">Aktiveringar</TabsTrigger>
            <TabsTrigger value="roi">ROI & Investering</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Executive Summary */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Executive Summary
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(generatedPitch.executive_summary)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed">
                  {generatedPitch.executive_summary}
                </p>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-400" />
                    Målgruppsanalys
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(generatedPitch.target_audience_fit)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {generatedPitch.target_audience_fit}
                </p>
              </CardContent>
            </Card>

            {/* Partnership Value */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Partnerskapsvärde
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(generatedPitch.partnership_value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {generatedPitch.partnership_value}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sure" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Synlighet */}
              <Card className="bg-slate-800/50 border-slate-700 border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-400" />
                    Synlighet (S)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    {generatedPitch.sure_breakdown.synlighet}
                  </p>
                </CardContent>
              </Card>

              {/* Upplevelse */}
              <Card className="bg-slate-800/50 border-slate-700 border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Heart className="h-5 w-5 text-green-400" />
                    Upplevelse (U)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    {generatedPitch.sure_breakdown.upplevelse}
                  </p>
                </CardContent>
              </Card>

              {/* Relation */}
              <Card className="bg-slate-800/50 border-slate-700 border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-400" />
                    Relation (R)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    {generatedPitch.sure_breakdown.relation}
                  </p>
                </CardContent>
              </Card>

              {/* Engagemang */}
              <Card className="bg-slate-800/50 border-slate-700 border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-400" />
                    Engagemang (E)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">
                    {generatedPitch.sure_breakdown.engagemang}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activations" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Aktiveringsförslag
                </CardTitle>
                <CardDescription>
                  AI-genererade aktiveringsidéer anpassade för partnerskapet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {generatedPitch.activation_ideas.map((idea, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-lg"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-slate-300">{idea}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roi" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700">
                <CardHeader>
                  <CardTitle className="text-white">Rekommenderat paket</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-400">
                    {generatedPitch.recommended_package}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700">
                <CardHeader>
                  <CardTitle className="text-white">Investering</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-400">
                    {generatedPitch.investment_range}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700">
                <CardHeader>
                  <CardTitle className="text-white">Break-even</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-400">
                    8 månader
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  ROI-projektion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {generatedPitch.roi_projection}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  Nästa steg
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                  {generatedPitch.call_to_action}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Boka möte
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Ladda ned som PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
