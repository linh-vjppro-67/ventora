import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Search, UserPlus, Upload, BadgeCheck, Briefcase, Mail, Phone, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useHR } from '@/contexts/hr';
import type { EmployeeStatus } from '@/types';

function statusBadge(status: EmployeeStatus) {
  switch (status) {
    case 'active':
      return <Badge className="bg-emerald-600">Active</Badge>;
    case 'on-leave':
      return <Badge variant="secondary">On leave</Badge>;
    case 'offboarded':
      return <Badge variant="outline">Offboarded</Badge>;
    default:
      return <Badge variant="secondary">—</Badge>;
  }
}

export default function EmployeeDirectory() {
  const { employees, addEmployee, updateEmployee, attachContractMock } = useHR();
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((e) =>
      [e.code, e.name, e.department, e.position, e.email].some((x) => String(x).toLowerCase().includes(query))
    );
  }, [employees, q]);

  const selected = useMemo(() => employees.find((e) => e.id === selectedId) ?? null, [employees, selectedId]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Employee Directory</h1>
          <p className="text-muted-foreground">Danh bạ nhân sự — table + quick view drawer</p>
        </div>

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add employee
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px]">
              <DialogHeader>
                <DialogTitle>Thêm nhân viên (mock)</DialogTitle>
                <DialogDescription>Không lưu DB thật — chỉ demo UI/UX và state.</DialogDescription>
              </DialogHeader>

              <EmployeeForm
                onSubmit={(payload) => {
                  addEmployee(payload);
                }}
              />
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() => toast.info('Tip: upload hợp đồng (mock) nằm ở action từng nhân viên')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload contract (mock)
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Tìm theo tên, mã NV, phòng ban, chức danh..."
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filtered.length} nhân sự</Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã NV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Phòng ban</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => setSelectedId(e.id)}>
                    <TableCell className="font-mono text-xs">{e.code}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {e.contractMockAttached && (
                          <Badge className="bg-blue-600">Contract</Badge>
                        )}
                        <span>{e.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{e.department}</TableCell>
                    <TableCell>{e.position}</TableCell>
                    <TableCell>{statusBadge(e.status)}</TableCell>
                    <TableCell className="text-right" onClick={(ev) => ev.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => attachContractMock(e.id)}>
                          Upload contract
                        </Button>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="secondary">Change role</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[520px]">
                            <DialogHeader>
                              <DialogTitle>Change role (mock)</DialogTitle>
                              <DialogDescription>{e.name} • {e.code}</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <Select
                                  defaultValue={e.position}
                                  onValueChange={(v) => {
                                    updateEmployee(e.id, { position: v });
                                    toast.success(`Đã đổi role: ${v}`);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn role" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Chuyên viên nhân sự">Chuyên viên nhân sự</SelectItem>
                                    <SelectItem value="Kế toán">Kế toán</SelectItem>
                                    <SelectItem value="Kỹ sư">Kỹ sư</SelectItem>
                                    <SelectItem value="PMO">PMO</SelectItem>
                                    <SelectItem value="Giám đốc dự án">Giám đốc dự án</SelectItem>
                                    <SelectItem value="Chỉ huy trưởng công trường">Chỉ huy trưởng công trường</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label>Employee state</Label>
                                <Select
                                  defaultValue={e.status}
                                  onValueChange={(v) => {
                                    updateEmployee(e.id, { status: v as EmployeeStatus });
                                    toast.success(`Đã cập nhật trạng thái: ${v}`);
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on-leave">On leave</SelectItem>
                                    <SelectItem value="offboarded">Offboarded</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button variant="outline" onClick={() => toast.info('UI demo — không có workflow thật')}>Đóng</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelectedId(null)}>
        <SheetContent className="w-[520px] sm:w-[600px]">
          {selected && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle>Quick View — {selected.name}</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow icon={BadgeCheck} label="Employee Code" value={selected.code} />
                <InfoRow icon={Building2} label="Department" value={selected.department} />
                <InfoRow icon={Briefcase} label="Role" value={selected.position} />
                <InfoRow icon={Mail} label="Email" value={selected.email} />
                <InfoRow icon={Phone} label="Phone" value={selected.phone} />
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Status</div>
                  {statusBadge(selected.status)}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="font-semibold">Actions</div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => attachContractMock(selected.id)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload contract (mock)
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      updateEmployee(selected.id, { status: selected.status === 'active' ? 'on-leave' : 'active' });
                      toast.success('Đã toggle trạng thái (mock)');
                    }}
                  >
                    Toggle leave
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Lưu ý: Upload là mock — hệ thống sẽ hiển thị “Contract” badge, không lưu file thật.
                </p>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function EmployeeForm({ onSubmit }: { onSubmit: (payload: any) => void }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('NV-' + String(Math.floor(Math.random() * 900) + 100));
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('HR');
  const [position, setPosition] = useState('Chuyên viên nhân sự');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('active');
  const [joinDate, setJoinDate] = useState('2025-01-01');

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) {
          toast.error('Vui lòng nhập tên');
          return;
        }
        const payload = {
          code,
          name,
          email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@ventora.vn`,
          department,
          position,
          phone: phone || '0900000000',
          status,
          joinDate,
        };
        onSubmit(payload);
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Mã NV</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Họ tên</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="a.nguyen@ventora.vn" />
        </div>
        <div className="space-y-2">
          <Label>SĐT</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090..." />
        </div>
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn phòng ban" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="HC">HC</SelectItem>
              <SelectItem value="QLDA">QLDA</SelectItem>
              <SelectItem value="Thi công">Thi công</SelectItem>
              <SelectItem value="Tài chính">Tài chính</SelectItem>
              <SelectItem value="Kỹ thuật">Kỹ thuật</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Input value={position} onChange={(e) => setPosition(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as EmployeeStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on-leave">On leave</SelectItem>
              <SelectItem value="offboarded">Offboarded</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Join date</Label>
          <Input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">Tạo nhân viên</Button>
      </DialogFooter>
    </form>
  );
}
