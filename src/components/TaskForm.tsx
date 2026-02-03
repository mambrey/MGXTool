import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Calendar, Clock, User, Save, AlertTriangle, Upload, Paperclip, Trash2, AlertCircle, Bell } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Task } from '@/types/crm-advanced';
import type { Account, Contact } from '@/types/crm';

interface TaskFormProps {
  task?: Task | null;
  accounts: Account[];
  contacts?: Contact[];
  onSave: (task: Task) => void;
  onCancel: () => void;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export default function TaskForm({ task, accounts, contacts = [], onSave, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    type: task?.type || 'other',
    priority: task?.priority || 'medium',
    status: task?.status || 'pending',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    dueDateAlert: task?.dueDateAlert || false, // Add alert toggle
    assignedTo: task?.assignedTo || '',
    relatedId: task?.relatedId || '',
    relatedType: task?.relatedType || 'account',
    relatedName: task?.relatedName || '',
    estimatedHours: task?.estimatedHours || 0,
    actualHours: task?.actualHours || 0,
    tags: task?.tags || []
  });

  const [newTag, setNewTag] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>(task?.attachments || []);

  // Get unique relationship owners from contacts
  const getAvailableAssignees = () => {
    const relationshipOwners = new Set<string>();
    
    contacts.forEach(contact => {
      if (contact.relationshipOwner?.name && contact.relationshipOwner.name.trim()) {
        relationshipOwners.add(contact.relationshipOwner.name);
      }
    });

    // Convert to array and sort
    const assigneeList = Array.from(relationshipOwners).sort();
    
    // If no relationship owners found, provide some default options
    if (assigneeList.length === 0) {
      return [
        'Mora Ambrey',
        'John Smith',
        'Sarah Johnson', 
        'Michael Chen',
        'Emily Rodriguez',
        'David Kim',
        'Lisa Anderson'
      ];
    }
    
    return assigneeList;
  };

  const availableAssignees = getAvailableAssignees();

  useEffect(() => {
    if (formData.relatedId && formData.relatedType === 'account') {
      const account = accounts.find(acc => acc.id === formData.relatedId);
      if (account) {
        setSelectedAccount(account);
        setFormData(prev => ({ ...prev, relatedName: account.accountName }));
      }
    } else if (formData.relatedId && formData.relatedType === 'contact') {
      const contact = contacts.find(cont => cont.id === formData.relatedId);
      if (contact) {
        setSelectedContact(contact);
        setFormData(prev => ({ ...prev, relatedName: `${contact.firstName} ${contact.lastName}` }));
      }
    }
  }, [formData.relatedId, formData.relatedType, accounts, contacts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData: Task = {
      id: task?.id || Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type as Task['type'],
      priority: formData.priority as Task['priority'],
      status: formData.status as Task['status'],
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date().toISOString(),
      dueDateAlert: formData.dueDateAlert, // Include alert toggle
      assignedTo: formData.assignedTo,
      relatedId: formData.relatedId,
      relatedType: formData.relatedType as 'account' | 'contact',
      relatedName: formData.relatedName,
      estimatedHours: formData.estimatedHours,
      actualHours: formData.actualHours,
      tags: formData.tags,
      createdAt: task?.createdAt || new Date().toISOString(),
      completedAt: formData.status === 'completed' ? (task?.completedAt || new Date().toISOString()) : undefined,
      attachments: attachments
    };

    onSave(taskData);
  };

  const handleRelatedChange = (value: string, type: 'account' | 'contact') => {
    setFormData(prev => ({ 
      ...prev, 
      relatedId: value,
      relatedType: type
    }));
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const attachment: Attachment = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString()
        };
        setAttachments(prev => [...prev, attachment]);
      });
    }
    // Reset the input
    event.target.value = '';
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📋';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    return '📎';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'follow-up': return '📞';
      case 'meeting': return '🤝';
      case 'proposal': return '📋';
      case 'contract': return '📄';
      case 'research': return '🔍';
      default: return '📌';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const isOverdue = formData.dueDate && new Date(formData.dueDate) < new Date() && formData.status !== 'completed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-2xl">{getTypeIcon(formData.type)}</span>
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {isOverdue && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            This task is overdue! Due date was {new Date(formData.dueDate).toLocaleDateString()}.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the task details"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Task Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="follow-up">📞 Follow-up</SelectItem>
                    <SelectItem value="meeting">🤝 Meeting</SelectItem>
                    <SelectItem value="proposal">📋 Proposal</SelectItem>
                    <SelectItem value="contract">📄 Contract</SelectItem>
                    <SelectItem value="research">🔍 Research</SelectItem>
                    <SelectItem value="other">📌 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        Critical
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                        High
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Medium
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                        Low
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assignment & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Assignment & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assignedTo">Assigned To (Relationship Owner) *</Label>
                <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssignees.map(assignee => (
                      <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Assignees are pulled from relationship owners in your contacts
                </p>
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Due Date Alert Toggle */}
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Checkbox
                id="dueDateAlert"
                checked={formData.dueDateAlert}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dueDateAlert: checked as boolean }))}
              />
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-yellow-600" />
                <Label htmlFor="dueDateAlert" className="text-sm font-medium text-yellow-800">
                  Enable Due Date Alert
                </Label>
              </div>
            </div>
            
            {formData.dueDateAlert && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <Label className="text-sm font-medium text-blue-800">Power Automate Integration</Label>
                </div>
                <p className="text-sm text-blue-700">
                  ✅ Notifications enabled for this task
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Teams and email alerts will be sent when the due date approaches or passes
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="actualHours">Actual Hours</Label>
                <Input
                  id="actualHours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.actualHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, actualHours: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Records */}
        <Card>
          <CardHeader>
            <CardTitle>Related Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Related To</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div>
                  <Label htmlFor="relatedType" className="text-sm">Type</Label>
                  <Select value={formData.relatedType} onValueChange={(value) => setFormData(prev => ({ ...prev, relatedType: value, relatedId: '', relatedName: '' }))}>
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
                  <Select 
                    value={formData.relatedId} 
                    onValueChange={(value) => handleRelatedChange(value, formData.relatedType as 'account' | 'contact')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${formData.relatedType}`} />
                    </SelectTrigger>
                    <SelectContent>
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

        {/* Attachments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Attachments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fileUpload">Upload Files</Label>
              <div className="mt-2">
                <input
                  id="fileUpload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('fileUpload')?.click()}
                  className="w-full flex items-center gap-2 h-24 border-2 border-dashed border-gray-300 hover:border-gray-400"
                >
                  <Upload className="w-6 h-6 text-gray-400" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload files</p>
                    <p className="text-xs text-gray-500">or drag and drop files here</p>
                  </div>
                </Button>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Attached Files ({attachments.length})</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getFileIcon(attachment.type)}</span>
                        <div>
                          <p className="text-sm font-medium">{attachment.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
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
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Summary */}
        <Card className={`border-2 ${getPriorityColor(formData.priority)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getTypeIcon(formData.type)}</span>
                  <div>
                    <p className="font-semibold">{formData.title || 'Untitled Task'}</p>
                    <p className="text-sm text-gray-600">{formData.assignedTo || 'Unassigned'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getPriorityColor(formData.priority)}>
                    {formData.priority}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(formData.status)}>
                    {formData.status.replace('-', ' ')}
                  </Badge>
                  {formData.dueDateAlert && (
                    <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
                      <Bell className="w-3 h-3 mr-1" />
                      Alert On
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {formData.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(formData.dueDate).toLocaleDateString()}
                  </div>
                )}
                {formData.estimatedHours > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formData.estimatedHours}h
                  </div>
                )}
                {attachments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Paperclip className="w-4 h-4" />
                    {attachments.length} file{attachments.length !== 1 ? 's' : ''}
                  </div>
                )}
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
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  );
}