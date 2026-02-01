import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, FileDown, FileSignature, ShieldAlert, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { mockContracts, formatCurrency } from '@/data/mockData';
import type { Contract, ContractStatus } from '@/types';

const statusPill: Record<ContractStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-700' },
  'legal-review': { label: 'Legal Review', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', cls: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Signed', cls: 'bg-indigo-100 text-indigo-700' },
  active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', cls: 'bg-zinc-100 text-zinc-700' },
};

export default function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const contract = useMemo(() => mockContracts.find((c) => c.id === id) as Contract | undefined, [id]);
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([
    '01_Contract_Draft.docx',
    '02_Terms_Annex.pdf',
    '03_Pricing_Schedule.xlsx',
  ]);

  if (!contract) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate('/legal/contracts')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">Không tìm thấy hợp đồng.</CardContent>
        </Card>
      </div>
    );
  }

  const uploadMock = () => {
    const next = `ATT_${attachments.length + 1}.pdf`;
    setAttachments((prev) => [next, ...prev]);
    toast({ title: 'Upload docs', description: `Mock: đã thêm ${next}` });
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/legal/contracts')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Danh sách hợp đồng
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast({ title: 'Generate PDF', description: 'Mock: generate PDF thành công' })}
          >
            <FileDown className="h-4 w-4" />
            Generate PDF (mock)
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => toast({ title: 'Request signature', description: 'Mock: gửi yêu cầu ký số' })}
          >
            <FileSignature className="h-4 w-4" />
            Request signature (mock)
          </Button>
          <Button
            className="gap-2"
            onClick={() => toast({ title: 'Submit for approval', description: 'Mock: tạo approval request cho hợp đồng' })}
          >
            <ArrowRight className="h-4 w-4" />
            Submit for approval
          </Button>
        </div>
      </div>

      {/* Header */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{contract.code}</h1>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill[contract.status].cls}`}
                >
                  {statusPill[contract.status].label}
                </span>
                <Badge variant="outline">{contract.type}</Badge>
              </div>
              <div className="text-muted-foreground mt-1">{contract.name}</div>
              <div className="text-sm text-muted-foreground mt-2">
                Đối tác: <span className="font-medium text-foreground">{contract.client}</span>
                <span className="mx-2">•</span>
                Project: <span className="font-medium text-foreground">{contract.projectId}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-muted-foreground">Contract Value</div>
              <div className="text-2xl font-bold">{formatCurrency(contract.value)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {new Date(contract.startDate).toLocaleDateString('vi-VN')} → {new Date(contract.endDate).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workspace */}
      <Tabs defaultValue="terms">
        <TabsList>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="payment">Payment Terms</TabsTrigger>
          <TabsTrigger value="risks">Risks / Clauses</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="terms" className="mt-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="font-semibold">Điều khoản chính</div>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Phạm vi công việc + tiêu chuẩn nghiệm thu</li>
                <li>Bảo hành / bảo trì</li>
                <li>Phạt chậm tiến độ & giới hạn trách nhiệm</li>
                <li>Giải quyết tranh chấp (thẩm quyền / trọng tài)</li>
              </ul>
              <Separator />
              <div className="text-sm">
                <div className="text-muted-foreground mb-2">Ghi chú nội bộ</div>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Nhập ghi chú..." />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attachments" className="mt-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Tệp đính kèm</div>
                <Button variant="outline" className="gap-2" onClick={uploadMock}>
                  <Upload className="h-4 w-4" />
                  Upload docs
                </Button>
              </div>
              <div className="space-y-2">
                {attachments.map((f) => (
                  <div key={f} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="text-sm font-medium">{f}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toast({ title: 'Open file', description: `Mock: mở ${f}` })}
                    >
                      Mở
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="font-semibold">Payment Terms</div>
              <div className="text-sm text-muted-foreground">{contract.paymentTerms}</div>
              <Separator />
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { k: 'Tạm ứng', v: '10%' },
                  { k: 'Thanh toán theo tiến độ', v: '70%' },
                  { k: 'Giữ lại bảo hành', v: '5%' },
                ].map((i) => (
                  <div key={i.k} className="rounded-lg border p-4">
                    <div className="text-xs text-muted-foreground">{i.k}</div>
                    <div className="text-lg font-bold mt-1">{i.v}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                Risks / Clauses
              </div>
              <div className="space-y-2">
                {[
                  { lvl: 'High', txt: 'Điều khoản phạt chậm tiến độ: cần giới hạn % tối đa.' },
                  { lvl: 'Medium', txt: 'Điều khoản thay đổi phạm vi: cần cơ chế change order rõ ràng.' },
                  { lvl: 'Low', txt: 'Điều khoản bảo hiểm: bổ sung danh mục chứng từ.' },
                ].map((r) => (
                  <div key={r.txt} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{r.lvl}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast({ title: 'Open clause', description: 'Mock: mở điều khoản liên quan' })}
                      >
                        Xem
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">{r.txt}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="font-semibold">Approvals</div>
              <div className="text-sm text-muted-foreground">
                Mock luồng phê duyệt hợp đồng: Draft → Legal Review → Approved → Signed → Active → Closed
              </div>
              <Separator />
              <div className="space-y-2">
                {[
                  { step: 'Legal Review', by: 'Trưởng phòng Pháp chế', st: 'pending' },
                  { step: 'BOD Approval', by: 'Giám đốc', st: 'waiting' },
                ].map((a) => (
                  <div key={a.step} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{a.step}</div>
                      <div className="text-xs text-muted-foreground">Approver: {a.by}</div>
                    </div>
                    <Badge variant="secondary">{a.st}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
