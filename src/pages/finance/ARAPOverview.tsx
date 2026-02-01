import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/data/mockData";
import { financeProjectName, useFinance, useFinanceProjects } from "@/contexts/finance";
import { ArrowRight, CreditCard, HandCoins, Receipt, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function FinanceARAPOverview() {
  const projects = useFinanceProjects();
  const { state } = useFinance();

  const summary = useMemo(() => {
    const totalAP = state.paymentRequests.reduce((sum, pr) => sum + pr.amount, 0);
    const submitted = state.paymentRequests.filter((pr) => pr.status === "Submitted");
    const approved = state.paymentRequests.filter((pr) => pr.status === "Approved");
    const paid = state.paymentRequests.filter((pr) => pr.status === "Paid" || pr.status === "Reconciled");
    return {
      totalAP,
      submittedCount: submitted.length,
      approvedCount: approved.length,
      paidCount: paid.length,
    };
  }, [state.paymentRequests]);

  const recent = useMemo(() => state.paymentRequests.slice(0, 5), [state.paymentRequests]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AR/AP Overview</h1>
          <p className="text-muted-foreground">Tổng quan nhanh về AR/AP (mock dashboard).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/finance/payment-requests">
              Mở Payment Requests <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button asChild>
            <Link to="/finance/approvals">Approval Inbox</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI title="Total AP" value={formatCurrency(summary.totalAP)} icon={Wallet} />
        <KPI title="Submitted" value={`${summary.submittedCount}`} icon={Receipt} badge="Needs approval" />
        <KPI title="Approved" value={`${summary.approvedCount}`} icon={CreditCard} badge="Ready to pay" />
        <KPI title="Paid/Reconciled" value={`${summary.paidCount}`} icon={HandCoins} badge="Closed" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent payment requests</CardTitle>
          <Button asChild variant="ghost">
            <Link to="/finance/payment-requests">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR No</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell className="font-medium">{pr.prNo}</TableCell>
                  <TableCell>{financeProjectName(projects, pr.projectId)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(pr.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={pr.status === "Rejected" ? "destructive" : pr.status === "Draft" ? "outline" : "secondary"}>
                      {pr.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function KPI({
  title,
  value,
  icon: Icon,
  badge,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  badge?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-bold">{value}</div>
        {badge && <Badge variant="secondary">{badge}</Badge>}
      </CardContent>
    </Card>
  );
}
