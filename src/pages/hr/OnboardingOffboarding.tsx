import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ClipboardCheck, DoorOpen, DoorClosed } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHR } from '@/contexts/hr';

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

const defaultOnboarding: ChecklistItem[] = [
  { id: 'on-1', label: 'Tạo email công ty + cấp quyền hệ thống', done: true },
  { id: 'on-2', label: 'Ký hợp đồng lao động (mock file)', done: false },
  { id: 'on-3', label: 'Bàn giao laptop / thẻ ra vào', done: false },
  { id: 'on-4', label: 'Giới thiệu quy định & nội quy', done: false },
];

const defaultOffboarding: ChecklistItem[] = [
  { id: 'off-1', label: 'Thu hồi quyền hệ thống', done: false },
  { id: 'off-2', label: 'Thu hồi thiết bị / thẻ ra vào', done: false },
  { id: 'off-3', label: 'Chốt công nợ / lương thưởng', done: false },
  { id: 'off-4', label: 'Biên bản bàn giao & kết thúc', done: false },
];

export default function OnboardingOffboarding() {
  const { employees } = useHR();
  const [tab, setTab] = useState<'on' | 'off'>('on');
  const [onboarding, setOnboarding] = useState<ChecklistItem[]>(defaultOnboarding);
  const [offboarding, setOffboarding] = useState<ChecklistItem[]>(defaultOffboarding);

  const list = tab === 'on' ? onboarding : offboarding;
  const done = useMemo(() => list.filter((i) => i.done).length, [list]);
  const pct = useMemo(() => Math.round((done / Math.max(1, list.length)) * 100), [done, list.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Onboarding/Offboarding checklist</h1>
          <p className="text-muted-foreground">Checklist thao tác theo luồng nhân sự (UI demo).</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Progress: {pct}%</Badge>
          <Button
            onClick={() => {
              toast.success('Đã gửi checklist vào Approval Inbox (mock)');
            }}
          >
            <ClipboardCheck className="h-4 w-4 mr-2" />
            Request approval
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="on">
            <DoorOpen className="h-4 w-4 mr-2" /> Onboarding
          </TabsTrigger>
          <TabsTrigger value="off">
            <DoorClosed className="h-4 w-4 mr-2" /> Offboarding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="on" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Onboarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">Áp dụng cho nhân viên mới: {employees[0]?.name ?? '—'} (mock)</div>
              <Checklist
                items={onboarding}
                onChange={(next) => setOnboarding(next)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="off" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Offboarding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">Áp dụng cho nhân viên nghỉ việc: {employees[6]?.name ?? '—'} (mock)</div>
              <Checklist
                items={offboarding}
                onChange={(next) => setOffboarding(next)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Checklist({ items, onChange }: { items: ChecklistItem[]; onChange: (next: ChecklistItem[]) => void }) {
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <label
          key={it.id}
          className="flex items-center gap-3 rounded-lg border p-3 hover:bg-secondary/30 cursor-pointer"
        >
          <Checkbox
            checked={it.done}
            onCheckedChange={(v) => {
              onChange(items.map((x) => (x.id === it.id ? { ...x, done: Boolean(v) } : x)));
            }}
          />
          <div className="flex-1">
            <div className="font-medium">{it.label}</div>
          </div>
          {it.done && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
        </label>
      ))}
    </div>
  );
}
