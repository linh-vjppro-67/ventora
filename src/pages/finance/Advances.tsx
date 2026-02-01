import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const mockAdvances = [
  { no: "TA-2026-0004", person: "Nguyễn Văn A", amount: 10_000_000, status: "Tạm ứng" },
  { no: "TA-2026-0003", person: "Trần Thị B", amount: 6_500_000, status: "Hoàn ứng" },
  { no: "TA-2026-0002", person: "Lê Văn C", amount: 12_000_000, status: "Đang xử lý" },
];

export default function FinanceAdvances() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tạm ứng / Hoàn ứng</h1>
        <p className="text-muted-foreground">Trang mock để demo UI (chưa nối data thật).</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách</CardTitle>
          <Button variant="outline">Tạo tạm ứng</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Người đề nghị</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAdvances.map((a) => (
                <TableRow key={a.no}>
                  <TableCell className="font-medium">{a.no}</TableCell>
                  <TableCell>{a.person}</TableCell>
                  <TableCell className="text-right">{a.amount.toLocaleString("vi-VN")} đ</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{a.status}</Badge>
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
