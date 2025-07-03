'use client';

// app/client/layout.tsx
import { ClientHeader } from '@/components/client/ClientHeader';
import { ClientFooter } from '@/components/client/ClientFooter';
import { AuthProvider } from '@/providers/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';
import { usePathname } from 'next/navigation';
import AIChat from '@/components/client/AIChat';
import { useRef, useEffect } from 'react';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isChatsPage = pathname.startsWith('/client/chats');

  return (
    <AuthProvider>
      <AuthGuard>
        <div className="flex flex-col min-h-screen">
          <ClientHeader />
          <main className={`flex-grow ${isChatsPage ? 'pb-0 h-[calc(100vh-111px)]' : 'pb-[100px]'}`}>
            {children}
          </main>
          {!isChatsPage && <ClientFooter />}
          {!isChatsPage && <AIChat />}
        </div>
      </AuthGuard>
    </AuthProvider>
  );
}