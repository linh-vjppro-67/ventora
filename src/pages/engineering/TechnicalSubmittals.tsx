import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FileCheck, FileUp, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Submittal = {
  id: string;
  code: string;
  project: string;
  category: "Material" | "Method" | "Shop Drawing";
  status: "Draft" | "Submitted" | "Reviewed" | "Approved";
  due: string;
};

const seed: Submittal[] = [
  { id: "sub-001", code: "SUB-2024-001", project: "ABC Tower", category: "Material", status: "Submitted", due: "2024-04-18" },
  { id: "sub-002", code: "SUB-2024-002", project: "Mega Mall", category: "Method", status: "Draft", due: "2024-04-25" },
  { id: "sub-003", code: "SUB-2024-003", project: "Bệnh viện Đa khoa", category: "Shop Drawing", status: "Reviewed", due: "2024-05-02" },
];

function statusBadge(s: Submittal["status"]) {
  switch (s) {
    case "Approved":
      return <Badge className="bg-emerald-600">Approved</Badge>;
    case "Reviewed":
      return <Badge className="bg-amber-600">Reviewed</Badge>;
    case "Submitted":
      return <Badge className="bg-blue-600">Submitted</Badge>;
    default:
      return <Badge variant="outline">Draft</Badge>;
  }
}

export default function TechnicalSubmittals() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState(seed);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((x) => [x.code, x.project, x.category, x.status].some((v) => String(v).toLowerCase().includes(query)));
  }, [q, items]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Technical Submittals</h1>
          <p className="text-muted-foreground">UI mock — catalog + submit/review flow</p>
        </div>
        <Button
          onClick={() => {
            const n = items.length + 1;
            setItems((prev) => [
              {
                id: `sub-${String(n).padStart(3, "0")}`,
                code: `SUB-2024-${String(n).padStart(3, "0")}`,
                project: "ABC Tower",
                category: "Material",
                status: "Draft",
                due: "2024-05-10",
              },
              ...prev,
            ]);
            toast.success("Created submittal (mock)");
          }}
        >
          <FileCheck className="h-4 w-4 mr-2" /> New submittal
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">Submittal register</CardTitle>
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
                  <TableHead>Submittal No</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((x) => (
                  <TableRow key={x.id}>
                    <TableCell className="font-mono text-xs">{x.code}</TableCell>
                    <TableCell className="font-medium">{x.project}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{x.category}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{x.due}</TableCell>
                    <TableCell>{statusBadge(x.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => toast.success("Upload file (mock)")}
                        >
                          <FileUp className="h-4 w-4 mr-2" /> Upload
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setItems((prev) => prev.map((it) => (it.id === x.id ? { ...it, status: it.status === "Draft" ? "Submitted" : it.status } : it)));
                            toast.success("Submitted (mock)");
                          }}
                          disabled={x.status !== "Draft"}
                        >
                          Submit
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
