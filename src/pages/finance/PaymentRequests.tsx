import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/data/mockData";
import { financeProjectName, PRStatus, useFinance, useFinanceProjects } from "@/contexts/finance";
import { MoreHorizontal, Paperclip, Plus, Send } from "lucide-react";

function statusBadge(status: PRStatus) {
  const variant: "default" | "secondary" | "destructive" | "outline" =
    status === "Approved" || status === "Reconciled"
      ? "default"
      : status === "Rejected"
        ? "destructive"
        : status === "Draft"
          ? "outline"
          : "secondary";
  return <Badge variant={variant}>{status}</Badge>;
}

function dateInRange(dueDate: string, start?: string, end?: string) {
  if (!start && !end) return true;
  const d = dueDate;
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

export default function FinancePaymentRequests() {
  const projects = useFinanceProjects();
  const { state, dispatch } = useFinance();

  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [attachTargetId, setAttachTargetId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return state.paymentRequests.filter((pr) => {
      const okProject = projectFilter === "all" ? true : pr.projectId === projectFilter;
      const okStatus = statusFilter === "all" ? true : pr.status === statusFilter;
      const okDate = dateInRange(pr.dueDate, startDate || undefined, endDate || undefined);
      return okProject && okStatus && okDate;
    });
  }, [endDate, projectFilter, startDate, state.paymentRequests, statusFilter]);

  const canSubmitAny = filtered.some((pr) => pr.status === "Draft");

  const submitFirstDraft = () => {
    const first = filtered.find((pr) => pr.status === "Draft");
    if (!first) return;
    dispatch({ type: "pr.submit", payload: { id: first.id } });
    toast.success(`Đã submit ${first.prNo} vào luồng duyệt`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payment Request List</h1>
          <p className="text-muted-foreground">Đề nghị thanh toán (mock UI, có luồng trạng thái).</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create PR
              </Button>
            </DialogTrigger>
            <CreatePRDialog
              projects={projects}
              onCreate={(payload) => {
                dispatch({ type: "pr.create", payload });
                toast.success("Tạo PR (Draft) thành công");
                setCreateOpen(false);
              }}
            />
          </Dialog>
          <Button variant="secondary" disabled={!canSubmitAny} onClick={submitFirstDraft}>
            <Send className="h-4 w-4 mr-2" />
            Submit approval
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {(["Draft", "Submitted", "Approved", "Paid", "Reconciled", "Rejected"] as PRStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Date range (Due)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quick</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setProjectFilter("all");
                  setStatusFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Reset
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter("Submitted");
                }}
              >
                Needs approval
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Requests</CardTitle>
          <div className="text-sm text-muted-foreground">{filtered.length} items</div>
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
                <TableHead>Due date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((pr) => {
                const hasInvoice = pr.attachments.some((a) => a.kind === "invoice");
                return (
                  <TableRow key={pr.id}>
                    <TableCell className="font-medium">{pr.prNo}</TableCell>
                    <TableCell>{financeProjectName(projects, pr.projectId)}</TableCell>
                    <TableCell>{pr.vendor}</TableCell>
                    <TableCell className="text-right">{formatCurrency(pr.amount)}</TableCell>
                    <TableCell className="space-x-2">
                      {statusBadge(pr.status)}
                      {hasInvoice && <Badge variant="secondary">Invoice</Badge>}
                    </TableCell>
                    <TableCell>{format(new Date(pr.dueDate + "T00:00:00"), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem
                            onClick={() => {
                              setAttachTargetId(pr.id);
                            }}
                          >
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach invoice (mock)
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={pr.status !== "Draft"}
                            onClick={() => {
                              dispatch({ type: "pr.submit", payload: { id: pr.id } });
                              toast.success(`Đã submit ${pr.prNo}`);
                            }}
                          >
                            Submit approval
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={pr.status !== "Approved"}
                            onClick={() => {
                              dispatch({ type: "pr.markPaid", payload: { id: pr.id } });
                              toast.success(`Đã mark Paid: ${pr.prNo}`);
                            }}
                          >
                            Mark Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={pr.status !== "Paid"}
                            onClick={() => {
                              dispatch({ type: "pr.reconcile", payload: { id: pr.id } });
                              toast.success(`Đã reconcile: ${pr.prNo}`);
                            }}
                          >
                            Reconcile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Không có dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!attachTargetId} onOpenChange={(o) => !o && setAttachTargetId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Attach invoice (mock upload)</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Chọn file (bất kỳ)</Label>
              <Input
                type="file"
                onChange={() => {
                  if (!attachTargetId) return;
                  dispatch({ type: "pr.attachInvoice", payload: { id: attachTargetId } });
                  toast.success("Đã attach invoice (mock file)");
                }}
              />
              <p className="text-sm text-muted-foreground">
                File upload sẽ luôn gắn <b>invoice_mock.pdf</b> để demo UI.
              </p>
              <div>
                <Button
                  onClick={() => {
                    if (!attachTargetId) return;
                    dispatch({ type: "pr.attachInvoice", payload: { id: attachTargetId } });
                    toast.success("Đã attach invoice (mock file)");
                  }}
                >
                  Attach now
                </Button>
              </div>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="text-sm font-semibold mb-2">Preview</div>
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border bg-white">
                <img src="/mock-invoice.svg" alt="mock invoice" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreatePRDialog({
  projects,
  onCreate,
}: {
  projects: { id: string; name: string }[];
  onCreate: (payload: { projectId: string; vendor: string; amount: number; dueDate: string }) => void;
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [vendor, setVendor] = useState("Công ty VLXD An Phát");
  const [amount, setAmount] = useState<number>(50_000_000);
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().slice(0, 10));

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create Payment Request</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Project</Label>
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn dự án" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Vendor</Label>
          <Input value={vendor} onChange={(e) => setVendor(e.target.value)} placeholder="Nhà cung cấp" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value || 0))}
              placeholder="Số tiền"
            />
            <div className="text-xs text-muted-foreground">Preview: {formatCurrency(amount)}</div>
          </div>
          <div className="space-y-2">
            <Label>Due date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => {
              if (!projectId) {
                toast.error("Vui lòng chọn project");
                return;
              }
              onCreate({ projectId, vendor, amount, dueDate });
            }}
          >
            Create (Draft)
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
