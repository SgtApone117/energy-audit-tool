'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, Button, Input } from '@/components/ui';
import { 
  Plus, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Trash2,
  Edit2,
  Check,
  X,
  Camera,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  AuditFinding, 
  AuditPhoto, 
  FindingPriority, 
  FindingCategory,
  PHOTO_CATEGORIES,
  generateId 
} from '@/lib/auditor/types';

interface FindingsLoggerProps {
  findings: AuditFinding[];
  photos: AuditPhoto[];
  onFindingsChange: (findings: AuditFinding[]) => void;
}

const FINDING_CATEGORIES: { id: FindingCategory; label: string }[] = [
  ...PHOTO_CATEGORIES.map(c => ({ id: c.id as FindingCategory, label: c.label })),
  { id: 'safety', label: 'Safety' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'operational', label: 'Operational' },
];

const PRIORITY_CONFIG: Record<FindingPriority, { label: string; color: string; bgColor: string; icon: typeof AlertTriangle }> = {
  high: { label: 'High', color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle },
  medium: { label: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertCircle },
  low: { label: 'Low', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Info },
};

export function FindingsLogger({ findings, photos, onFindingsChange }: FindingsLoggerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<AuditFinding>>({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    location: '',
    recommendation: '',
    estimatedSavings: undefined,
    estimatedCost: undefined,
    photoIds: [],
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'general',
      priority: 'medium',
      location: '',
      recommendation: '',
      estimatedSavings: undefined,
      estimatedCost: undefined,
      photoIds: [],
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSave = useCallback(() => {
    if (!formData.title?.trim()) return;

    if (editingId) {
      // Update existing
      onFindingsChange(
        findings.map(f => 
          f.id === editingId 
            ? { ...f, ...formData } as AuditFinding
            : f
        )
      );
    } else {
      // Add new
      const newFinding: AuditFinding = {
        id: generateId(),
        title: formData.title || '',
        description: formData.description || '',
        category: formData.category || 'general',
        priority: formData.priority || 'medium',
        location: formData.location,
        recommendation: formData.recommendation,
        estimatedSavings: formData.estimatedSavings,
        estimatedCost: formData.estimatedCost,
        photoIds: formData.photoIds || [],
        createdAt: new Date().toISOString(),
      };
      onFindingsChange([...findings, newFinding]);
    }
    resetForm();
  }, [formData, editingId, findings, onFindingsChange]);

  const handleEdit = (finding: AuditFinding) => {
    setFormData(finding);
    setEditingId(finding.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    onFindingsChange(findings.filter(f => f.id !== id));
  };

  const getPhotoById = (id: string) => photos.find(p => p.id === id);

  // Sort findings by priority
  const sortedFindings = [...findings].sort((a, b) => {
    const order: Record<FindingPriority, number> = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  const getPriorityStats = () => {
    return {
      high: findings.filter(f => f.priority === 'high').length,
      medium: findings.filter(f => f.priority === 'medium').length,
      low: findings.filter(f => f.priority === 'low').length,
    };
  };

  const stats = getPriorityStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Findings & Issues</h2>
          <p className="text-sm text-gray-600">
            Document issues discovered during the audit
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Finding
        </Button>
      </div>

      {/* Stats */}
      {findings.length > 0 && (
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">{stats.high} High</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-700">{stats.medium} Medium</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{stats.low} Low</span>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">
                {editingId ? 'Edit Finding' : 'New Finding'}
              </h3>
              <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Duct leak at RTU-2 connection"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as FindingCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {FINDING_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as FindingPriority[]).map(priority => {
                    const config = PRIORITY_CONFIG[priority];
                    const Icon = config.icon;
                    return (
                      <button
                        key={priority}
                        onClick={() => setFormData({ ...formData, priority })}
                        className={`
                          flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg border-2 transition-colors
                          ${formData.priority === priority 
                            ? `${config.bgColor} border-current ${config.color}` 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{config.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <Input
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Rooftop, Main Office"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              {/* Recommendation */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recommendation
                </label>
                <textarea
                  value={formData.recommendation || ''}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What should be done to address this issue?"
                />
              </div>

              {/* Estimated Savings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Est. Annual Savings ($)
                </label>
                <Input
                  type="number"
                  value={formData.estimatedSavings || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedSavings: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g., 500"
                />
              </div>

              {/* Estimated Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Est. Implementation Cost ($)
                </label>
                <Input
                  type="number"
                  value={formData.estimatedCost || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g., 200"
                />
              </div>

              {/* Link Photos */}
              {photos.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Photos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {photos.slice(0, 12).map(photo => (
                      <button
                        key={photo.id}
                        onClick={() => {
                          const ids = formData.photoIds || [];
                          setFormData({
                            ...formData,
                            photoIds: ids.includes(photo.id)
                              ? ids.filter(id => id !== photo.id)
                              : [...ids, photo.id]
                          });
                        }}
                        className={`
                          relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors
                          ${formData.photoIds?.includes(photo.id) 
                            ? 'border-blue-500' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <img 
                          src={photo.dataUrl} 
                          alt={photo.label || photo.fileName}
                          className="w-full h-full object-cover"
                        />
                        {formData.photoIds?.includes(photo.id) && (
                          <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                            <Check className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.title?.trim()}>
                <Check className="w-4 h-4 mr-2" />
                {editingId ? 'Update' : 'Add'} Finding
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Findings List */}
      {sortedFindings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No findings yet</h3>
            <p className="text-gray-600 mb-4">
              Document issues as you discover them during the audit
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Finding
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedFindings.map(finding => {
            const config = PRIORITY_CONFIG[finding.priority];
            const Icon = config.icon;
            const isExpanded = expandedId === finding.id;
            const linkedPhotos = finding.photoIds.map(getPhotoById).filter(Boolean);

            return (
              <Card key={finding.id} className="overflow-hidden">
                <div 
                  className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-gray-50 ${config.bgColor}`}
                  onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                >
                  <Icon className={`w-5 h-5 mt-0.5 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{finding.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {finding.category} {finding.location && `• ${finding.location}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {linkedPhotos.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Camera className="w-3 h-3" />
                        {linkedPhotos.length}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <CardContent className="p-4 border-t space-y-4">
                    {finding.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p className="text-sm text-gray-600">{finding.description}</p>
                      </div>
                    )}

                    {finding.recommendation && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation</h4>
                        <p className="text-sm text-gray-600">{finding.recommendation}</p>
                      </div>
                    )}

                    {(finding.estimatedSavings || finding.estimatedCost) && (
                      <div className="flex gap-6">
                        {finding.estimatedSavings && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Est. Savings</h4>
                            <p className="text-lg font-semibold text-green-600">
                              ${finding.estimatedSavings.toLocaleString()}/yr
                            </p>
                          </div>
                        )}
                        {finding.estimatedCost && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Est. Cost</h4>
                            <p className="text-lg font-semibold text-gray-900">
                              ${finding.estimatedCost.toLocaleString()}
                            </p>
                          </div>
                        )}
                        {finding.estimatedSavings && finding.estimatedCost && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Payback</h4>
                            <p className="text-lg font-semibold text-blue-600">
                              {(finding.estimatedCost / finding.estimatedSavings).toFixed(1)} years
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {linkedPhotos.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                        <div className="flex gap-2 flex-wrap">
                          {linkedPhotos.map(photo => photo && (
                            <div key={photo.id} className="w-20 h-20 rounded-lg overflow-hidden border">
                              <img 
                                src={photo.dataUrl} 
                                alt={photo.label || photo.fileName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(finding)}>
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(finding.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
