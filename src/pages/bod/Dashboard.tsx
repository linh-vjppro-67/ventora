import { motion } from 'framer-motion';
import { 
  Building2, 
  FileText, 
  Wallet, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  Target,
  Activity,
  Filter,
  PieChart as PieIcon
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockProjects, mockTenders, mockApprovals, formatCurrency } from '@/data/mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Calculate KPIs
const activeProjects = mockProjects.filter(p => p.status === 'active').length;
const totalContractValue = mockProjects.reduce((sum, p) => sum + p.budget, 0);
const pendingApprovals = mockApprovals.filter(a => a.status === 'pending').length;
const delayedProjects = mockProjects.filter(p => p.progress < 30 && p.status === 'active').length;

// Finance health
const totalBudget = mockProjects.reduce((sum, p) => sum + p.budget, 0);
const totalActual = mockProjects.reduce((sum, p) => sum + p.actualCost, 0);
const burnRate = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;

// Project progress distribution
const progressBuckets = [
  { label: '0–20%', from: 0, to: 20 },
  { label: '20–40%', from: 20, to: 40 },
  { label: '40–60%', from: 40, to: 60 },
  { label: '60–80%', from: 60, to: 80 },
  { label: '80–100%', from: 80, to: 101 },
];
const progressDistribution = progressBuckets.map(b => ({
  name: b.label,
  projects: mockProjects.filter(p => p.progress >= b.from && p.progress < b.to).length,
}));

// Approvals trend by month (count + amount)
const approvalsTrend = (() => {
  const buckets = new Map<string, { month: string; count: number; amount: number }>();
  for (const a of mockApprovals) {
    const m = a.requestedAt.slice(0, 7); // YYYY-MM
    const label = `T${Number(m.slice(5, 7))}`;
    if (!buckets.has(m)) buckets.set(m, { month: label, count: 0, amount: 0 });
    const row = buckets.get(m)!;
    row.count += 1;
    row.amount += a.amount ?? 0;
  }
  return Array.from(buckets.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, v]) => ({ ...v, amount: Math.round(v.amount / 1_000_000_000 * 10) / 10 })); // tỷ
})();

// Tender value by stage (tỷ VNĐ)
const tenderValueByStage = [
  { key: 'lead', name: 'Tiềm năng' },
  { key: 'preparation', name: 'Chuẩn bị' },
  { key: 'submitted', name: 'Đã nộp' },
  { key: 'negotiating', name: 'Thương thảo' },
  { key: 'won', name: 'Trúng' },
  { key: 'lost', name: 'Trượt' },
].map(s => ({
  name: s.name,
  value: Math.round(
    (mockTenders.filter(t => t.status === (s.key as any)).reduce((sum, t) => sum + t.value, 0) / 1_000_000_000) * 10
  ) / 10,
}));

// Delivery vs Finance scatter (progress vs burn %) per project
const deliveryFinanceScatter = mockProjects
  .filter(p => p.status === 'active')
  .map(p => ({
    name: p.code,
    progress: p.progress,
    burn: p.budget > 0 ? Math.round((p.actualCost / p.budget) * 100) : 0,
    size: Math.max(1, Math.round(p.budget / 50_000_000_000)),
  }));

// Tender pipeline data
const tenderPipelineData = [
  { name: 'Tiềm năng', value: mockTenders.filter(t => t.status === 'lead').length, color: 'hsl(var(--chart-1))' },
  { name: 'Chuẩn bị', value: mockTenders.filter(t => t.status === 'preparation').length, color: 'hsl(var(--chart-2))' },
  { name: 'Đã nộp', value: mockTenders.filter(t => t.status === 'submitted').length, color: 'hsl(var(--chart-3))' },
  { name: 'Thương thảo', value: mockTenders.filter(t => t.status === 'negotiating').length, color: 'hsl(var(--chart-4))' },
  { name: 'Trúng', value: mockTenders.filter(t => t.status === 'won').length, color: 'hsl(var(--chart-5))' },
  { name: 'Trượt', value: mockTenders.filter(t => t.status === 'lost').length, color: 'hsl(var(--destructive))' },
];

// Budget vs Actual data
const budgetData = mockProjects.slice(0, 5).map(p => ({
  name: p.code,
  budget: p.budget / 1000000000,
  actual: p.actualCost / 1000000000,
  remaining: (p.budget - p.actualCost) / 1000000000,
}));

// Cash flow projection (mock)
const cashFlowData = [
  { month: 'T1', inflow: 25, outflow: 20 },
  { month: 'T2', inflow: 32, outflow: 28 },
  { month: 'T3', inflow: 28, outflow: 35 },
  { month: 'T4', inflow: 45, outflow: 30 },
  { month: 'T5', inflow: 38, outflow: 32 },
  { month: 'T6', inflow: 50, outflow: 40 },
];

// Win rate calculation
const wonTenders = mockTenders.filter(t => t.status === 'won').length;
const completedTenders = mockTenders.filter(t => t.status === 'won' || t.status === 'lost').length;
const winRate = completedTenders > 0 ? Math.round((wonTenders / completedTenders) * 100) : 0;

export default function BODDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan BOD: dự án • tài chính • pipeline • rủi ro</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="this_quarter">
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Khoảng thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">Tháng này</SelectItem>
                <SelectItem value="this_quarter">Quý này</SelectItem>
                <SelectItem value="this_year">Năm nay</SelectItem>
                <SelectItem value="all">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Xuất báo cáo</Button>
            <Button size="sm" asChild>
              <Link to="/bod/approvals">Phê duyệt ({pendingApprovals})</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Dự án đang thực hiện"
          value={activeProjects}
          icon={Building2}
          change={12}
          trend="up"
          changeLabel="so với quý trước"
          delay={0}
        />
        <KPICard
          title="Tổng giá trị HĐ"
          value={formatCurrency(totalContractValue)}
          icon={FileText}
          change={8}
          trend="up"
          changeLabel="so với quý trước"
          delay={0.1}
        />
        <KPICard
          title="Chờ phê duyệt"
          value={pendingApprovals}
          icon={Clock}
          trend="neutral"
          changeLabel="cần xử lý"
          delay={0.2}
        />
        <KPICard
          title="Tỷ lệ trúng thầu"
          value={`${winRate}%`}
          icon={Target}
          change={5}
          trend="up"
          changeLabel="so với quý trước"
          delay={0.3}
        />
      </div>

      {/* Executive Health Strip */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" />
              Health Score
            </CardTitle>
            <CardDescription>Burn-rate toàn danh mục</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-[120px] w-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[{ name: 'Burn', value: burnRate }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar dataKey="value" cornerRadius={999} fill="hsl(var(--chart-3))" />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">{burnRate}%</div>
                <div className="text-xs text-muted-foreground">Tổng chi / Tổng ngân sách</div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant={burnRate > 90 ? 'destructive' : burnRate > 70 ? 'secondary' : 'outline'}>
                    {burnRate > 90 ? 'Cảnh báo vượt ngân sách' : burnRate > 70 ? 'Theo dõi sát' : 'Ổn định'}
                  </Badge>
                  <Badge variant="outline">Budget: {formatCurrency(totalBudget)}</Badge>
                  <Badge variant="outline">Actual: {formatCurrency(totalActual)}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Delivery Alerts
            </CardTitle>
            <CardDescription>Điểm nóng cần chú ý</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">Dự án chậm tiến độ</div>
                  <div className="text-xs text-muted-foreground">Progress &lt; 30% (active)</div>
                </div>
                <div className="text-2xl font-bold">{delayedProjects}</div>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">PR chờ phê duyệt</div>
                  <div className="text-xs text-muted-foreground">Tổng pending approvals</div>
                </div>
                <div className="text-2xl font-bold">{pendingApprovals}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <PieIcon className="h-4 w-4 text-primary" />
              Progress Distribution
            </CardTitle>
            <CardDescription>Phân bổ dự án theo % tiến độ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis allowDecimals={false} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="projects" fill="hsl(var(--chart-2))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Budget vs Actual */}
            <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Ngân sách vs Thực tế
            </CardTitle>
            <CardDescription>Top 5 dự án theo giá trị (tỷ VNĐ)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)} tỷ`, '']}
                  />
                  <Bar dataKey="budget" fill="hsl(var(--chart-1))" name="Ngân sách" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="actual" fill="hsl(var(--chart-2))" name="Thực tế" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
            </Card>

            {/* Cash Flow */}
            <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Dòng tiền dự kiến
            </CardTitle>
            <CardDescription>Thu chi 6 tháng tới (tỷ VNĐ)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value} tỷ`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="inflow" 
                    stackId="1"
                    stroke="hsl(var(--chart-3))" 
                    fill="hsl(var(--chart-3) / 0.3)"
                    name="Thu"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="outflow" 
                    stackId="2"
                    stroke="hsl(var(--chart-5))" 
                    fill="hsl(var(--chart-5) / 0.3)"
                    name="Chi"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid gap-6 lg:grid-cols-3">
        {/* Tender Pipeline */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Pipeline đấu thầu</CardTitle>
            <CardDescription>Phân bổ theo giai đoạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tenderPipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {tenderPipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {tenderPipelineData.slice(0, 3).map((item) => (
                <div key={item.name}>
                  <div className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Chờ phê duyệt</CardTitle>
              <CardDescription>Các yêu cầu cần xử lý</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link to="/bod/approvals">
                Xem tất cả
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockApprovals.filter(a => a.status === 'pending').slice(0, 4).map((approval) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      approval.type === 'payment' ? 'bg-amber-100 text-amber-600' :
                      approval.type === 'contract' ? 'bg-blue-100 text-blue-600' :
                      approval.type === 'tender' ? 'bg-violet-100 text-violet-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {approval.type === 'payment' ? <Wallet className="h-5 w-5" /> :
                       approval.type === 'contract' ? <FileText className="h-5 w-5" /> :
                       <Building2 className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{approval.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {approval.itemCode} • {approval.requestedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {approval.amount && (
                      <span className="font-semibold text-sm">
                        {formatCurrency(approval.amount)}
                      </span>
                    )}
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <CheckCircle2 className="h-5 w-5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
          </div>

          {/* Projects Overview */}
          <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Dự án đang thực hiện</CardTitle>
            <CardDescription>Tiến độ và trạng thái các dự án</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1" asChild>
            <Link to="/projects">
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockProjects.filter(p => p.status === 'active').slice(0, 4).map((project) => (
              <div key={project.id} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{project.name}</span>
                    <StatusBadge status={project.status} size="sm" />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{project.code}</span>
                    <span>{project.location}</span>
                    <span>{project.manager}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-medium">{project.progress}%</div>
                    <div className="text-xs text-muted-foreground">Tiến độ</div>
                  </div>
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Burn-rate vs Tiến độ
                </CardTitle>
                <CardDescription>Quan hệ giữa % chi phí và % tiến độ (active)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" dataKey="progress" name="Progress" unit="%" domain={[0, 100]} className="text-xs" />
                      <YAxis type="number" dataKey="burn" name="Burn" unit="%" domain={[0, 120]} className="text-xs" />
                      <ZAxis type="number" dataKey="size" range={[60, 200]} />
                      <ReferenceLine x={50} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                      <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(v: number, k: string) => [
                          `${Math.round(v)}%`,
                          k === 'burn' ? 'Burn-rate' : 'Progress'
                        ]}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
                      />
                      <Scatter data={deliveryFinanceScatter} fill="hsl(var(--chart-4))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>• Góc trên-trái: chậm nhưng đã chi nhiều (rủi ro)</span>
                  <span>• Góc dưới-phải: tiến độ tốt, chi hợp lý (tốt)</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Approvals Trend
                </CardTitle>
                <CardDescription>Số lượng & giá trị theo tháng (tỷ VNĐ)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={approvalsTrend}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis yAxisId="left" allowDecimals={false} className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number, name: string) => {
                          if (name === 'amount') return [`${value} tỷ`, 'Giá trị'];
                          return [value, 'Số lượng'];
                        }}
                      />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Số lượng" />
                      <Line yAxisId="right" type="monotone" dataKey="amount" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} name="Giá trị (tỷ)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-primary" />
                  Tender Value by Stage
                </CardTitle>
                <CardDescription>Tổng giá trị theo giai đoạn (tỷ VNĐ)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tenderValueByStage}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(v: number) => [`${v} tỷ`, 'Giá trị']}
                      />
                      <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Win-rate Mix
                </CardTitle>
                <CardDescription>Phân bổ trúng/trượt theo số lượng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Trúng', value: wonTenders },
                          { name: 'Trượt', value: mockTenders.filter(t => t.status === 'lost').length },
                        ]}
                        dataKey="value"
                        innerRadius={60}
                        outerRadius={110}
                        paddingAngle={2}
                      >
                        <Cell fill="hsl(142 71% 45%)" />
                        <Cell fill="hsl(var(--destructive))" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Approval Mix
                </CardTitle>
                <CardDescription>Phân bổ theo loại yêu cầu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={['payment', 'contract', 'tender', 'design'].map((type) => ({
                        type,
                        count: mockApprovals.filter(a => a.type === (type as any)).length,
                        amount: Math.round((mockApprovals.filter(a => a.type === (type as any)).reduce((s, a) => s + (a.amount ?? 0), 0) / 1_000_000_000) * 10) / 10,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="type" className="text-xs" />
                      <YAxis yAxisId="left" allowDecimals={false} className="text-xs" />
                      <YAxis yAxisId="right" orientation="right" className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(v: number, n: string) => n === 'amount' ? [`${v} tỷ`, 'Giá trị'] : [v, 'Số lượng']}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" fill="hsl(var(--chart-2))" name="Số lượng" radius={[6, 6, 0, 0]} />
                      <Bar yAxisId="right" dataKey="amount" fill="hsl(var(--chart-4))" name="Giá trị (tỷ)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Projects Snapshot
                </CardTitle>
                <CardDescription>Tiến độ các dự án đang chạy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProjects.filter(p => p.status === 'active').slice(0, 6).map((project) => (
                    <div key={project.id} className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{project.name}</span>
                          <StatusBadge status={project.status} size="sm" />
                          {project.progress < 30 && <Badge variant="secondary">Watch</Badge>}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{project.code}</span>
                          <span>{project.location}</span>
                          <span>{project.manager}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-medium">{project.progress}%</div>
                          <div className="text-xs text-muted-foreground">Progress</div>
                        </div>
                        <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
