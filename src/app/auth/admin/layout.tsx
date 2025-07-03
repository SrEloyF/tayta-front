'use client';

import { AdminAuthProvider } from '@/providers/AdminAuthProvider';

export default function AuthAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      {children}
    </AdminAuthProvider>
  );
} 