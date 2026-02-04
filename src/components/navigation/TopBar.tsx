import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  User,
  ChevronDown,
  FolderPlus,
  FileText,
  Receipt,
  Users,
  LogOut,
  Settings,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { mockApprovals } from '@/data/mockData';

const quickCreateItems = [
  { icon: FolderPlus, label: 'Tạo dự án', shortcut: '⌘N' },
  { icon: FileText, label: 'Tạo gói thầu', shortcut: '⌘T' },
  { icon: Receipt, label: 'Tạo hợp đồng', shortcut: '⌘H' },
  { icon: Users, label: 'Tạo đề nghị thanh toán', shortcut: '⌘P' },
];

const mockNotifications = [
  { id: 1, type: 'approval', title: 'Phê duyệt thanh toán', description: 'DNTT-2024-002 đang chờ duyệt', time: '5 phút trước', unread: true },
  { id: 2, type: 'overdue', title: 'Quá hạn nộp thầu', description: 'GT-2024-003 quá hạn 2 ngày', time: '1 giờ trước', unread: true },
  { id: 3, type: 'update', title: 'Cập nhật tiến độ', description: 'WP-1.2.1 đã hoàn thành 80%', time: '2 giờ trước', unread: false },
  { id: 4, type: 'comment', title: 'Bình luận mới', description: 'Lê Minh Cường đã bình luận', time: '3 giờ trước', unread: false },
];

export function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const pendingApprovals = mockApprovals.filter(a => a.status === 'pending').length;

  return (
  <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="flex h-full items-center justify-end px-6 gap-2">
      
      {/* Notifications */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {pendingApprovals > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {pendingApprovals}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h4 className="font-semibold">Thông báo</h4>
            <Button variant="ghost" size="sm" className="text-xs h-auto py-1">
              Đánh dấu đã đọc
            </Button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  notification.unread && "bg-accent/30"
                )}
              >
                <div
                  className={cn(
                    "h-2 w-2 rounded-full mt-2 flex-shrink-0",
                    notification.unread ? "bg-primary" : "bg-transparent"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notification.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-2">
            <Button variant="ghost" className="w-full text-sm h-9">
              Xem tất cả thông báo
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              AN
            </div>

            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium">Nguyễn Văn An</span>
              <span className="text-xs text-muted-foreground">
                Giám đốc dự án
              </span>
            </div>

            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Nguyễn Văn An</p>
              <p className="text-xs text-muted-foreground">
                an.nguyen@ventora.vn
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Hồ sơ cá nhân
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  </header>
);
}
