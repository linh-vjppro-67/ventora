import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, ChevronRight, Filter, Search } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type Task = {
  id: string;
  code: string;
  name: string;
  owner: string;
  start: string;
  end: string;
  progress: number;
  status: 'on-track' | 'at-risk' | 'delayed';
};

const statusBadge: Record<Task['status'], { label: string; variant: 'secondary' | 'default' | 'outline' }> = {
  'on-track': { label: 'On track', variant: 'default' },
  'at-risk': { label: 'At risk', variant: 'outline' },
  delayed: { label: 'Delayed', variant: 'secondary' },
};

export default function ConstructionSchedule() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Task['status'] | 'all'>('all');

  const tasks = useMemo<Task[]>(
    () => [
      { id: 't1', code: 'SCH-01', name: 'Cọc + Móng', owner: 'Huy', start: '02/05', end: '02/16', progress: 100, status: 'on-track' },
      { id: 't2', code: 'SCH-02', name: 'Dầm + Sàn tầng 3', owner: 'Minh', start: '02/10', end: '02/28', progress: 68, status: 'at-risk' },
      { id: 't3', code: 'SCH-03', name: 'Lắp đặt MEP tầng 3', owner: 'Trang', start: '03/01', end: '03/20', progress: 0, status: 'on-track' },
      { id: 't4', code: 'SCH-04', name: 'Hoàn thiện khu sảnh', owner: 'An', start: '03/15', end: '04/10', progress: 0, status: 'delayed' },
    ],
    []
  );

  const filtered = tasks
    .filter((t) => filter === 'all' || t.status === filter)
    .filter((t) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return t.code.toLowerCase().includes(q) || t.name.toLowerCase().includes(q) || t.owner.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule (Gantt)</h1>
          <p className="text-muted-foreground">Gantt lightweight (mock) • click task để xem detail drawer</p>
        </div>
        <Button variant="outline" className="gap-2">
          <CalendarClock className="h-4 w-4" />
          Export schedule (mock)
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Timeline</CardTitle>
              <CardDescription>Hiển thị dạng bars (mock) theo % tiến độ</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-72 max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search task..." className="pl-10" />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="on-track">On track</SelectItem>
                  <SelectItem value="at-risk">At risk</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((t, idx) => {
            const meta = statusBadge[t.status];
            return (
              <Drawer key={t.id}>
                <DrawerTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="w-full text-left rounded-xl border p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground font-mono">{t.code}</div>
                        <div className="font-semibold truncate">{t.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">Owner: {t.owner} • {t.start} → {t.end}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-foreground">{t.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${t.progress}%` }} />
                      </div>
                    </div>
                  </motion.button>
                </DrawerTrigger>
                <DrawerContent>
                  <div className="mx-auto w-full max-w-3xl">
                    <DrawerHeader>
                      <DrawerTitle>{t.name}</DrawerTitle>
                      <DrawerDescription>{t.code} • {t.start} → {t.end} • Owner: {t.owner}</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 pt-0 space-y-4">
                      <Card>
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Status</span>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{t.progress}%</span>
                          </div>
                          <Progress value={t.progress} className="h-2" />
                          <Separator />
                          <div className="text-sm">
                            <div className="font-medium">Notes (mock)</div>
                            <div className="text-muted-foreground">• Rủi ro: chậm vật tư (ví dụ)
                              <br />• Next: request inspection khi hoàn thành</div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No matching tasks.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
