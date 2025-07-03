// app/admin/layout.tsx
'use client';

import { AdminAuthProvider } from '@/providers/AdminAuthProvider';
import { Toaster } from '@/components/ui/toaster';
import AdminLayout from "@/components/admin/layout/AdminLayout";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayout>
        {children}
        <Toaster />
      </AdminLayout>
    </AdminAuthProvider>
  );
}