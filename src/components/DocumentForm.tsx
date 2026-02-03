import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Save, FileText, Lock, Tag, ExternalLink, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Document } from '@/types/crm-advanced';
import type { Account, Contact } from '@/types/crm';

interface DocumentFormProps {
  document?: Document | null;
  accounts: Account[];
  contacts: Contact[];
  onSave: (document: Document) => void;
  onCancel: () => void;
}

export default function DocumentForm({ document, accounts, contacts, onSave, onCancel }: DocumentFormProps) {
  const [formData, setFormData] = useState({
    name: document?.name || '',
    type: document?.type || 'other',
    category: document?.category || '',
    description: document?.description || '',
    relatedId: document?.relatedId || '',
    relatedType: document?.relatedType || 'account',
    isConfidential: document?.isConfidential || false,
    tags: document?.tags || []
  });

  const [newTag, setNewTag] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // SharePoint configuration
  const sharePointSite = "https://diageo.sharepoint.com/sites/CommercialAnalytics314/Strategic%20Accounts%20Document";
  const sharePointLibrary = "Strategic Accounts Document";

  const documentTypes = [
    { value: 'contract', label: 'Contract', folder: 'Contracts' },
    { value: 'proposal', label: 'Proposal', folder: 'Proposals' },
    { value: 'presentation', label: 'Presentation', folder: 'Presentations' },
    { value: 'meeting-notes', label: 'Meeting Notes', folder: 'Meeting_Notes' },
    { value: 'report', label: 'Report', folder: 'Reports' },
    { value: 'other', label: 'Other', folder: 'General' }
  ];

  const categories = [
    'Legal', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 
    'Strategy', 'Meetings', 'Notes', 'Compliance', 'Training'
  ];

  useEffect(() => {
    if (formData.relatedId && formData.relatedType === 'account') {
      const account = accounts.find(acc => acc.id === formData.relatedId);
      setSelectedAccount(account || null);
    } else if (formData.relatedId && formData.relatedType === 'contact') {
      const contact = contacts.find(cont => cont.id === formData.relatedId);
      setSelectedContact(contact || null);
    }
  }, [formData.relatedId, formData.relatedType, accounts, contacts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const selectedType = documentTypes.find(t => t.value === formData.type);
    const folder = selectedType?.folder || 'General';
    
    const documentData: Document = {
      id: document?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type as Document['type'],
      category: formData.category,
      fileUrl: document?.fileUrl || `${sharePointSite}/${sharePointLibrary}/${folder}/${formData.name}`,
      fileSize: document?.fileSize || 0,
      mimeType: document?.mimeType || 'application/octet-stream',
      relatedId: formData.relatedId || undefined,
      relatedType: formData.relatedType as 'account' | 'contact' | undefined,
      uploadedBy: document?.uploadedBy || 'Current User',
      uploadedAt: document?.uploadedAt || now,
      lastModified: now,
      version: document ? (document.version + 1) : 1,
      description: formData.description,
      tags: formData.tags,
      isConfidential: formData.isConfidential,
      sharePointPath: `${sharePointSite}/${sharePointLibrary}/${folder}/`,
      sharePointId: document?.sharePointId || `SP${Date.now()}`
    };

    onSave(documentData);
  };

  const handleRelatedChange = (value: string) => {
    setFormData(prev => ({ ...prev, relatedId: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'contract': return '📄';
      case 'proposal': return '📋';
      case 'presentation': return '📊';
      case 'meeting-notes': return '📝';
      case 'report': return '📈';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'text-red-600 bg-red-50 border-red-200';
      case 'proposal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'presentation': return 'text-green-600 bg-green-50 border-green-200';
      case 'meeting-notes': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'report': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const selectedTypeInfo = documentTypes.find(t => t.value === formData.type);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6" />
          {document ? 'Edit Document' : 'Add New Document'}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Document Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter document name with extension (e.g., Contract_2024.pdf)"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Document Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(type.value)}</span>
                          <span>{type.label}</span>
                          <span className="text-xs text-gray-500">→ {type.folder}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTypeInfo && (
                  <p className="text-xs text-gray-600 mt-1">
                    Will be stored in SharePoint folder: <strong>{selectedTypeInfo.folder}</strong>
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SharePoint Location */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <ExternalLink className="w-5 h-5" />
              SharePoint Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-blue-800">
              <p><strong>Site:</strong> {sharePointSite}</p>
              <p><strong>Library:</strong> {sharePointLibrary}</p>
              <p><strong>Folder:</strong> {selectedTypeInfo?.folder || 'General'}</p>
              <p><strong>Full Path:</strong> {sharePointSite}/{sharePointLibrary}/{selectedTypeInfo?.folder || 'General'}/{formData.name || '[filename]'}</p>
            </div>
            {document && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Changes to document type or name will update the SharePoint location. The physical file may need to be moved manually in SharePoint.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Related Records */}
        <Card>
          <CardHeader>
            <CardTitle>Related Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Associate with</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="relatedType" className="text-sm">Type</Label>
                  <Select value={formData.relatedType} onValueChange={(value) => setFormData(prev => ({ ...prev, relatedType: value, relatedId: '' }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="relatedRecord" className="text-sm">Record</Label>
                  <Select value={formData.relatedId} onValueChange={handleRelatedChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${formData.relatedType}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {formData.relatedType === 'account' 
                        ? accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.accountName}
                            </SelectItem>
                          ))
                        : contacts.map(contact => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.firstName} {contact.lastName}
                            </SelectItem>
                          ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedAccount && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="text-sm">
                    <p><strong>Account:</strong> {selectedAccount.accountName}</p>
                    <p><strong>Industry:</strong> {selectedAccount.industry || 'Not specified'}</p>
                    <p><strong>Owner:</strong> {selectedAccount.accountOwner || 'Not assigned'}</p>
                    <p><strong>Status:</strong> {selectedAccount.accountStatus || 'Not specified'}</p>
                  </div>
                </div>
              )}
              {selectedContact && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="text-sm">
                    <p><strong>Contact:</strong> {selectedContact.firstName} {selectedContact.lastName}</p>
                    <p><strong>Title:</strong> {selectedContact.title || 'Not specified'}</p>
                    <p><strong>Email:</strong> {selectedContact.email}</p>
                    <p><strong>Type:</strong> {selectedContact.contactType}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags & Security */}
        <Card>
          <CardHeader>
            <CardTitle>Tags & Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="confidential" 
                checked={formData.isConfidential}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isConfidential: !!checked }))}
              />
              <Label htmlFor="confidential" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Mark as confidential
              </Label>
            </div>
            {formData.isConfidential && (
              <Alert className="border-red-200 bg-red-50">
                <Lock className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  This document will be marked as confidential and may have restricted access in SharePoint.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Document Summary */}
        <Card className={`border-2 ${getTypeColor(formData.type)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFileIcon(formData.type)}</span>
                  <div>
                    <p className="font-semibold">{formData.name || 'Untitled Document'}</p>
                    <p className="text-sm text-gray-600">{formData.category || 'No category'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getTypeColor(formData.type)}>
                    {selectedTypeInfo?.label || formData.type}
                  </Badge>
                  {formData.isConfidential && (
                    <Badge variant="destructive">
                      <Lock className="w-3 h-3 mr-1" />
                      Confidential
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>SharePoint: {selectedTypeInfo?.folder || 'General'}</p>
                <p>Version: {document ? document.version + 1 : 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {document ? 'Update Document' : 'Save Document'}
          </Button>
        </div>
      </form>
    </div>
  );
}