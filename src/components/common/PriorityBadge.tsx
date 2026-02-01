import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const priorityBadgeVariants = cva(
  'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
  {
    variants: {
      priority: {
        low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
    },
    defaultVariants: {
      priority: 'medium',
    },
  }
);

export interface PriorityBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof priorityBadgeVariants> {}

const priorityLabels: Record<string, string> = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  urgent: 'Khẩn cấp',
};

export function PriorityBadge({
  className,
  priority,
  ...props
}: PriorityBadgeProps) {
  return (
    <span
      className={cn(priorityBadgeVariants({ priority, className }))}
      {...props}
    >
      {priority ? priorityLabels[priority] : ''}
    </span>
  );
}
