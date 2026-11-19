import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthForm from '@/components/auth/AuthForm';

export const metadata: Metadata = {
  title: 'Masuk Akun // Sign In',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#06070d]" />}>
      <AuthForm initialMode="login" />
    </Suspense>
  );
}
