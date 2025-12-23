'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert } from '@/components/ui';
import { 
  Camera, 
  Upload, 
  X, 
  Tag, 
  Image as ImageIcon, 
  Trash2,
  Edit2,
  Check,
  Filter,
  Grid,
  List,
  Link2,
  Fan,
  Lightbulb,
  Thermometer
} from 'lucide-react';
import { AuditPhoto, PhotoCategory, PHOTO_CATEGORIES, generateId, AuditHVACUnit, AuditLightingZone, AuditEquipment } from '@/lib/auditor/types';

interface PhotoDocumentationProps {
  photos: AuditPhoto[];
  onPhotosChange: (photos: AuditPhoto[]) => void;
  rooms?: { id: string; name: string }[];
  // Equipment linking
  hvacUnits?: AuditHVACUnit[];
  lightingZones?: AuditLightingZone[];
  equipment?: AuditEquipment[];
  onLinkPhotoToHVAC?: (photoId: string, hvacId: string) => void;
  onLinkPhotoToLighting?: (photoId: string, lightingId: string) => void;
  onLinkPhotoToEquipment?: (photoId: string, equipmentId: string) => void;
}

export function PhotoDocumentation({ 
  photos, 
  onPhotosChange, 
  rooms = [],
  hvacUnits = [],
  lightingZones = [],
  equipment = [],
  onLinkPhotoToHVAC,
  onLinkPhotoToLighting,
  onLinkPhotoToEquipment,
}: PhotoDocumentationProps) {
  const [selectedCategory, setSelectedCategory] = useState<PhotoCategory | 'all'>('all');
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [captureCategory, setCaptureCategory] = useState<PhotoCategory>('general');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection with category
  const handleFileSelect = useCallback(async (files: FileList | null, category: PhotoCategory = captureCategory) => {
    if (!files) return;

    const newPhotos: AuditPhoto[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        // Resize image to reduce storage size
        const dataUrl = await resizeImage(file, 1200, 0.8);
        
        newPhotos.push({
          id: generateId(),
          dataUrl,
          fileName: file.name,
          category: category,
          label: '',
          notes: '',
          timestamp: new Date().toISOString(),
          size: dataUrl.length,
        });
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }

    if (newPhotos.length > 0) {
      onPhotosChange([...photos, ...newPhotos]);
      setShowUploadArea(false);
      setShowCategoryPicker(false);
    }
  }, [photos, onPhotosChange, captureCategory]);

  // Resize image to reduce storage size
  const resizeImage = (file: File, maxWidth: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Update photo
  const updatePhoto = useCallback((id: string, updates: Partial<AuditPhoto>) => {
    onPhotosChange(
      photos.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, [photos, onPhotosChange]);

  // Delete photo
  const deletePhoto = useCallback((id: string) => {
    onPhotosChange(photos.filter((p) => p.id !== id));
  }, [photos, onPhotosChange]);

  // Filter photos by category
  const filteredPhotos = selectedCategory === 'all'
    ? photos
    : photos.filter((p) => p.category === selectedCategory);

  // Get count per category
  const getCategoryCount = (category: PhotoCategory) => 
    photos.filter((p) => p.category === category).length;

  // Quick capture with category
  const handleQuickCapture = (category: PhotoCategory) => {
    setCaptureCategory(category);
    setShowCategoryPicker(false);
    setTimeout(() => cameraInputRef.current?.click(), 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Photo Documentation</h2>
          <p className="text-sm text-gray-600">{photos.length} photos captured</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            
            {/* Category Picker Dropdown */}
            {showCategoryPicker && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
                <div className="p-2 border-b">
                  <p className="text-xs font-medium text-gray-500 uppercase">Select Category First</p>
                </div>
                <div className="p-2 grid grid-cols-2 gap-1">
                  {PHOTO_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleQuickCapture(cat.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-left rounded hover:bg-gray-100 transition-colors"
                    >
                      {cat.id === 'hvac' && <Fan className="w-4 h-4 text-blue-500" />}
                      {cat.id === 'lighting' && <Lightbulb className="w-4 h-4 text-yellow-500" />}
                      {cat.id === 'refrigeration' && <Thermometer className="w-4 h-4 text-cyan-500" />}
                      {!['hvac', 'lighting', 'refrigeration'].includes(cat.id) && <Tag className="w-4 h-4 text-gray-400" />}
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div className="p-2 border-t">
                  <button
                    onClick={() => {
                      setCaptureCategory('general');
                      setShowCategoryPicker(false);
                      cameraInputRef.current?.click();
                    }}
                    className="w-full px-3 py-2 text-sm text-center text-gray-600 hover:bg-gray-100 rounded"
                  >
                    Skip — Categorize Later
                  </button>
                </div>
              </div>
            )}
          </div>
          <Button onClick={() => setShowUploadArea(!showUploadArea)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files, captureCategory)}
        />
      </div>

      {/* Upload Area */}
      {showUploadArea && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
            handleFileSelect(e.dataTransfer.files);
          }}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">
            <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-sm text-gray-500">PNG, JPG, HEIC up to 10MB each</p>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({photos.length})
        </button>
        {PHOTO_CATEGORIES.map((cat) => {
          const count = getCategoryCount(cat.id);
          if (count === 0 && selectedCategory !== cat.id) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
        
        {/* View Toggle */}
        <div className="ml-auto flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Photo Grid/List */}
      {filteredPhotos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {photos.length === 0 
                ? 'No photos yet. Take or upload photos to document the site.'
                : 'No photos in this category.'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              isEditing={editingPhoto === photo.id}
              onEdit={() => setEditingPhoto(photo.id)}
              onSave={() => setEditingPhoto(null)}
              onUpdate={(updates) => updatePhoto(photo.id, updates)}
              onDelete={() => deletePhoto(photo.id)}
              rooms={rooms}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPhotos.map((photo) => (
            <PhotoListItem
              key={photo.id}
              photo={photo}
              isEditing={editingPhoto === photo.id}
              onEdit={() => setEditingPhoto(photo.id)}
              onSave={() => setEditingPhoto(null)}
              onUpdate={(updates) => updatePhoto(photo.id, updates)}
              onDelete={() => deletePhoto(photo.id)}
              rooms={rooms}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Photo Card Component (Grid View)
interface PhotoItemProps {
  photo: AuditPhoto;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onUpdate: (updates: Partial<AuditPhoto>) => void;
  onDelete: () => void;
  rooms: { id: string; name: string }[];
}

function PhotoCard({ photo, isEditing, onEdit, onSave, onUpdate, onDelete, rooms }: PhotoItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const category = PHOTO_CATEGORIES.find((c) => c.id === photo.category);

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-square">
        <img
          src={photo.dataUrl}
          alt={photo.label || 'Audit photo'}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white rounded-full hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 bg-white rounded-full hover:bg-red-100 text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Category Badge */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded">
            {category?.label || 'General'}
          </span>
        </div>
      </div>

      {/* Info/Edit Area */}
      <CardContent className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={photo.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Label"
              className="w-full px-2 py-1 text-sm border rounded"
            />
            <select
              value={photo.category}
              onChange={(e) => onUpdate({ category: e.target.value as PhotoCategory })}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              {PHOTO_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <textarea
              value={photo.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Notes..."
              rows={2}
              className="w-full px-2 py-1 text-sm border rounded resize-none"
            />
            <Button size="sm" className="w-full" onClick={onSave}>
              <Check className="w-3 h-3 mr-1" />
              Done
            </Button>
          </div>
        ) : (
          <div>
            <p className="font-medium text-sm text-gray-900 truncate">
              {photo.label || 'Untitled'}
            </p>
            {photo.notes && (
              <p className="text-xs text-gray-500 truncate">{photo.notes}</p>
            )}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-4">
          <p className="text-sm text-gray-700 mb-3">Delete this photo?</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// Photo List Item Component (List View)
function PhotoListItem({ photo, isEditing, onEdit, onSave, onUpdate, onDelete, rooms }: PhotoItemProps) {
  const category = PHOTO_CATEGORIES.find((c) => c.id === photo.category);

  return (
    <Card>
      <CardContent className="p-4 flex gap-4">
        {/* Thumbnail */}
        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <img
            src={photo.dataUrl}
            alt={photo.label || 'Audit photo'}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={photo.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="Label"
                  className="flex-1 px-2 py-1 text-sm border rounded"
                />
                <select
                  value={photo.category}
                  onChange={(e) => onUpdate({ category: e.target.value as PhotoCategory })}
                  className="px-2 py-1 text-sm border rounded"
                >
                  {PHOTO_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={photo.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="Notes..."
                rows={2}
                className="w-full px-2 py-1 text-sm border rounded resize-none"
              />
              <Button size="sm" onClick={onSave}>
                <Check className="w-3 h-3 mr-1" />
                Done
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {photo.label || 'Untitled'}
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded mt-1">
                    {category?.label || 'General'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={onEdit}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              {photo.notes && (
                <p className="text-sm text-gray-600 mt-2">{photo.notes}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                {new Date(photo.timestamp).toLocaleString()}
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
