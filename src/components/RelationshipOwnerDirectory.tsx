import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Save, X, Mail, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { RelationshipOwner } from '@/types/crm';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

interface RelationshipOwnerDirectoryProps {
  onBack: () => void;
}

export default function RelationshipOwnerDirectory({ onBack }: RelationshipOwnerDirectoryProps) {
  const [owners, setOwners] = useState<RelationshipOwner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<RelationshipOwner>>({
    name: '',
    email: '',
    teamsChannelId: '',
    teamsChatId: '',
    vicePresident: '',
    department: '',
    phone: '',
    notificationPreference: 'both'
  });

  useEffect(() => {
    const savedOwners = loadFromStorage<RelationshipOwner[]>('crm-relationship-owners', []);
    setOwners(savedOwners);
  }, []);

  const saveOwners = (updatedOwners: RelationshipOwner[]) => {
    setOwners(updatedOwners);
    saveToStorage('crm-relationship-owners', updatedOwners);
  };

  const handleAdd = () => {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required');
      return;
    }

    // Clean and validate email
    const cleanEmail = formData.email.trim().replace(/[\r\n\t]/g, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    const newOwner: RelationshipOwner = {
      id: `owner-${Date.now()}`,
      name: formData.name.trim(),
      email: cleanEmail,
      teamsChannelId: formData.teamsChannelId?.trim() || undefined,
      teamsChatId: formData.teamsChatId?.trim() || undefined,
      vicePresident: formData.vicePresident?.trim() || '',
      department: formData.department?.trim() || undefined,
      phone: formData.phone?.trim() || undefined,
      notificationPreference: formData.notificationPreference || 'both',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    saveOwners([...owners, newOwner]);
    setIsAdding(false);
    resetForm();
  };

  const handleEdit = (owner: RelationshipOwner) => {
    setEditingId(owner.id);
    setFormData(owner);
  };

  const handleUpdate = () => {
    if (!formData.name || !formData.email) {
      alert('Name and Email are required');
      return;
    }

    // Clean and validate email
    const cleanEmail = formData.email.trim().replace(/[\r\n\t]/g, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    const updatedOwners = owners.map(owner =>
      owner.id === editingId
        ? { 
            ...owner, 
            ...formData, 
            name: formData.name?.trim(),
            email: cleanEmail,
            teamsChannelId: formData.teamsChannelId?.trim() || undefined,
            teamsChatId: formData.teamsChatId?.trim() || undefined,
            vicePresident: formData.vicePresident?.trim() || '',
            department: formData.department?.trim() || undefined,
            phone: formData.phone?.trim() || undefined,
            lastModified: new Date().toISOString() 
          }
        : owner
    );

    saveOwners(updatedOwners);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this relationship owner? This will not affect existing contacts.')) {
      saveOwners(owners.filter(owner => owner.id !== id));
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      teamsChannelId: '',
      teamsChatId: '',
      vicePresident: '',
      department: '',
      phone: '',
      notificationPreference: 'both'
    });
  };

  const filteredOwners = owners.filter(owner =>
    owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.vicePresident?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Relationship Owner Directory
          </h2>
          <p className="text-gray-600">Manage notification settings for relationship owners</p>
        </div>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
          <Plus className="w-4 h-4 mr-2" />
          Add Owner
        </Button>
      </div>

      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <MessageSquare className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          <strong>How to find Teams IDs:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li><strong>Teams Channel ID:</strong> Open Teams → Right-click channel → "Get link to channel" → Copy the ID from the URL</li>
            <li><strong>Teams Chat ID:</strong> Open 1-on-1 chat → Click "..." → "Get link to chat" → Copy the ID from the URL</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, or VP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{isAdding ? 'Add New' : 'Edit'} Relationship Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={(e) => {
                    // Clean email on blur to remove any whitespace
                    const cleanEmail = e.target.value.trim().replace(/[\r\n\t]/g, '');
                    setFormData({ ...formData, email: cleanEmail });
                  }}
                  placeholder="john.smith@company.com"
                />
              </div>
              <div>
                <Label htmlFor="vicePresident">Vice President</Label>
                <Input
                  id="vicePresident"
                  value={formData.vicePresident}
                  onChange={(e) => setFormData({ ...formData, vicePresident: e.target.value })}
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Sales"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="notificationPreference">Notification Preference</Label>
                <Select
                  value={formData.notificationPreference}
                  onValueChange={(value: 'email' | 'teams' | 'both') =>
                    setFormData({ ...formData, notificationPreference: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Only</SelectItem>
                    <SelectItem value="teams">Teams Only</SelectItem>
                    <SelectItem value="both">Both Email & Teams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="teamsChannelId">Teams Channel ID</Label>
                <Input
                  id="teamsChannelId"
                  value={formData.teamsChannelId}
                  onChange={(e) => setFormData({ ...formData, teamsChannelId: e.target.value })}
                  placeholder="19:abc123..."
                />
              </div>
              <div>
                <Label htmlFor="teamsChatId">Teams Chat ID (1-on-1)</Label>
                <Input
                  id="teamsChatId"
                  value={formData.teamsChatId}
                  onChange={(e) => setFormData({ ...formData, teamsChatId: e.target.value })}
                  placeholder="19:xyz789..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={isAdding ? handleAdd : handleUpdate}>
                <Save className="w-4 h-4 mr-2" />
                {isAdding ? 'Add' : 'Update'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Owners List */}
      <Card>
        <CardHeader>
          <CardTitle>Relationship Owners ({filteredOwners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredOwners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No relationship owners found</p>
                  <p className="text-sm mt-2">Add owners to manage notification settings</p>
                </div>
              ) : (
                filteredOwners.map(owner => (
                  <Card key={owner.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{owner.name}</h3>
                            {owner.notificationPreference === 'email' && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Email</span>
                            )}
                            {owner.notificationPreference === 'teams' && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Teams</span>
                            )}
                            {owner.notificationPreference === 'both' && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Email & Teams</span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{owner.email}</span>
                            </div>
                            {owner.phone && (
                              <div className="flex items-center gap-2">
                                <span>📞</span>
                                <span>{owner.phone}</span>
                              </div>
                            )}
                            {owner.vicePresident && (
                              <div className="flex items-center gap-2">
                                <span>👤</span>
                                <span>VP: {owner.vicePresident}</span>
                              </div>
                            )}
                            {owner.department && (
                              <div className="flex items-center gap-2">
                                <span>🏢</span>
                                <span>{owner.department}</span>
                              </div>
                            )}
                            {owner.teamsChannelId && (
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs truncate">Channel: {owner.teamsChannelId.substring(0, 20)}...</span>
                              </div>
                            )}
                            {owner.teamsChatId && (
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                <span className="text-xs truncate">Chat: {owner.teamsChatId.substring(0, 20)}...</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(owner)}
                            disabled={isAdding || editingId !== null}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(owner.id)}
                            disabled={isAdding || editingId !== null}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}