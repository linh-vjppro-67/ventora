import { useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Folder,
  GitCompare,
  Search,
  Upload,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { mockDmsFiles, mockDmsFolders, statusLabel, type DmsFile, type DmsFolder, type DmsFileStatus } from '@/data/mockDms';

type Props = {
  title?: string;
  description?: string;
  compact?: boolean;
};

function badgeForStatus(status: DmsFileStatus) {
  if (status === 'approved') return <Badge className="bg-emerald-600 hover:bg-emerald-600">Approved</Badge>;
  if (status === 'review') return <Badge variant="secondary">Review</Badge>;
  if (status === 'issued') return <Badge variant="outline">Issued</Badge>;
  return <Badge variant="outline">Draft</Badge>;
}

function buildTree(folders: DmsFolder[]) {
  const byParent: Record<string, DmsFolder[]> = {};
  for (const f of folders) {
    const p = f.parentId || 'none';
    byParent[p] = byParent[p] || [];
    byParent[p].push(f);
  }
  return byParent;
}

function indent(px: number) {
  return { paddingLeft: `${px}px` };
}

export default function DocumentLibrary({
  title = 'Tài liệu (DMS)',
  description = 'Folder tree + file list (versioning) • UI/UX mock, actions có thể click',
  compact = false,
}: Props) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadVersionRef = useRef<HTMLInputElement | null>(null);

  const [selectedFolderId, setSelectedFolderId] = useState<string>('root');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DmsFile | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareTarget, setCompareTarget] = useState<DmsFile | null>(null);

  const [files, setFiles] = useState<DmsFile[]>(mockDmsFiles);

  const folders = useMemo(() => mockDmsFolders, []);
  const folderTree = useMemo(() => buildTree(folders), [folders]);

  const folderMap = useMemo(() => {
    const m = new Map<string, DmsFolder>();
    folders.forEach((f) => m.set(f.id, f));
    return m;
  }, [folders]);

  const folderPathLabel = useMemo(() => {
    let cur = folderMap.get(selectedFolderId);
    const parts: string[] = [];
    while (cur) {
      parts.unshift(cur.name);
      cur = cur.parentId ? folderMap.get(cur.parentId) : undefined;
    }
    return parts.join(' / ');
  }, [folderMap, selectedFolderId]);

  const visibleFiles = useMemo(() => {
    const s = search.trim().toLowerCase();
    return files.filter((f) => {
      const inFolder = selectedFolderId === 'root' ? true : f.folderId === selectedFolderId;
      if (!inFolder) return false;
      if (!s) return true;
      return (
        f.name.toLowerCase().includes(s) ||
        f.id.toLowerCase().includes(s) ||
        f.ext.toLowerCase().includes(s) ||
        (f.tags || []).join(' ').toLowerCase().includes(s)
      );
    });
  }, [files, selectedFolderId, search]);

  const children = folderTree[selectedFolderId] || [];

  function pickUploadNewFile() {
    fileInputRef.current?.click();
  }

  function onUploadNewFile(fileName?: string) {
    // UI mock: không dùng file thật, chỉ lấy tên và gán "hard" preview.
    const name = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Tài liệu mới';
    const now = new Date().toISOString().slice(0, 10);
    const created: DmsFile = {
      id: `F-${String(Math.floor(100 + Math.random() * 900))}`,
      folderId: selectedFolderId === 'root' ? 'misc' : selectedFolderId,
      name,
      ext: 'PDF',
      version: 'v1',
      status: 'draft',
      lastUpdated: now,
      reviewer: '—',
      tags: ['uploaded'],
      description: 'Mock upload: hệ thống nhận file nhưng lưu bản xem trước hard-code.',
      versions: [{ version: 'v1', status: 'draft', updatedAt: now, reviewer: '—', note: 'Mock upload' }],
    };
    setFiles((prev) => [created, ...prev]);
    toast({ title: 'Upload', description: `Mock: đã thêm ${created.name} (${created.ext})` });
  }

  function pickUploadNewVersion() {
    uploadVersionRef.current?.click();
  }

  function onUploadNewVersion(file: DmsFile, uploadedName?: string) {
    const nextV = `v${Math.max(1, ...file.versions.map((x) => parseInt(x.version.replace('v', ''), 10) || 1)) + 1}`;
    const now = new Date().toISOString().slice(0, 10);
    const note = uploadedName ? `Mock upload: ${uploadedName}` : 'Mock upload';
    const updated: DmsFile = {
      ...file,
      version: nextV,
      status: 'review',
      lastUpdated: now,
      reviewer: 'Reviewer - (mock)',
      versions: [{ version: nextV, status: 'review', updatedAt: now, reviewer: 'Reviewer - (mock)', note }, ...file.versions],
    };
    setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
    if (selected?.id === file.id) setSelected(updated);
    toast({ title: 'Upload new version', description: `Mock: ${file.id} -> ${nextV}` });
  }

  function markApproved(file: DmsFile) {
    const now = new Date().toISOString().slice(0, 10);
    const updated: DmsFile = {
      ...file,
      status: 'approved',
      lastUpdated: now,
      reviewer: 'Approver - (mock)',
      versions: [{ version: file.version, status: 'approved', updatedAt: now, reviewer: 'Approver - (mock)', note: 'Marked approved' }, ...file.versions],
    };
    setFiles((prev) => prev.map((f) => (f.id === file.id ? updated : f)));
    if (selected?.id === file.id) setSelected(updated);
    toast({ title: 'Approved', description: `Mock: ${file.id} đã Approved` });
  }

  function openCompare(file: DmsFile) {
    setCompareTarget(file);
    setCompareOpen(true);
  }

  const FolderTree = (
    <div className="space-y-1">
      {(folderTree['none'] || []).map((root) => (
        <FolderNode
          key={root.id}
          folder={root}
          level={0}
          selectedId={selectedFolderId}
          onSelect={setSelectedFolderId}
          tree={folderTree}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={pickUploadNewFile}>
              <Upload className="h-4 w-4" /> Upload
            </Button>
            <Button className="gap-2" onClick={() => toast({ title: 'Create folder', description: 'Mock: tạo folder' })}>
              <Folder className="h-4 w-4" /> New folder
            </Button>
          </div>
        </div>
      )}

      <div className={compact ? 'grid gap-4 md:grid-cols-[260px_1fr]' : 'grid gap-4 lg:grid-cols-[320px_1fr]'}>
        {/* Left: folder tree */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Folder tree</CardTitle>
            <CardDescription className="text-xs">Chọn folder để lọc file</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm mb-3">
              <Folder className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground truncate">{folderPathLabel}</span>
            </div>
            {FolderTree}

            <Separator className="my-4" />
            <div className="text-xs text-muted-foreground">Tip: click folder để xem file trong folder đó (mock)</div>
          </CardContent>
        </Card>

        {/* Right: file list */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">File list</CardTitle>
                <CardDescription className="text-xs">Versioning + actions: view, upload new version, compare, approve</CardDescription>
              </div>
              <div className="relative w-full sm:w-[360px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, mã, tag..." className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {children.length > 0 && selectedFolderId !== 'root' && (
              <div className="mb-3 flex flex-wrap gap-2">
                {children.map((c) => (
                  <Button key={c.id} size="sm" variant="secondary" className="gap-2" onClick={() => setSelectedFolderId(c.id)}>
                    <Folder className="h-4 w-4" /> {c.name}
                  </Button>
                ))}
              </div>
            )}

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead className="w-[90px]">Ver</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[140px]">Updated</TableHead>
                    <TableHead className="w-[160px]">Reviewer</TableHead>
                    <TableHead className="w-[220px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleFiles.map((f) => (
                    <TableRow key={f.id} className="cursor-pointer" onClick={() => setSelected(f)}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-md border px-2 py-1 text-[11px] font-mono text-muted-foreground">{f.ext}</div>
                          <div className="min-w-0">
                            <div className="font-medium line-clamp-1">{f.name}</div>
                            <div className="text-xs text-muted-foreground">{f.id}{f.tags?.length ? ` • ${f.tags.join(', ')}` : ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{f.version}</Badge>
                      </TableCell>
                      <TableCell>{badgeForStatus(f.status)}</TableCell>
                      <TableCell className="text-sm">{f.lastUpdated}</TableCell>
                      <TableCell className="text-sm">{f.reviewer}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => setSelected(f)}>
                            <Eye className="h-4 w-4" /> View
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => openCompare(f)}>
                            <GitCompare className="h-4 w-4" /> Compare
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => toast({ title: 'Download', description: `Mock: download ${f.name}` })}>
                            <Download className="h-4 w-4" /> Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {visibleFiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center">
                        <FileText className="h-8 w-8 mx-auto text-muted-foreground/60" />
                        <div className="font-semibold mt-2">Không có file</div>
                        <div className="text-sm text-muted-foreground mt-1">Thử đổi folder hoặc từ khóa tìm kiếm.</div>
                        <Button variant="outline" className="mt-4 gap-2" onClick={pickUploadNewFile}>
                          <Upload className="h-4 w-4" /> Upload mock
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* hidden input: upload new file */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          onUploadNewFile(f?.name);
          e.target.value = '';
        }}
      />

      {/* Drawer: file detail */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-[520px] sm:w-[600px] p-0">
          {selected && (
            <div className="flex h-full flex-col">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground font-mono">{selected.id}</div>
                      <div className="text-base font-semibold leading-snug line-clamp-2">{selected.name}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="font-mono">{selected.version}</Badge>
                      {badgeForStatus(selected.status)}
                    </div>
                  </SheetTitle>
                  <SheetDescription className="text-xs">{selected.description || '—'}</SheetDescription>
                </SheetHeader>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => toast({ title: 'Open', description: 'Mock: mở xem trước file' })}>
                    <Eye className="h-4 w-4" /> Open preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      pickUploadNewVersion();
                    }}
                  >
                    <Upload className="h-4 w-4" /> Upload new version
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => openCompare(selected)}>
                    <GitCompare className="h-4 w-4" /> Compare
                  </Button>
                  <Button size="sm" className="gap-2" onClick={() => markApproved(selected)}>
                    <CheckCircle2 className="h-4 w-4" /> Mark approved
                  </Button>
                </div>

                <input
                  ref={uploadVersionRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    onUploadNewVersion(selected, f?.name);
                    e.target.value = '';
                  }}
                />
              </div>

              <Separator />
              <div className="p-6 pt-4">
                <Tabs defaultValue="preview">
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                    <TabsTrigger value="approvals">Approvals</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    <div className="rounded-xl border overflow-hidden">
                      <div className="px-4 py-3 border-b bg-muted/40 text-sm font-medium">Mock viewer</div>
                      <div className="p-4">
                        {selected.ext === 'JPG' ? (
                          <img src="/mock-site-photo.svg" alt="mock" className="w-full rounded-lg border" />
                        ) : selected.ext === 'DWG' ? (
                          <img src="/mock-drawing.svg" alt="mock" className="w-full rounded-lg border" />
                        ) : selected.ext === 'XLSX' ? (
                          <img src="/mock-spreadsheet.svg" alt="mock" className="w-full rounded-lg border" />
                        ) : (
                          <img src="/mock-document.svg" alt="mock" className="w-full rounded-lg border" />
                        )}
                        <div className="text-xs text-muted-foreground mt-3">* Upload thật vẫn được chọn file, nhưng preview luôn là hình hard-code (theo yêu cầu).</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="versions" className="mt-4">
                    <div className="rounded-xl border overflow-hidden">
                      <div className="px-4 py-3 border-b bg-muted/40 text-sm font-medium">Version history</div>
                      <div className="p-4 space-y-2">
                        {selected.versions.map((v) => (
                          <div key={`${selected.id}-${v.version}-${v.updatedAt}`} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">{v.version}</Badge>
                                <span className="text-sm font-medium">{statusLabel(v.status)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">{v.updatedAt}</div>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">Reviewer: {v.reviewer}</div>
                            {v.note && <div className="text-sm mt-2">Note: {v.note}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="mt-4">
                    <div className="rounded-xl border p-4">
                      <div className="text-sm font-semibold">Comments (mock)</div>
                      <div className="text-sm text-muted-foreground mt-1">Chưa có luồng comment thật. Bạn có thể click để mô phỏng.</div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Add comment', description: 'Mock: đã thêm comment' })}>Add comment</Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Mention', description: 'Mock: @PM @QAQC' })}>@Mention</Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="approvals" className="mt-4">
                    <div className="rounded-xl border p-4">
                      <div className="text-sm font-semibold">Approvals (mock)</div>
                      <div className="text-sm text-muted-foreground mt-1">Luồng phê duyệt: Draft → Review → Approved → Issued</div>
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => toast({ title: 'Submit approval', description: 'Mock: gửi phê duyệt' })}>Submit</Button>
                        <Button size="sm" variant="outline" onClick={() => toast({ title: 'Reject', description: 'Mock: từ chối' })}>Reject</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog: compare */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare versions (mock)</DialogTitle>
            <DialogDescription>
              {compareTarget ? `${compareTarget.name} • ${compareTarget.id}` : '—'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border p-3 text-sm">
              <div className="font-medium">Kịch bản so sánh</div>
              <div className="text-muted-foreground mt-1">
                Chọn 2 version và hiển thị diff (mock). Hiện tại hiển thị 2 ảnh hard-code.
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border overflow-hidden">
                <div className="px-4 py-2 border-b bg-muted/40 text-sm font-medium">Old</div>
                <div className="p-3">
                  <img src="/mock-document.svg" alt="old" className="w-full rounded-lg border" />
                </div>
              </div>
              <div className="rounded-xl border overflow-hidden">
                <div className="px-4 py-2 border-b bg-muted/40 text-sm font-medium">New</div>
                <div className="p-3">
                  <img src="/mock-document.svg" alt="new" className="w-full rounded-lg border" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareOpen(false)}>Close</Button>
            <Button onClick={() => toast({ title: 'Generate diff', description: 'Mock: tạo diff' })}>Generate diff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FolderNode({
  folder,
  level,
  selectedId,
  onSelect,
  tree,
}: {
  folder: DmsFolder;
  level: number;
  selectedId: string;
  onSelect: (id: string) => void;
  tree: Record<string, DmsFolder[]>;
}) {
  const [open, setOpen] = useState(true);
  const children = tree[folder.id] || [];
  const isSelected = selectedId === folder.id;

  return (
    <div>
      <button
        type="button"
        className={
          'w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm transition ' +
          (isSelected ? 'bg-secondary' : 'hover:bg-muted/60')
        }
        style={indent(level * 14)}
        onClick={() => onSelect(folder.id)}
      >
        {children.length > 0 ? (
          <span
            className={
              'h-5 w-5 inline-flex items-center justify-center rounded-md hover:bg-muted/60 ' +
              (open ? 'rotate-90' : '')
            }
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </span>
        ) : (
          <span className="h-5 w-5" />
        )}
        <Folder className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">{folder.name}</span>
      </button>

      {open && children.length > 0 && (
        <div className="mt-0.5">
          {children.map((c) => (
            <FolderNode
              key={c.id}
              folder={c}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              tree={tree}
            />
          ))}
        </div>
      )}
    </div>
  );
}
