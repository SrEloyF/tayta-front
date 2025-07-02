'use client';

// app/client/layout.tsx
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientFooter } from '@/components/client/ClientFooter';
import { AuthProvider } from '@/providers/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import { usePathname } from 'next/navigation';
import AIChat from '@/components/client/AIChat';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isChatsPage = pathname === '/client/chats';

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex flex-col min-h-screen">
          <ClientHeader />
          <main className={`flex-grow ${isChatsPage ? 'pb-0' : 'pb-[100px]'}`}>
            {children}
          </main>
          {!isChatsPage && <ClientFooter />}
          <AIChat />
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}