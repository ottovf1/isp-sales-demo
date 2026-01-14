import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  Target,
  Users,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalRevenue: number;
  activeClients: number;
  agentExecutions: number;
  successRate: number;
}

interface RecentExecution {
  id: string;
  agent_id: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentExecutions, setRecentExecutions] = useState<RecentExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch order stats
        const { data: orders } = await supabase
          .from('orders')
          .select('belopp_netto')
          .eq('sasong', '2025');

        const totalRevenue = orders?.reduce((sum, o) => sum + (o.belopp_netto || 0), 0) || 0;

        // Fetch CRM customers count
        const { count: clientCount } = await supabase
          .from('crm_customers')
          .select('*', { count: 'exact', head: true });

        // Fetch agent executions
        const { data: executions } = await supabase
          .from('agent_executions')
          .select('id, agent_id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(10);

        const { count: totalExecutions } = await supabase
          .from('agent_executions')
          .select('*', { count: 'exact', head: true });

        const { count: successfulExecutions } = await supabase
          .from('agent_executions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed');

        const successRate = totalExecutions && successfulExecutions
          ? Math.round((successfulExecutions / totalExecutions) * 100)
          : 0;

        setStats({
          totalRevenue,
          activeClients: clientCount || 0,
          agentExecutions: totalExecutions || 0,
          successRate,
        });

        setRecentExecutions(executions || []);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiCards = [
    {
      title: 'Total Intäkt 2025',
      value: stats ? formatCurrency(stats.totalRevenue) : '-',
      change: '+12%',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Aktiva Kunder',
      value: stats ? formatNumber(stats.activeClients) : '-',
      change: '+8%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Agent-körningar',
      value: stats ? formatNumber(stats.agentExecutions) : '-',
      change: '+156 idag',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Success Rate',
      value: stats ? `${stats.successRate}%` : '-',
      change: 'Stabilt',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const quickActions = [
    { label: 'Ny Sponsor Match', path: '/sponsor-match', icon: Target },
    { label: 'Fanbase Analys', path: '/fanbase-insights', icon: Users },
    { label: 'Generera Pitch', path: '/pitch-generator', icon: Zap },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Välkommen tillbaka, {user?.user_metadata?.full_name || 'Säljare'}!
          </p>
        </div>
        <div className="flex gap-2">
          {quickActions.map((action) => (
            <Button
              key={action.path}
              variant="outline"
              size="sm"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <p className={`text-sm mt-1 ${kpi.color}`}>{kpi.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Agent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Senaste Agent-aktivitet</CardTitle>
            <CardDescription>Realtidsöversikt över AI-agenter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExecutions.slice(0, 5).map((exec) => (
                <div
                  key={exec.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {exec.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : exec.status === 'failed' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{exec.agent_id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exec.created_at).toLocaleString('sv-SE')}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={exec.status === 'completed' ? 'success' : exec.status === 'failed' ? 'destructive' : 'secondary'}
                  >
                    {exec.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SURE Model Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">SURE-modellen</CardTitle>
            <CardDescription>Sponsrings-matchnings ramverk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Synlighet', value: 85, color: 'bg-blue-500' },
                { label: 'Upplevelse', value: 72, color: 'bg-green-500' },
                { label: 'Relation', value: 68, color: 'bg-purple-500' },
                { label: 'Engagemang', value: 91, color: 'bg-orange-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm font-medium text-accent">Vault AI Rekommendation</p>
              <p className="text-sm text-muted-foreground mt-1">
                Fokusera på Relation-komponenten för att öka matchningspoäng med 15%
              </p>
              <Button size="sm" variant="accent" className="mt-3">
                Kör Sponsor Match
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
