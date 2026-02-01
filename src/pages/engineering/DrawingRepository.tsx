import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeftRight, CheckCircle2, FileUp, Folder, FolderOpen, GitCompare, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import type { DrawingFile, DrawingFolder, DrawingStatus } from "@/contexts/engineering";
import { useEngineering } from "@/contexts/engineering";

function drawingStatusBadge(s: DrawingStatus) {
  switch (s) {
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "review":
      return <Badge className="bg-amber-600">Review</Badge>;
    case "approved":
      return <Badge className="bg-emerald-600">Approved</Badge>;
    case "issued":
      return <Badge className="bg-slate-900 text-white">Issued</Badge>;
    default:
      return <Badge variant="secondary">—</Badge>;
  }
}

function folderChildren(all: DrawingFolder[], parentId?: string) {
  return all.filter((f) => (parentId ? f.parentId === parentId : !f.parentId));
}

function FolderTree({
  folders,
  activeId,
  onSelect,
  parentId,
  level = 0,
}: {
  folders: DrawingFolder[];
  activeId: string;
  onSelect: (id: string) => void;
  parentId?: string;
  level?: number;
}) {
  const kids = folderChildren(folders, parentId);
  if (kids.length === 0) return null;

  return (
    <div className="space-y-1">
      {kids.map((f) => {
        const isActive = f.id === activeId;
        const hasKids = folderChildren(folders, f.id).length > 0;
        return (
          <div key={f.id}>
            <button
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
              style={{ paddingLeft: 8 + level * 14 }}
              onClick={() => onSelect(f.id)}
            >
              {hasKids ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
              <span className="truncate">{f.name}</span>
            </button>

            {hasKids && (
              <div className="mt-1">
                <FolderTree
                  folders={folders}
                  activeId={activeId}
                  onSelect={onSelect}
                  parentId={f.id}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function DrawingRepository() {
  const {
    folders,
    drawings,
    activeFolderId,
    setActiveFolder,
    uploadNewDrawingVersionMock,
    markDrawingApproved,
    markDrawingIssued,
  } = useEngineering();

  const [q, setQ] = useState("");
  const [compareOpen, setCompareOpen] = useState<string | null>(null);

  const files = useMemo(() => {
    const query = q.trim().toLowerCase();
    return drawings
      .filter((f) => f.folderId === activeFolderId)
      .filter((f) =>
        query
          ? [f.name, f.discipline, f.reviewer, f.status, `v${f.version}`].some((x) =>
              String(x).toLowerCase().includes(query)
            )
          : true
      );
  }, [drawings, activeFolderId, q]);

  const folderLabel = useMemo(() => folders.find((f) => f.id === activeFolderId)?.name ?? "—", [folders, activeFolderId]);
  const toCompare = useMemo(() => drawings.find((f) => f.id === compareOpen) ?? null, [drawings, compareOpen]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Drawing Repository</h1>
        <p className="text-muted-foreground">Drawing: Draft → Review → Approved → Issued</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Folder tree</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[520px] pr-2">
              <FolderTree folders={folders} activeId={activeFolderId} onSelect={setActiveFolder} />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">{folderLabel}</CardTitle>
              <p className="text-sm text-muted-foreground">File list + versioning actions</p>
            </div>

            <div className="w-[320px] max-w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search file..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Actions: <span className="font-medium">Upload new version</span> (mock), <span className="font-medium">Compare</span> (mock), <span className="font-medium">Mark approved</span>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Last updated</TableHead>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell>
                        <Badge>v{f.version}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{f.lastUpdated}</TableCell>
                      <TableCell>{f.reviewer}</TableCell>
                      <TableCell>{drawingStatusBadge(f.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" onClick={() => uploadNewDrawingVersionMock(f.id)}>
                            <FileUp className="h-4 w-4 mr-2" /> Upload
                          </Button>

                          <Dialog open={compareOpen === f.id} onOpenChange={(o) => setCompareOpen(o ? f.id : null)}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => setCompareOpen(f.id)}>
                                <GitCompare className="h-4 w-4 mr-2" /> Compare
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[720px]">
                              <DialogHeader>
                                <DialogTitle>Compare (mock)</DialogTitle>
                                <DialogDescription>
                                  Không render CAD/PDF thật — chỉ show lịch sử version.
                                </DialogDescription>
                              </DialogHeader>

                              {toCompare && (
                                <div className="space-y-3">
                                  <div className="font-medium">{toCompare.name}</div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border p-3">
                                      <div className="text-sm font-semibold flex items-center gap-2">
                                        <ArrowLeftRight className="h-4 w-4" /> Previous
                                      </div>
                                      <Separator className="my-2" />
                                      <div className="text-sm text-muted-foreground">
                                        {toCompare.history.length >= 2 ? (
                                          <>
                                            <div>v{toCompare.history[toCompare.history.length - 2].version}</div>
                                            <div className="text-xs font-mono">{toCompare.history[toCompare.history.length - 2].updatedAt}</div>
                                          </>
                                        ) : (
                                          "—"
                                        )}
                                      </div>
                                    </div>
                                    <div className="rounded-lg border p-3">
                                      <div className="text-sm font-semibold flex items-center gap-2">
                                        <ArrowLeftRight className="h-4 w-4" /> Current
                                      </div>
                                      <Separator className="my-2" />
                                      <div className="text-sm text-muted-foreground">
                                        <div>v{toCompare.version}</div>
                                        <div className="text-xs font-mono">{toCompare.lastUpdated}</div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Version</TableHead>
                                          <TableHead>Updated</TableHead>
                                          <TableHead>By</TableHead>
                                          <TableHead>Note</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {toCompare.history
                                          .slice()
                                          .reverse()
                                          .map((h) => (
                                            <TableRow key={`${toCompare.id}-h-${h.version}`}>
                                              <TableCell>
                                                <Badge>v{h.version}</Badge>
                                              </TableCell>
                                              <TableCell className="font-mono text-xs">{h.updatedAt}</TableCell>
                                              <TableCell>{h.updatedBy}</TableCell>
                                              <TableCell className="text-muted-foreground">{h.note ?? "—"}</TableCell>
                                            </TableRow>
                                          ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              )}

                              <DialogFooter>
                                <Button variant="outline" onClick={() => toast.info("Compare thật: diff PDF / CAD overlay")}>Note</Button>
                                <Button onClick={() => setCompareOpen(null)}>Close</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            onClick={() => markDrawingApproved(f.id)}
                            disabled={f.status === "approved" || f.status === "issued"}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" /> Approved
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markDrawingIssued(f.id)}
                            disabled={f.status !== "approved"}
                          >
                            Issue
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {files.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        Chưa có file trong folder này
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
