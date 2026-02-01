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
  Target
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockProjects, mockTenders, mockApprovals, mockPaymentRequests, formatCurrency } from '@/data/mockData';
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
  AreaChart
} from 'recharts';
import { Link } from 'react-router-dom';

// Calculate KPIs
const activeProjects = mockProjects.filter(p => p.status === 'active').length;
const totalContractValue = mockProjects.reduce((sum, p) => sum + p.budget, 0);
const pendingApprovals = mockApprovals.filter(a => a.status === 'pending').length;
const delayedProjects = mockProjects.filter(p => p.progress < 30 && p.status === 'active').length;

// Tender pipeline data
const tenderPipelineData = [
  { name: 'Tiềm năng', value: mockTenders.filter(t => t.status === 'lead').length, color: '#64748b' },
  { name: 'Chuẩn bị', value: mockTenders.filter(t => t.status === 'preparation').length, color: '#3b82f6' },
  { name: 'Đã nộp', value: mockTenders.filter(t => t.status === 'submitted').length, color: '#f59e0b' },
  { name: 'Thương thảo', value: mockTenders.filter(t => t.status === 'negotiating').length, color: '#8b5cf6' },
  { name: 'Trúng', value: mockTenders.filter(t => t.status === 'won').length, color: '#22c55e' },
  { name: 'Trượt', value: mockTenders.filter(t => t.status === 'lost').length, color: '#ef4444' },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hoạt động kinh doanh và dự án</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Xuất báo cáo
          </Button>
          <Button size="sm" asChild>
            <Link to="/bod/approvals">
              Phê duyệt ({pendingApprovals})
            </Link>
          </Button>
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
          changeLabel="so với tháng trước"
          delay={0}
        />
        <KPICard
          title="Tổng giá trị HĐ"
          value={formatCurrency(totalContractValue)}
          icon={FileText}
          change={8}
          trend="up"
          changeLabel="so với Q trước"
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
          changeLabel="so với năm trước"
          delay={0.3}
        />
      </div>

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
    </div>
  );
}
