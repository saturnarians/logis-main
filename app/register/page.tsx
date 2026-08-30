'use client';

import React, { Suspense } from 'react';
import LoginPage from '../login/page';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading DHL Register...</div>}>
      <LoginPage />
    </Suspense>
  );
}
