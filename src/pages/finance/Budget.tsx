import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/data/mockData";
import { financeProjectName, useFinanceBudgets, useFinanceProjects } from "@/contexts/finance";
import { ChevronRight } from "lucide-react";

function pct(n: number) {
  return Math.round(n * 100);
}

export default function FinanceBudget() {
  const projects = useFinanceProjects();
  const budgets = useFinanceBudgets();
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);

  const openBudget = useMemo(() => budgets.find((b) => b.projectId === openProjectId) ?? null, [budgets, openProjectId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Budget vs Actual Dashboard</h1>
        <p className="text-muted-foreground">Tổng quan ngân sách theo dự án + drilldown theo hạng mục chi phí.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {budgets.map((b) => {
          const remaining = b.budget - b.actual;
          const burn = b.budget > 0 ? b.actual / b.budget : 0;
          const committedPct = b.budget > 0 ? b.committed / b.budget : 0;
          return (
            <Card key={b.projectId} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{financeProjectName(projects, b.projectId)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Metric label="Budget" value={formatCurrency(b.budget)} />
                  <Metric label="Committed" value={formatCurrency(b.committed)} />
                  <Metric label="Actual" value={formatCurrency(b.actual)} />
                  <Metric label="Remaining" value={formatCurrency(remaining)} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Committed: {pct(committedPct)}%</Badge>
                  <Badge variant={burn > 0.85 ? "destructive" : "secondary"}>Burn: {pct(burn)}%</Badge>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setOpenProjectId(b.projectId)}
                >
                  Drilldown cost items
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!openProjectId} onOpenChange={(o) => !o && setOpenProjectId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Cost items — {openBudget ? financeProjectName(projects, openBudget.projectId) : ""}</DialogTitle>
          </DialogHeader>

          {openBudget && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <MetricCard title="Budget" value={formatCurrency(openBudget.budget)} />
                <MetricCard title="Committed" value={formatCurrency(openBudget.committed)} />
                <MetricCard title="Actual" value={formatCurrency(openBudget.actual)} />
                <MetricCard title="Remaining" value={formatCurrency(openBudget.budget - openBudget.actual)} />
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cost items table</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Budget</TableHead>
                        <TableHead className="text-right">Committed</TableHead>
                        <TableHead className="text-right">Actual</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {openBudget.costItems.map((c) => (
                        <TableRow key={c.code}>
                          <TableCell className="font-mono text-xs">{c.code}</TableCell>
                          <TableCell>{c.name}</TableCell>
                          <TableCell className="text-right">{formatCurrency(c.budget)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(c.committed)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(c.actual)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(c.budget - c.actual)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-bold">{value}</CardContent>
    </Card>
  );
}
