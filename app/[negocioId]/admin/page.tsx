"use client";

import React, { use } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function AdminPage({ params }: { params: Promise<{ negocioId: string }> }) {
    // Usamos 'use' para desenvolver los params en Next.js 16
    const { negocioId } = use(params);

    return (
        <AdminDashboard negocioId={negocioId} />
    );
}