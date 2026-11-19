import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Daftar Akun Baru // Register',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#06070d]" />}>
      <AuthForm initialMode="register" />
    </Suspense>
  );
}
