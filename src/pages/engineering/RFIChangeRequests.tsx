import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRightLeft, MessageSquareWarning, Plus, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type RFI = {
  id: string;
  code: string;
  project: string;
  subject: string;
  type: "RFI" | "Change";
  status: "Open" | "Answered" | "Closed";
  due: string;
};

const seed: RFI[] = [
  { id: "rfi-001", code: "RFI-2024-001", project: "ABC Tower", subject: "Clarify lobby ceiling height", type: "RFI", status: "Open", due: "2024-04-16" },
  { id: "cr-001", code: "CR-2024-001", project: "Mega Mall", subject: "Change finish material at Food Court", type: "Change", status: "Answered", due: "2024-04-22" },
];

function statusBadge(s: RFI["status"]) {
  switch (s) {
    case "Open":
      return <Badge className="bg-amber-600">Open</Badge>;
    case "Answered":
      return <Badge className="bg-blue-600">Answered</Badge>;
    case "Closed":
      return <Badge className="bg-emerald-600">Closed</Badge>;
    default:
      return <Badge variant="secondary">—</Badge>;
  }
}

export default function RFIChangeRequests() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState(seed);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((x) => [x.code, x.project, x.subject, x.type, x.status].some((v) => String(v).toLowerCase().includes(query)));
  }, [q, items]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">RFI / Change Requests</h1>
          <p className="text-muted-foreground">UI mock — log câu hỏi kỹ thuật & yêu cầu thay đổi</p>
        </div>

        <Button
          onClick={() => {
            const n = items.length + 1;
            const item: RFI = {
              id: `rfi-${String(n).padStart(3, "0")}`,
              code: `RFI-2024-${String(n).padStart(3, "0")}`,
              project: "ABC Tower",
              subject: "New question (mock)",
              type: "RFI",
              status: "Open",
              due: "2024-05-05",
            };
            setItems((prev) => [item, ...prev]);
            toast.success("Created RFI (mock)");
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> New
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">RFI / CR register</CardTitle>
          <div className="w-[340px] max-w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="font-mono text-xs">
                      <div>{x.code}</div>
                      <div className="text-muted-foreground line-clamp-1">{x.subject}</div>
                    </TableCell>
                    <TableCell className="font-medium">{x.project}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{x.type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{x.due}</TableCell>
                    <TableCell>{statusBadge(x.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => toast.info("Open thread/comments (mock)")}
                        >
                          <MessageSquareWarning className="h-4 w-4 mr-2" /> Thread
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setItems((prev) =>
                              prev.map((it) => (it.id === x.id ? { ...it, status: it.status === "Open" ? "Answered" : "Closed" } : it))
                            );
                            toast.success("Updated status (mock)");
                          }}
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" /> Move
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      Không có dữ liệu
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
