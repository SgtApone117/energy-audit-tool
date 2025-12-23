'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Alert } from '@/components/ui';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuditStorage } from '@/lib/auditor';
import { AuditData } from '@/lib/auditor/types';
import { AuditWorkspace } from '@/components/auditor';

export default function AuditPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.auditId as string;
  
  const { isLoaded, getAudit, updateAudit, setCurrentAuditId } = useAuditStorage();
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Load audit on mount
  useEffect(() => {
    if (isLoaded && auditId) {
      const foundAudit = getAudit(auditId);
      if (foundAudit) {
        setAudit(foundAudit);
        setCurrentAuditId(auditId);
      } else {
        setNotFound(true);
      }
    }
  }, [isLoaded, auditId, getAudit, setCurrentAuditId]);

  // Handle save
  const handleSave = (updates: Partial<AuditData>) => {
    if (!audit) return;
    
    const updatedAudit = { ...audit, ...updates, updatedAt: new Date().toISOString() };
    setAudit(updatedAudit);
    updateAudit(auditId, updates);
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          Audit not found. It may have been deleted.
        </Alert>
        <Button className="mt-4" onClick={() => router.push('/auditor')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Audits
        </Button>
      </div>
    );
  }

  // Audit not loaded yet
  if (!audit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return <AuditWorkspace audit={audit} onSave={handleSave} />;
}
