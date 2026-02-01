import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Camera, Plus, Search } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

type DiaryEntry = {
  id: string;
  date: string;
  weather: string;
  manpower: string;
  summary: string;
  photos: string[]; // mock urls
};

export default function ConstructionDiary() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ date: '02/01/2026', weather: 'Nắng', manpower: '26', summary: '' });

  const entries = useMemo<DiaryEntry[]>(
    () => [
      {
        id: 'D-2026-02-01',
        date: '02/01/2026',
        weather: 'Nắng',
        manpower: '26',
        summary: 'Đổ bê tông sàn tầng 3, kiểm tra coffa; nghiệm thu cốt thép (mock).',
        photos: ['/mock-invoice.svg'],
      },
      {
        id: 'D-2026-01-31',
        date: '01/31/2026',
        weather: 'Âm u',
        manpower: '22',
        summary: 'Lắp đặt ống MEP khu sảnh, phát sinh rủi ro chậm vật tư (mock).',
        photos: ['/mock-invoice.svg'],
      },
    ],
    []
  );

  const filtered = entries.filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return e.id.toLowerCase().includes(q) || e.summary.toLowerCase().includes(q) || e.date.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Site Diary / Nhật ký công trình</h1>
          <p className="text-muted-foreground">Nhật ký theo ngày + ảnh minh chứng (mock)</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New entry
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Entries</CardTitle>
              <CardDescription>Quick add + search (mock)</CardDescription>
            </div>
            <div className="relative w-80 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search diary..." className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filtered.map((e, idx) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">{e.id}</Badge>
                    <Badge variant="outline">{e.date}</Badge>
                    <span className="text-xs text-muted-foreground">Weather: {e.weather} • Manpower: {e.manpower}</span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{e.summary}</div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  View
                </Button>
              </div>
              <Separator className="my-3" />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>Photos (mock)</span>
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                {e.photos.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt="mock"
                    className="h-16 w-24 rounded-md border object-contain bg-muted"
                    onError={(ev) => ((ev.target as HTMLImageElement).style.display = 'none')}
                  />
                ))}
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No entries.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New diary entry (mock)</DialogTitle>
            <DialogDescription>Không lưu DB, chỉ toast để demo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Input value={draft.date} onChange={(e) => setDraft((p) => ({ ...p, date: e.target.value }))} placeholder="Date" />
            <Input value={draft.weather} onChange={(e) => setDraft((p) => ({ ...p, weather: e.target.value }))} placeholder="Weather" />
            <Input value={draft.manpower} onChange={(e) => setDraft((p) => ({ ...p, manpower: e.target.value }))} placeholder="Manpower" />
            <Textarea value={draft.summary} onChange={(e) => setDraft((p) => ({ ...p, summary: e.target.value }))} placeholder="Summary" />
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium flex items-center gap-2"><Camera className="h-4 w-4" />Upload photos</div>
              <div className="text-xs text-muted-foreground">Cho phép chọn file để demo UI, nhưng hệ thống gắn ảnh mock cố định.</div>
              <Separator className="my-3" />
              <Input type="file" multiple />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: 'Diary entry created (mock)', description: `${draft.date} • ${draft.weather} • manpower ${draft.manpower}` });
                setDraft({ date: '02/01/2026', weather: 'Nắng', manpower: '26', summary: '' });
                setOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
