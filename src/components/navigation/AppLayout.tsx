import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { TopBar } from './TopBar';
import { useState, useEffect } from 'react';
import { FinanceProvider } from '@/contexts/finance';
import { HRProvider } from '@/contexts/hr';
import { EngineeringProvider } from '@/contexts/engineering';

export function AppLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(280);

  // Listen for sidebar width changes
  useEffect(() => {
    const handleResize = () => {
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth);
      }
    };

    // Initial check
    handleResize();

    // Set up observer for sidebar width changes
    const observer = new MutationObserver(handleResize);
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style'] });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <FinanceProvider>
      <HRProvider>
        <EngineeringProvider>
          <div className="min-h-screen bg-background">
            <AppSidebar />
            <div 
              className="transition-all duration-200"
              style={{ marginLeft: sidebarWidth }}
            >
              <TopBar />
              <main className="p-6">
                <Outlet />
              </main>
            </div>
          </div>
        </EngineeringProvider>
      </HRProvider>
    </FinanceProvider>
  );
}
