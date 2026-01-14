import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingUp,
  Building2,
  Calendar,
  DollarSign,
  ArrowRight,
  Plus,
  Filter,
  MoreVertical,
} from 'lucide-react';

interface PipelineItem {
  id: string;
  company_name: string;
  stage: 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed';
  value: number;
  probability: number;
  next_action: string;
  next_action_date: string;
  owner: string;
}

const STAGES = [
  { id: 'lead', name: 'Lead', color: 'bg-gray-500' },
  { id: 'contact', name: 'Kontakt', color: 'bg-blue-500' },
  { id: 'proposal', name: 'Förslag', color: 'bg-yellow-500' },
  { id: 'negotiation', name: 'Förhandling', color: 'bg-orange-500' },
  { id: 'closed', name: 'Avslutad', color: 'bg-green-500' },
];

export default function Pipeline() {
  const [pipelineItems, setPipelineItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate demo pipeline data
    const demoData: PipelineItem[] = [
      {
        id: '1',
        company_name: 'Volkswagen Sverige',
        stage: 'negotiation',
        value: 2500000,
        probability: 75,
        next_action: 'Förhandlingsmöte',
        next_action_date: '2026-01-20',
        owner: 'Johan S',
      },
      {
        id: '2',
        company_name: 'Bauhaus',
        stage: 'proposal',
        value: 1800000,
        probability: 60,
        next_action: 'Skicka reviderat förslag',
        next_action_date: '2026-01-18',
        owner: 'Maria L',
      },
      {
        id: '3',
        company_name: 'Prioritet Finans',
        stage: 'contact',
        value: 1200000,
        probability: 40,
        next_action: 'Presentationsmöte',
        next_action_date: '2026-01-22',
        owner: 'Johan S',
      },
      {
        id: '4',
        company_name: 'Elgiganten',
        stage: 'lead',
        value: 900000,
        probability: 20,
        next_action: 'Första kontakt',
        next_action_date: '2026-01-25',
        owner: 'Erik A',
      },
      {
        id: '5',
        company_name: 'Stadium',
        stage: 'proposal',
        value: 1500000,
        probability: 55,
        next_action: 'Uppföljning på förslag',
        next_action_date: '2026-01-19',
        owner: 'Maria L',
      },
      {
        id: '6',
        company_name: 'ICA Gruppen',
        stage: 'negotiation',
        value: 3200000,
        probability: 80,
        next_action: 'Kontraktsgenomgång',
        next_action_date: '2026-01-17',
        owner: 'Johan S',
      },
    ];

    setPipelineItems(demoData);
    setLoading(false);
  }, []);

  const getStageItems = (stageId: string) =>
    pipelineItems.filter((item) => item.stage === stageId);

  const totalPipelineValue = pipelineItems.reduce((sum, item) => sum + item.value, 0);
  const weightedValue = pipelineItems.reduce(
    (sum, item) => sum + item.value * (item.probability / 100),
    0
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-96 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-accent" />
            Pipeline
          </h1>
          <p className="text-muted-foreground mt-1">
            Hantera och följ upp alla affärsmöjligheter
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ny Affär
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pipeline</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Viktat Värde</p>
                <p className="text-2xl font-bold">{formatCurrency(weightedValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktiva Affärer</p>
                <p className="text-2xl font-bold">{pipelineItems.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto">
        {STAGES.map((stage) => {
          const items = getStageItems(stage.id);
          const stageValue = items.reduce((sum, item) => sum + item.value, 0);

          return (
            <div key={stage.id} className="min-w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <span className="font-semibold">{stage.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {items.length}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(stageValue)}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:border-accent transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.company_name}</p>
                          <p className="text-lg font-bold mt-1">
                            {formatCurrency(item.value)}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Sannolikhet</span>
                          <span className="font-medium">{item.probability}%</span>
                        </div>
                        <Progress value={item.probability} className="h-1.5" />
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(item.next_action_date)}</span>
                        </div>
                        <p className="text-xs mt-1 truncate">{item.next_action}</p>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {item.owner}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {items.length === 0 && (
                  <div className="p-4 border-2 border-dashed rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Inga affärer</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
