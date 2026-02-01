import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Calendar, CheckCircle2, Clock, FileUp, MessageSquare, Search, Send, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { DesignRequest, DesignRequestStatus } from "@/types";
import { useEngineering } from "@/contexts/engineering";

function priorityBadge(p: DesignRequest["priority"]) {
  switch (p) {
    case "urgent":
      return <Badge className="bg-rose-600">Urgent</Badge>;
    case "high":
      return <Badge className="bg-amber-600">High</Badge>;
    case "medium":
      return <Badge variant="secondary">Medium</Badge>;
    case "low":
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="secondary">—</Badge>;
  }
}

function statusBadge(s: DesignRequestStatus) {
  switch (s) {
    case "new":
      return <Badge variant="outline">New</Badge>;
    case "in-progress":
      return <Badge className="bg-blue-600">In progress</Badge>;
    case "review":
      return <Badge className="bg-amber-600">Review</Badge>;
    case "approved":
      return <Badge className="bg-emerald-600">Approved</Badge>;
    case "released":
      return <Badge className="bg-slate-900 text-white">Released</Badge>;
    default:
      return <Badge variant="secondary">—</Badge>;
  }
}

const statusOrder: DesignRequestStatus[] = ["new", "in-progress", "review", "approved", "released"];

function canMove(from: DesignRequestStatus, to: DesignRequestStatus) {
  const a = statusOrder.indexOf(from);
  const b = statusOrder.indexOf(to);
  return Math.abs(a - b) === 1 || a === b;
}

export default function DesignRequestList() {
  const {
    designRequests,
    designMeta,
    updateDesignStatus,
    addDesignAttachmentMock,
    addDesignComment,
    uploadDesignVersionMock,
    submitDesignForApproval,
    approvals,
    approveDesign,
    rejectDesign,
  } = useEngineering();

  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return designRequests;
    return designRequests.filter((x) =>
      [x.code, x.projectName, x.title, x.assignee, x.status, x.priority].some((v) =>
        String(v).toLowerCase().includes(query)
      )
    );
  }, [designRequests, q]);

  const selected = useMemo(() => designRequests.find((x) => x.id === selectedId) ?? null, [designRequests, selectedId]);
  const meta = selected ? designMeta[selected.id] : null;

  const relatedApprovals = useMemo(() => {
    if (!selected) return [];
    return approvals
      .filter((a) => a.type === "design" && a.itemId === selected.id)
      .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));
  }, [approvals, selected]);

  const pendingApproval = relatedApprovals.find((a) => a.status === "pending") ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Design Request List</h1>
          <p className="text-muted-foreground">
            New → In progress → Review → Approved → Released
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => toast.info("Tip: click vào 1 dòng để mở drawer chi tiết")}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Quick tips
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách yêu cầu (from PM)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo Request No, project, assignee..."
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filtered.length} items</Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request No</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((x) => (
                  <TableRow key={x.id} className="cursor-pointer" onClick={() => setSelectedId(x.id)}>
                    <TableCell className="font-mono text-xs">{x.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{x.projectName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{x.title}</div>
                    </TableCell>
                    <TableCell>{priorityBadge(x.priority)}</TableCell>
                    <TableCell className="font-mono text-xs">{x.dueDate}</TableCell>
                    <TableCell>{statusBadge(x.status)}</TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-[560px] sm:w-[680px]">
          {selected && (
            <div className="space-y-5">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between gap-3">
                  <span>{selected.code}</span>
                  {statusBadge(selected.status)}
                </SheetTitle>
              </SheetHeader>

              <div>
                <div className="font-semibold">{selected.title}</div>
                <div className="text-sm text-muted-foreground">{selected.projectName} • Assignee: {selected.assignee}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const idx = statusOrder.indexOf(selected.status);
                    const prev = statusOrder[Math.max(0, idx - 1)];
                    if (!canMove(selected.status, prev)) return toast.error("Không thể back state");
                    updateDesignStatus(selected.id, prev);
                  }}
                  disabled={selected.status === "new"}
                >
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const idx = statusOrder.indexOf(selected.status);
                    const next = statusOrder[Math.min(statusOrder.length - 1, idx + 1)];
                    if (!canMove(selected.status, next)) return toast.error("Không thể next state");
                    updateDesignStatus(selected.id, next);
                  }}
                  disabled={selected.status === "released"}
                >
                  Next
                </Button>

                <Separator orientation="vertical" className="h-6" />

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => uploadDesignVersionMock(selected.id)}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload new version (mock)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => submitDesignForApproval(selected.id)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit for approval
                </Button>
              </div>

              <Tabs defaultValue="brief">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="brief">Brief</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="versions">Versions</TabsTrigger>
                  <TabsTrigger value="approvals">Approvals</TabsTrigger>
                </TabsList>

                <TabsContent value="brief" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Priority</span>
                          <span className="ml-auto">{priorityBadge(selected.priority)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Due</span>
                          <span className="ml-auto font-mono text-xs">{selected.dueDate}</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="text-sm leading-relaxed text-muted-foreground">{meta?.brief}</div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="text-sm font-semibold">State</div>
                        <div className="grid grid-cols-5 gap-2">
                          {statusOrder.map((s) => (
                            <button
                              key={s}
                              className={`rounded-md border px-2 py-2 text-xs text-left transition-colors ${
                                s === selected.status
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => {
                                if (!canMove(selected.status, s)) {
                                  toast.error("Chỉ cho phép chuyển state liền kề (demo)");
                                  return;
                                }
                                updateDesignStatus(selected.id, s);
                              }}
                            >
                              <div className="font-medium">{s}</div>
                              <div className="text-[10px] opacity-80">click to set</div>
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Created: <span className="font-mono">{selected.createdAt}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="attachments" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Upload thật sẽ lên storage — ở đây chỉ mock state.</div>
                    <Button size="sm" onClick={() => addDesignAttachmentMock(selected.id)}>
                      <FileUp className="h-4 w-4 mr-2" /> Upload (mock)
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>File</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Uploaded</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(meta?.attachments ?? []).map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="font-medium">{a.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{a.kind.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{a.at}</TableCell>
                          </TableRow>
                        ))}
                        {(meta?.attachments?.length ?? 0) === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                              Chưa có attachment
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="comments" className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Viết comment..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addDesignComment(selected.id, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = "";
                        }
                      }}
                    />
                    <Button
                      onClick={() => toast.info("Tip: Enter để add comment nhanh")}
                      variant="outline"
                    >
                      Help
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(meta?.comments ?? []).slice().reverse().map((c) => (
                      <Card key={c.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{c.author}</span>
                            <span className="font-mono">{c.at}</span>
                          </div>
                          <div className="mt-1 text-sm">{c.content}</div>
                        </CardContent>
                      </Card>
                    ))}
                    {(meta?.comments?.length ?? 0) === 0 && (
                      <div className="text-sm text-muted-foreground">Chưa có comment</div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="versions" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Versioning (mock) — liên kết tới Drawing Repository sau.</div>
                    <Button size="sm" variant="secondary" onClick={() => uploadDesignVersionMock(selected.id)}>
                      <FileUp className="h-4 w-4 mr-2" /> Upload new version
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Version</TableHead>
                          <TableHead>Note</TableHead>
                          <TableHead>By</TableHead>
                          <TableHead>At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(meta?.versions ?? []).slice().reverse().map((v) => (
                          <TableRow key={v.id}>
                            <TableCell>
                              <Badge>v{v.version}</Badge>
                            </TableCell>
                            <TableCell>{v.note}</TableCell>
                            <TableCell>{v.by}</TableCell>
                            <TableCell className="font-mono text-xs">{v.at}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="approvals" className="space-y-3">
                  <Card>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Approval timeline</div>
                          <div className="text-sm text-muted-foreground">Pending approvals được đẩy sang Approval Inbox</div>
                        </div>
                        {pendingApproval ? (
                          <Badge className="bg-amber-600">Pending</Badge>
                        ) : (
                          <Badge variant="secondary">None</Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => submitDesignForApproval(selected.id)}>
                          <Send className="h-4 w-4 mr-2" /> Submit
                        </Button>
                        {pendingApproval && (
                          <>
                            <Button size="sm" variant="secondary" onClick={() => approveDesign(pendingApproval.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-2" /> Approve (mock)
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectDesign(pendingApproval.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        {relatedApprovals.map((a) => (
                          <div key={a.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <div className="text-sm font-medium">{a.itemCode}</div>
                              <div className="text-xs text-muted-foreground">{a.requestedAt} • by {a.requestedBy}</div>
                            </div>
                            <Badge
                              className={
                                a.status === "approved"
                                  ? "bg-emerald-600"
                                  : a.status === "rejected"
                                  ? "bg-rose-600"
                                  : "bg-amber-600"
                              }
                            >
                              {a.status}
                            </Badge>
                          </div>
                        ))}

                        {relatedApprovals.length === 0 && (
                          <div className="text-sm text-muted-foreground">Chưa có approval nào</div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
