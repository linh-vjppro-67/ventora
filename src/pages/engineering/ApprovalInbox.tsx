import { useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useEngineering } from "@/contexts/engineering";

export default function EngineeringApprovalInbox() {
  const { approvals, approveDesign, rejectDesign, designRequests } = useEngineering();

  const items = useMemo(() => approvals.filter((a) => a.type === "design" && a.status === "pending"), [approvals]);

  const drById = useMemo(() => {
    const m = new Map(designRequests.map((d) => [d.id, d] as const));
    return m;
  }, [designRequests]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approval Inbox</h1>
        <p className="text-muted-foreground">Pending approvals cho Design Requests</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pending approvals</CardTitle>
          <Badge variant="secondary">{items.length} items</Badge>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request No</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => {
                  const dr = drById.get(a.itemId);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">{a.itemCode}</TableCell>
                      <TableCell>
                        <div className="font-medium">{a.itemName}</div>
                        {dr && (
                          <div className="text-xs text-muted-foreground">{dr.projectName} • current: {dr.status}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{a.requestedBy}</div>
                        <div className="text-xs font-mono text-muted-foreground">{a.requestedAt}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-amber-600">Pending</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              approveDesign(a.id);
                              toast.success(`Approved: ${a.itemCode}`);
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              rejectDesign(a.id);
                              toast.error(`Rejected: ${a.itemCode}`);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      Không có item nào đang chờ duyệt.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
