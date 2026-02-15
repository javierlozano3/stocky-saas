
import React from 'react';
import { ClientPage } from '@/components/client/ClientPage';

export default async function Page({ params }: { params: Promise<{ negocioId: string }> }) {
    const { negocioId } = await params;
    return <ClientPage negocioId={negocioId} />;
}
