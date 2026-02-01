import { useMemo } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/data/mockData";
import { financeProjectName, useFinance, useFinanceProjects } from "@/contexts/finance";

export default function FinanceApprovalInbox() {
  const projects = useFinanceProjects();
  const { state, dispatch } = useFinance();

  const items = useMemo(
    () => state.paymentRequests.filter((pr) => pr.status === "Submitted"),
    [state.paymentRequests]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approval Inbox</h1>
        <p className="text-muted-foreground">
          PR: Draft → Submitted → Approved → Paid → Reconciled (hoặc Rejected)
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending approvals</CardTitle>
          <Badge variant="secondary">{items.length} items</Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PR No</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((pr) => (
                <TableRow key={pr.id}>
                  <TableCell className="font-medium">{pr.prNo}</TableCell>
                  <TableCell>{financeProjectName(projects, pr.projectId)}</TableCell>
                  <TableCell>{pr.vendor}</TableCell>
                  <TableCell className="text-right">{formatCurrency(pr.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">Submitted</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          dispatch({ type: "pr.approve", payload: { id: pr.id } });
                          toast.success(`Approved: ${pr.prNo}`);
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          dispatch({ type: "pr.reject", payload: { id: pr.id } });
                          toast.error(`Rejected: ${pr.prNo}`);
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                    Không có PR nào đang chờ duyệt.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
