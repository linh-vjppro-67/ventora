import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Paperclip } from "lucide-react";

const mockInvoices = [
  { no: "INV-000123", vendor: "Công ty ABC", amount: 25_200_000, status: "Đã nhận" },
  { no: "INV-000124", vendor: "VLXD An Phát", amount: 185_000_000, status: "Đã đối chiếu" },
  { no: "INV-000125", vendor: "Điện nước Thành Tín", amount: 37_800_000, status: "Chờ xử lý" },
];

export default function FinanceInvoices() {
  const [fileName, setFileName] = useState<string>("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hóa đơn – Chứng từ</h1>
        <p className="text-muted-foreground">Trang mock (upload file sẽ chỉ hiển thị tên + preview mock).</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Upload chứng từ</CardTitle>
          <Badge variant="secondary">Mock upload</Badge>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Input
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setFileName(f.name);
                toast.success("Đã upload (mock)");
              }}
            />
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              {fileName ? (
                <span>
                  File: <b>{fileName}</b> (preview sẽ luôn là mock)
                </span>
              ) : (
                <span>Chọn file bất kỳ để demo.</span>
              )}
            </div>
            <Button variant="outline" onClick={() => toast.info("Chưa có action thật — UI demo")}>Tạo chứng từ</Button>
          </div>
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="text-sm font-semibold mb-2">Preview</div>
            <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border bg-white">
              <img src="/mock-invoice.svg" alt="mock invoice" className="h-full w-full object-cover" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInvoices.map((inv) => (
                <TableRow key={inv.no}>
                  <TableCell className="font-medium">{inv.no}</TableCell>
                  <TableCell>{inv.vendor}</TableCell>
                  <TableCell className="text-right">{inv.amount.toLocaleString("vi-VN")} đ</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{inv.status}</Badge>
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
