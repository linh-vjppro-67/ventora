import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const statusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-secondary text-secondary-foreground',
        draft: 'bg-muted text-muted-foreground',
        pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        won: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        planning: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
        'on-hold': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        lead: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        preparation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        submitted: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        negotiating: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
        'legal-review': 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
        signed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        released: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        'not-started': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        'pending-inspection': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        accepted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        reconciled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        'on-leave': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        offboarded: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      },
      size: {
        default: 'px-2.5 py-0.5 text-xs',
        sm: 'px-2 py-0.5 text-[10px]',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status?: string;
  label?: string;
}

const statusLabels: Record<string, string> = {
  // Project
  'planning': 'Lập kế hoạch',
  'active': 'Đang thực hiện',
  'on-hold': 'Tạm dừng',
  'completed': 'Hoàn thành',
  'cancelled': 'Đã hủy',
  // Tender
  'lead': 'Tiềm năng',
  'preparation': 'Chuẩn bị',
  'submitted': 'Đã nộp',
  'negotiating': 'Thương thảo',
  'won': 'Trúng thầu',
  'lost': 'Trượt thầu',
  // Contract
  'draft': 'Bản thảo',
  'legal-review': 'Pháp chế duyệt',
  'approved': 'Đã duyệt',
  'signed': 'Đã ký',
  'closed': 'Đã đóng',
  // Payment
  'pending': 'Chờ duyệt',
  'paid': 'Đã thanh toán',
  'reconciled': 'Đã đối chiếu',
  'rejected': 'Từ chối',
  // Employee
  'on-leave': 'Nghỉ phép',
  'offboarded': 'Đã nghỉ việc',
  // Design
  'new': 'Mới',
  'in-progress': 'Đang thực hiện',
  'review': 'Đang xem xét',
  'released': 'Đã phát hành',
  // Work Package
  'not-started': 'Chưa bắt đầu',
  'pending-inspection': 'Chờ nghiệm thu',
  'accepted': 'Đã nghiệm thu'
};

export function StatusBadge({
  className,
  variant,
  size,
  status,
  label,
  ...props
}: StatusBadgeProps) {
  const displayVariant = status ? (status as typeof variant) : variant;
  const displayLabel = label || (status ? statusLabels[status] || status : '');

  return (
    <span
      className={cn(statusBadgeVariants({ variant: displayVariant, size, className }))}
      {...props}
    >
      {displayLabel}
    </span>
  );
}
