'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, Input } from '@/components/ui';
import { 
  Plus, 
  FileText, 
  Clock, 
  Building2, 
  Trash2, 
  Copy, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  ArrowRightCircle
} from 'lucide-react';
import { useAuditStorage } from '@/lib/auditor';
import { AuditData, InspectionType, INSPECTION_TYPES } from '@/lib/auditor/types';

export default function AuditorDashboard() {
  const router = useRouter();
  const { 
    isLoaded, 
    getAllAudits, 
    createAudit, 
    deleteAudit, 
    duplicateAudit,
    createPostFromPre,
    exportAudit,
    importAudit,
    setCurrentAuditId 
  } = useAuditStorage();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [newAuditName, setNewAuditName] = useState('');
  const [newAuditType, setNewAuditType] = useState<InspectionType>('pre');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (showNewAuditModal && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showNewAuditModal]);

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  const audits = getAllAudits();

  const handleNewAudit = () => {
    setNewAuditName('');
    setNewAuditType('pre');
    setShowNewAuditModal(true);
  };

  const handleCreateAudit = () => {
    const name = newAuditName.trim() || undefined;
    const audit = createAudit(name, newAuditType);
    setShowNewAuditModal(false);
    router.push(`/auditor/${audit.id}`);
  };

  const handleOpenAudit = (audit: AuditData) => {
    setCurrentAuditId(audit.id);
    router.push(`/auditor/${audit.id}`);
  };

  const handleDelete = (id: string) => {
    deleteAudit(id);
    setShowDeleteConfirm(null);
  };

  const handleDuplicate = (id: string) => {
    const newAudit = duplicateAudit(id);
    if (newAudit) {
      router.push(`/auditor/${newAudit.id}`);
    }
  };

  const handleCreatePostFromPre = (id: string) => {
    const newAudit = createPostFromPre(id);
    if (newAudit) {
      router.push(`/auditor/${newAudit.id}`);
    }
  };

  const handleExport = (id: string) => {
    const audit = audits.find(a => a.id === id);
    const json = exportAudit(id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Use audit name for filename, sanitize for filesystem
      const safeName = (audit?.name || 'audit').replace(/[^a-z0-9]/gi, '-').toLowerCase();
      a.download = `${safeName}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const audit = importAudit(content);
        if (audit) {
          router.push(`/auditor/${audit.id}`);
        }
      };
      reader.readAsText(file);
    }
  };

  const getStatusBadge = (status: AuditData['status']) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-700',
      'in-progress': 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
    };
    const icons = {
      draft: <Clock className="w-3 h-3" />,
      'in-progress': <AlertCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.replace('-', ' ')}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Energy Audits</h1>
          <p className="text-gray-600 mt-1">Manage your on-site energy audits</p>
        </div>
        <div className="flex gap-3">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Upload className="w-4 h-4 mr-2" />
            Import
          </label>
          <Button onClick={handleNewAudit}>
            <Plus className="w-4 h-4 mr-2" />
            New Audit
          </Button>
        </div>
      </div>

      {/* Audit List */}
      {audits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No audits yet</h3>
            <p className="text-gray-600 mb-4">Start your first on-site energy audit</p>
            <Button onClick={handleNewAudit}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Audit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {audits.map((audit) => (
            <Card key={audit.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {audit.name || 'Untitled Audit'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {audit.buildingInfo.name || audit.buildingInfo.address || 'No building info'}
                    </p>
                  </div>
                  {getStatusBadge(audit.status)}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mb-4">
                  {/* Inspection Type Badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                    audit.inspectionType === 'post' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {audit.inspectionType === 'post' ? '✅ Post' : '📋 Pre'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {audit.photos.length} photos
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(audit.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button 
                    className="flex-1" 
                    onClick={() => handleOpenAudit(audit)}
                  >
                    Open
                  </Button>
                  
                  {/* Create Post-Install button - only for COMPLETED pre-installation audits */}
                  {audit.inspectionType === 'pre' && audit.status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreatePostFromPre(audit.id)}
                      title="Create Post-Installation Inspection"
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-300"
                    >
                      <ArrowRightCircle className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Post</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(audit.id)}
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport(audit.id)}
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(audit.id)}
                    title="Delete"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === audit.id && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 mb-2">Delete this audit?</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(audit.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Start Guide</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Create a new audit and enter building information</li>
          <li>2. Take photos during your on-site visit and categorize them</li>
          <li>3. Document equipment: HVAC units, lighting, and other systems</li>
          <li>4. Enter utility bill data if available</li>
          <li>5. Generate a professional audit report</li>
        </ul>
      </div>

      {/* New Audit Modal */}
      {showNewAuditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">New Inspection</h2>
              <button
                onClick={() => setShowNewAuditModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Inspection Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Inspection Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {INSPECTION_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewAuditType(type.id)}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all
                        ${newAuditType === type.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                        }
                      `}
                    >
                      <div className={`font-medium ${newAuditType === type.id ? 'text-blue-900' : 'text-gray-900'}`}>
                        {type.id === 'pre' ? '📋 Pre-Installation' : '✅ Post-Installation'}
                      </div>
                      <p className={`text-xs mt-1 ${newAuditType === type.id ? 'text-blue-700' : 'text-gray-500'}`}>
                        {type.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Audit Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspection Name (Optional)
                </label>
                <Input
                  ref={nameInputRef}
                  value={newAuditName}
                  onChange={(e) => setNewAuditName(e.target.value)}
                  placeholder={`e.g., "Main Street Office - 100 Fixture Retrofit"`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateAudit();
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  A descriptive name helps identify this inspection later.
                </p>
              </div>
              
              {/* Context Info */}
              <div className={`p-3 rounded-lg ${newAuditType === 'pre' ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
                <h4 className={`text-sm font-medium ${newAuditType === 'pre' ? 'text-amber-900' : 'text-green-900'}`}>
                  {newAuditType === 'pre' ? 'Pre-Installation Checklist:' : 'Post-Installation Checklist:'}
                </h4>
                <ul className={`text-xs mt-2 space-y-1 ${newAuditType === 'pre' ? 'text-amber-800' : 'text-green-800'}`}>
                  {newAuditType === 'pre' ? (
                    <>
                      <li>• Count existing fixtures and verify specifications</li>
                      <li>• Document lamp types, wattages, and ballast types</li>
                      <li>• Note fixtures with lamps out</li>
                      <li>• Take photos of nameplates and ballasts</li>
                      <li>• Compare against contractor submittal</li>
                    </>
                  ) : (
                    <>
                      <li>• Count installed fixtures and verify against proposal</li>
                      <li>• Verify DLC-listed products match specifications</li>
                      <li>• Document any discrepancies</li>
                      <li>• Confirm proper installation</li>
                      <li>• Calculate final savings and incentive</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
              <Button variant="outline" onClick={() => setShowNewAuditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAudit}>
                <Plus className="w-4 h-4 mr-2" />
                Start {newAuditType === 'pre' ? 'Pre' : 'Post'}-Inspection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
