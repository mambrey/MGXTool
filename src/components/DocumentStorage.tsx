import React, { useState, useEffect } from 'react';
import { FileText, Upload, Download, Eye, Trash2, Search, Filter, FolderOpen, Lock, Tag, ExternalLink, Edit, Plus, RefreshCw, CloudUpload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import DocumentForm from './DocumentForm';
import type { Document } from '@/types/crm-advanced';
import type { Account, Contact } from '@/types/crm';
import { sharePointAuth } from '@/services/sharepoint-auth';
import { sharePointAPI } from '@/services/sharepoint-api';
import { sharePointConfig, isDemoMode } from '@/config/sharepoint';

interface DocumentStorageProps {
  accounts: Account[];
  contacts: Contact[];
  onBack: () => void;
}

export default function DocumentStorage({ accounts, contacts, onBack }: DocumentStorageProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [contactFilter, setContactFilter] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVersionUploadOpen, setIsVersionUploadOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [versionUploadDocument, setVersionUploadDocument] = useState<Document | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [uploadRelatedType, setUploadRelatedType] = useState<'account' | 'contact'>('account');
  const [uploadRelatedId, setUploadRelatedId] = useState<string>('');
  const [uploadDocumentType, setUploadDocumentType] = useState<Document['type']>('other');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadConfidential, setUploadConfidential] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [versionNotes, setVersionNotes] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // SharePoint configuration
  const sharePointSite = sharePointConfig.siteUrl;
  const sharePointLibrary = sharePointConfig.libraryName;
  const demoMode = isDemoMode();

  // Check authentication status on mount
  useEffect(() => {
    if (!demoMode) {
      setIsAuthenticated(sharePointAuth.isAuthenticated());
    }
  }, [demoMode]);

  // Load documents from localStorage on mount
  useEffect(() => {
    const storedDocs = localStorage.getItem('crm_documents');
    if (storedDocs) {
      setDocuments(JSON.parse(storedDocs));
    } else {
      // Initialize with sample data
      const sampleDocuments: Document[] = [
        {
          id: '1',
          name: 'Walmart_Q4_Contract_2024.pdf',
          type: 'contract',
          category: 'Legal',
          fileUrl: `${sharePointSite}/${sharePointLibrary}/Contracts/Walmart_Q4_Contract_2024.pdf`,
          fileSize: 2048576,
          mimeType: 'application/pdf',
          relatedId: accounts[0]?.id,
          relatedType: 'account',
          uploadedBy: 'John Smith',
          uploadedAt: '2024-10-15T10:30:00Z',
          lastModified: '2024-10-20T14:45:00Z',
          version: 2,
          description: 'Annual contract renewal with updated pricing terms',
          tags: ['contract', 'renewal', 'pricing'],
          isConfidential: true,
          sharePointPath: `${sharePointSite}/${sharePointLibrary}/Contracts/`,
          sharePointId: 'SP001'
        },
        {
          id: '2',
          name: 'Target_Expansion_Proposal.pptx',
          type: 'proposal',
          category: 'Sales',
          fileUrl: `${sharePointSite}/${sharePointLibrary}/Proposals/Target_Expansion_Proposal.pptx`,
          fileSize: 15728640,
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          relatedId: accounts[1]?.id,
          relatedType: 'account',
          uploadedBy: 'Sarah Johnson',
          uploadedAt: '2024-10-25T09:15:00Z',
          lastModified: '2024-10-25T09:15:00Z',
          version: 1,
          description: 'Proposal for expanding product placement in Target stores',
          tags: ['proposal', 'expansion', 'retail'],
          isConfidential: false,
          sharePointPath: `${sharePointSite}/${sharePointLibrary}/Proposals/`,
          sharePointId: 'SP002'
        },
        {
          id: '3',
          name: 'Costco_QBR_Presentation.pptx',
          type: 'presentation',
          category: 'Meetings',
          fileUrl: `${sharePointSite}/${sharePointLibrary}/Presentations/Costco_QBR_Presentation.pptx`,
          fileSize: 8912345,
          mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          relatedId: accounts[2]?.id,
          relatedType: 'account',
          uploadedBy: 'Michael Chen',
          uploadedAt: '2024-11-01T11:00:00Z',
          lastModified: '2024-11-01T11:00:00Z',
          version: 1,
          description: 'Q4 2024 Quarterly Business Review presentation',
          tags: ['qbr', 'quarterly', 'review'],
          isConfidential: false,
          sharePointPath: `${sharePointSite}/${sharePointLibrary}/Presentations/`,
          sharePointId: 'SP003'
        },
        {
          id: '4',
          name: 'Home_Depot_Meeting_Notes.docx',
          type: 'meeting-notes',
          category: 'Notes',
          fileUrl: `${sharePointSite}/${sharePointLibrary}/Meeting_Notes/Home_Depot_Meeting_Notes.docx`,
          fileSize: 524288,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          relatedId: accounts[3]?.id,
          relatedType: 'account',
          uploadedBy: 'Emily Rodriguez',
          uploadedAt: '2024-10-28T16:30:00Z',
          lastModified: '2024-10-28T16:30:00Z',
          version: 1,
          description: 'Notes from strategy meeting with Home Depot leadership',
          tags: ['meeting', 'strategy', 'notes'],
          isConfidential: true,
          sharePointPath: `${sharePointSite}/${sharePointLibrary}/Meeting_Notes/`,
          sharePointId: 'SP004'
        },
        {
          id: '5',
          name: 'Sarah_Johnson_Resume.pdf',
          type: 'other',
          category: 'HR',
          fileUrl: `${sharePointSite}/${sharePointLibrary}/Contact_Files/Sarah_Johnson_Resume.pdf`,
          fileSize: 1048576,
          mimeType: 'application/pdf',
          relatedId: contacts[0]?.id,
          relatedType: 'contact',
          uploadedBy: 'David Kim',
          uploadedAt: '2024-09-15T14:20:00Z',
          lastModified: '2024-09-15T14:20:00Z',
          version: 1,
          description: 'Professional background and contact information',
          tags: ['resume', 'background', 'contact'],
          isConfidential: true,
          sharePointPath: `${sharePointSite}/${sharePointLibrary}/Contact_Files/`,
          sharePointId: 'SP005'
        }
      ];
      setDocuments(sampleDocuments);
      localStorage.setItem('crm_documents', JSON.stringify(sampleDocuments));
    }
  }, [sharePointSite, sharePointLibrary, accounts, contacts]);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem('crm_documents', JSON.stringify(documents));
    }
  }, [documents]);

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return '📁';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('presentation')) return '📊';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📈';
    if (mimeType.includes('image')) return '🖼️';
    return '📁';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case 'contract': return 'default';
      case 'proposal': return 'secondary';
      case 'presentation': return 'outline';
      case 'meeting-notes': return 'destructive';
      case 'report': return 'default';
      default: return 'outline';
    }
  };

  const getRelatedName = (doc: Document) => {
    if (doc.relatedType === 'account' && doc.relatedId) {
      const account = accounts.find(a => a.id === doc.relatedId);
      return account ? account.accountName : 'Unknown Account';
    } else if (doc.relatedType === 'contact' && doc.relatedId) {
      const contact = contacts.find(c => c.id === doc.relatedId);
      return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
    }
    return 'No relation';
  };

  const getSharePointFolder = (type: Document['type']) => {
    switch (type) {
      case 'contract': return 'Contracts';
      case 'proposal': return 'Proposals';
      case 'presentation': return 'Presentations';
      case 'meeting-notes': return 'Meeting_Notes';
      case 'report': return 'Reports';
      default: return 'General';
    }
  };

  const getMimeType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  };

  const filteredDocuments = documents.filter(doc => {
    if (typeFilter !== 'all' && doc.type !== typeFilter) return false;
    if (accountFilter !== 'all') {
      if (doc.relatedType === 'account' && doc.relatedId !== accountFilter) return false;
      if (doc.relatedType === 'contact') {
        const contact = contacts.find(c => c.id === doc.relatedId);
        if (!contact || contact.accountId !== accountFilter) return false;
      }
    }
    if (contactFilter !== 'all' && doc.relatedId !== contactFilter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const relatedName = getRelatedName(doc).toLowerCase();
      return doc.name.toLowerCase().includes(searchLower) ||
             doc.description?.toLowerCase().includes(searchLower) ||
             relatedName.includes(searchLower) ||
             doc.tags.some(tag => tag.toLowerCase().includes(searchLower));
    }
    
    return true;
  });

  const handleDocumentSave = (documentData: Document) => {
    if (editingDocument) {
      // Update existing document
      setDocuments(prev => prev.map(doc => 
        doc.id === editingDocument.id ? documentData : doc
      ));
    } else {
      // Add new document
      setDocuments(prev => [...prev, documentData]);
    }
    
    setIsUploadOpen(false);
    setIsEditOpen(false);
    setEditingDocument(null);
  };

  const handleEditDocument = (doc: Document) => {
    setEditingDocument(doc);
    setIsEditOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
    setUploadError(null);
  };

  const handleVersionFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVersionFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const dt = new DataTransfer();
      Array.from(e.dataTransfer.files).forEach(file => dt.items.add(file));
      setSelectedFiles(dt.files);
      setUploadError(null);
    }
  };

  const handleSignIn = async () => {
    try {
      await sharePointAuth.login();
      setIsAuthenticated(true);
      setUploadError(null);
    } catch (error) {
      console.error('Sign in failed:', error);
      setUploadError('Failed to sign in. Please try again.');
    }
  };

  const storeFileInLocalStorage = async (file: File, documentId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileData = e.target?.result as string;
          localStorage.setItem(`file_${documentId}`, fileData);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUploadSubmit = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadError('Please select at least one file');
      return;
    }

    if (!uploadRelatedId) {
      setUploadError('Please select an account or contact to associate with');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const folder = getSharePointFolder(uploadDocumentType);
    const now = new Date().toISOString();
    
    // Parse tags
    const tagsArray = uploadTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      const newDocuments: Document[] = [];

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const documentId = `doc-${Date.now()}-${index}`;
        let sharePointUrl = '';
        let sharePointId = '';

        if (demoMode) {
          // Demo mode: Store in localStorage
          await storeFileInLocalStorage(file, documentId);
          sharePointUrl = `${sharePointSite}/${sharePointLibrary}/${folder}/${file.name}`;
          sharePointId = `SP-${Date.now()}-${index}`;
          console.log('Demo mode: File stored in localStorage');
        } else {
          // Production mode: Upload to SharePoint
          if (!isAuthenticated) {
            throw new Error('Please sign in to upload to SharePoint');
          }

          const uploadResult = await sharePointAPI.uploadFile({
            siteUrl: sharePointSite,
            libraryName: sharePointLibrary,
            folderPath: folder,
            file: file,
            fileName: file.name
          });

          sharePointUrl = uploadResult.serverRelativeUrl;
          sharePointId = uploadResult.uniqueId;
          console.log('File uploaded to SharePoint:', uploadResult);
        }

        const newDoc: Document = {
          id: documentId,
          name: file.name,
          type: uploadDocumentType,
          category: uploadDocumentType === 'contract' ? 'Legal' : 
                   uploadDocumentType === 'proposal' ? 'Sales' : 
                   uploadDocumentType === 'meeting-notes' ? 'Notes' : 'General',
          fileUrl: sharePointUrl,
          fileSize: file.size,
          mimeType: getMimeType(file.name),
          relatedId: uploadRelatedId,
          relatedType: uploadRelatedType,
          uploadedBy: demoMode ? 'Current User' : sharePointAuth.getCurrentAccount()?.name || 'Current User',
          uploadedAt: now,
          lastModified: now,
          version: 1,
          description: uploadDescription || `Uploaded ${file.name}`,
          tags: tagsArray.length > 0 ? tagsArray : [uploadDocumentType, folder.toLowerCase()],
          isConfidential: uploadConfidential,
          sharePointPath: `${sharePointSite}/${sharePointLibrary}/${folder}/`,
          sharePointId: sharePointId
        };

        newDocuments.push(newDoc);
      }

      // Add new documents to the list
      setDocuments(prev => [...prev, ...newDocuments]);

      // Reset form and close dialog
      setSelectedFiles(null);
      setUploadDescription('');
      setUploadConfidential(false);
      setUploadRelatedId('');
      setUploadDocumentType('other');
      setUploadTags('');
      setIsUploadOpen(false);
      setUploadError(null);

      alert(`Successfully uploaded ${newDocuments.length} file(s) to ${demoMode ? 'local storage (demo mode)' : 'SharePoint'}`);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadNewVersion = async () => {
    if (!versionFile || !versionUploadDocument) {
      alert('Please select a file');
      return;
    }

    const now = new Date().toISOString();
    const newVersion = versionUploadDocument.version + 1;
    
    try {
      if (demoMode) {
        // Store new version in localStorage
        await storeFileInLocalStorage(versionFile, versionUploadDocument.id);
      } else {
        // Upload new version to SharePoint
        if (!isAuthenticated) {
          throw new Error('Please sign in to upload to SharePoint');
        }

        const folder = getSharePointFolder(versionUploadDocument.type);
        await sharePointAPI.uploadFile({
          siteUrl: sharePointSite,
          libraryName: sharePointLibrary,
          folderPath: folder,
          file: versionFile,
          fileName: versionUploadDocument.name
        });
      }

      // Update document with new version
      const updatedDocument: Document = {
        ...versionUploadDocument,
        version: newVersion,
        lastModified: now,
        fileSize: versionFile.size,
        description: versionNotes || versionUploadDocument.description
      };

      setDocuments(prev => prev.map(doc => 
        doc.id === versionUploadDocument.id ? updatedDocument : doc
      ));

      console.log(`New version ${newVersion} uploaded for ${versionUploadDocument.name}`);

      // Reset and close
      setVersionFile(null);
      setVersionNotes('');
      setVersionUploadDocument(null);
      setIsVersionUploadOpen(false);

      alert(`Successfully uploaded version ${newVersion}`);
    } catch (error) {
      console.error('Version upload failed:', error);
      alert('Failed to upload new version. Please try again.');
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Try to get file from localStorage first (demo mode)
      const storedFile = localStorage.getItem(`file_${doc.id}`);
      
      if (storedFile) {
        // Download from localStorage
        const link = window.document.createElement('a');
        link.href = storedFile;
        link.download = doc.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        console.log('File downloaded from local storage (demo mode)');
      } else if (!demoMode && isAuthenticated) {
        // Download from SharePoint
        const blob = await sharePointAPI.downloadFile(sharePointSite, doc.fileUrl);
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = doc.name;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('File downloaded from SharePoint');
      } else {
        // Fallback to opening URL
        window.open(doc.fileUrl, '_blank');
        console.log('Opening SharePoint URL');
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download file. Please try again.');
    }
  };

  const openInSharePoint = (doc: Document) => {
    // Open the SharePoint folder containing the document
    if (doc.sharePointPath) {
      window.open(doc.sharePointPath, '_blank');
    }
  };

  const handleDelete = (doc: Document) => {
    setDocumentToDelete(doc);
  };

  const confirmDelete = async () => {
    if (documentToDelete) {
      try {
        if (!demoMode && isAuthenticated) {
          // Delete from SharePoint
          await sharePointAPI.deleteFile(sharePointSite, documentToDelete.fileUrl);
        }

        // Remove from local state and localStorage
        setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));
        localStorage.removeItem(`file_${documentToDelete.id}`);
        console.log(`Document deleted: ${documentToDelete.name}`);
        setDocumentToDelete(null);
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete file. Please try again.');
      }
    }
  };

  const openVersionUploadDialog = (doc: Document) => {
    setVersionUploadDocument(doc);
    setIsVersionUploadOpen(true);
  };

  const totalDocuments = documents.length;
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
  const contractCount = documents.filter(d => d.type === 'contract').length;
  const proposalCount = documents.filter(d => d.type === 'proposal').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6" />
            Document Storage
          </h2>
          <p className="text-gray-600">Organize contracts, proposals, and presentations in SharePoint</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setEditingDocument(null);
              setIsUploadOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload to SharePoint
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setEditingDocument(null);
              setIsEditOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </Button>
        </div>
      </div>

      {/* Demo Mode Warning */}
      {demoMode && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-900">
            <strong>Demo Mode Active:</strong> Files are stored in browser localStorage. To upload to real SharePoint, please configure Azure AD authentication. 
            <a href="/SHAREPOINT_SETUP_GUIDE.md" target="_blank" className="underline ml-2">View Setup Guide</a>
          </AlertDescription>
        </Alert>
      )}

      {/* SharePoint Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">
              SharePoint Integration {demoMode ? '(Demo Mode)' : '(Connected)'}
            </h3>
          </div>
          <div className="space-y-1 text-sm text-blue-800">
            <p><strong>Site:</strong> {sharePointSite}</p>
            <p><strong>Document Library:</strong> {sharePointLibrary}</p>
            <p><strong>Folders:</strong> Contracts, Proposals, Presentations, Meeting_Notes, Contact_Files, Reports, General</p>
            {demoMode && (
              <p className="text-xs mt-2 italic">Files are stored in browser localStorage. Configure Azure AD to enable real SharePoint uploads.</p>
            )}
            {!demoMode && isAuthenticated && (
              <p className="text-xs mt-2 text-green-700 font-semibold">✓ Authenticated - Uploading to real SharePoint</p>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-3 border-blue-300 text-blue-700 hover:bg-blue-100"
            onClick={() => window.open(sharePointSite, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open SharePoint Site
          </Button>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{totalDocuments}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Size</p>
                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Contracts</p>
                <p className="text-2xl font-bold">{contractCount}</p>
              </div>
              <Lock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Proposals</p>
                <p className="text-2xl font-bold">{proposalCount}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
                <SelectItem value="presentation">Presentations</SelectItem>
                <SelectItem value="meeting-notes">Meeting Notes</SelectItem>
                <SelectItem value="report">Reports</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={accountFilter} onValueChange={setAccountFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Accounts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.accountName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={contactFilter} onValueChange={setContactFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Contacts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Contacts</SelectItem>
                {contacts.map(contact => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No documents match your current filters</p>
                </div>
              ) : (
                filteredDocuments.map(doc => (
                  <Card key={doc.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-2xl">{getFileIcon(doc.mimeType)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{doc.name}</h3>
                              <Badge variant={getTypeColor(doc.type)}>
                                {doc.type}
                              </Badge>
                              {doc.isConfidential && (
                                <Badge variant="destructive">
                                  <Lock className="w-3 h-3 mr-1" />
                                  Confidential
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">v{doc.version}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                              <span>{formatFileSize(doc.fileSize)}</span>
                              <span>Uploaded by {doc.uploadedBy}</span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                              <span>Related to: {getRelatedName(doc)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-600 mb-2">
                              <ExternalLink className="w-3 h-3" />
                              <span className="truncate">{doc.sharePointPath}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDocument(doc)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditDocument(doc)}
                            title="Edit Metadata"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(doc)}
                            title="Download File"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openVersionUploadDialog(doc)}
                            title="Upload New Version"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openInSharePoint(doc)}
                            title="Open in SharePoint"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                title="Delete Document"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{doc.name}"? This will also remove it from SharePoint and cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(doc)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      {/* Upload Dialog - REDESIGNED WITH REAL SHAREPOINT */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CloudUpload className="w-6 h-6 text-blue-600" />
              Upload to SharePoint
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Authentication Check */}
            {!demoMode && !isAuthenticated && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900">
                  <strong>Sign in required:</strong> Please sign in with your Microsoft account to upload files to SharePoint.
                  <Button 
                    onClick={handleSignIn}
                    size="sm"
                    className="ml-3"
                  >
                    Sign In with Microsoft
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* SharePoint Info Banner */}
            <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <ExternalLink className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Destination:</strong> {sharePointSite}/{sharePointLibrary}
                {demoMode && <span className="block text-xs mt-1">(Demo Mode - Files stored in browser)</span>}
              </AlertDescription>
            </Alert>

            {/* Error Display */}
            {uploadError && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-900">
                  {uploadError}
                </AlertDescription>
              </Alert>
            )}

            {/* File Upload Area - Enhanced */}
            <div className="space-y-2">
              <Label className="text-base font-semibold text-gray-900">Files</Label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <div className="text-center">
                  <CloudUpload className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Support for PDF, Word, Excel, PowerPoint, and more
                  </p>
                </div>
              </div>
              {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {selectedFiles.length} file(s) selected
                  </p>
                  <ul className="mt-2 space-y-1">
                    {Array.from(selectedFiles).map((file, idx) => (
                      <li key={idx} className="text-xs text-green-700 flex items-center gap-2">
                        <span>📄</span>
                        {file.name} ({formatFileSize(file.size)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Two Column Layout for Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-type" className="text-base font-semibold text-gray-900">
                    Document Type
                  </Label>
                  <Select value={uploadDocumentType} onValueChange={(value) => setUploadDocumentType(value as Document['type'])}>
                    <SelectTrigger className="mt-2 bg-white text-gray-900 border-gray-300" id="document-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="contract">📄 Contract</SelectItem>
                      <SelectItem value="proposal">📋 Proposal</SelectItem>
                      <SelectItem value="presentation">📊 Presentation</SelectItem>
                      <SelectItem value="meeting-notes">📝 Meeting Notes</SelectItem>
                      <SelectItem value="report">📈 Report</SelectItem>
                      <SelectItem value="other">📁 Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    → Saves to: {getSharePointFolder(uploadDocumentType)} folder
                  </p>
                </div>

                <div>
                  <Label htmlFor="related-type" className="text-base font-semibold text-gray-900">
                    Associate With
                  </Label>
                  <Select value={uploadRelatedType} onValueChange={(value: 'account' | 'contact') => setUploadRelatedType(value)}>
                    <SelectTrigger className="mt-2 bg-white text-gray-900 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="account">🏢 Account</SelectItem>
                      <SelectItem value="contact">👤 Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="related-entity" className="text-base font-semibold text-gray-900">
                    {uploadRelatedType === 'account' ? 'Account Name' : 'Contact Name'}
                  </Label>
                  <Select value={uploadRelatedId} onValueChange={setUploadRelatedId}>
                    <SelectTrigger className="mt-2 bg-white text-gray-900 border-gray-300">
                      <SelectValue placeholder={`Select ${uploadRelatedType}`} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {uploadRelatedType === 'account' 
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

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-base font-semibold text-gray-900">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the document..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="mt-2 bg-white text-gray-900 border-gray-300 min-h-[100px]"
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <Label htmlFor="tags" className="text-base font-semibold text-gray-900">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="e.g., contract, Q4, renewal (comma-separated)"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    className="mt-2 bg-white text-gray-900 border-gray-300"
                    disabled={isUploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate tags with commas for better organization
                  </p>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Checkbox 
                    id="confidential" 
                    checked={uploadConfidential}
                    onCheckedChange={(checked) => setUploadConfidential(checked as boolean)}
                    disabled={isUploading}
                  />
                  <Label htmlFor="confidential" className="text-sm font-medium text-gray-900 cursor-pointer flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-500" />
                    Mark as confidential
                  </Label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsUploadOpen(false)}
                className="px-6"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUploadSubmit}
                className="px-6 bg-blue-600 hover:bg-blue-700"
                disabled={isUploading || (!demoMode && !isAuthenticated)}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload to {demoMode ? 'Demo Storage' : 'SharePoint'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Upload Dialog */}
      <Dialog open={isVersionUploadOpen} onOpenChange={setIsVersionUploadOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Upload New Version</DialogTitle>
          </DialogHeader>
          {versionUploadDocument && (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-200">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Uploading new version for: <strong>{versionUploadDocument.name}</strong><br />
                  Current version: v{versionUploadDocument.version} → New version: v{versionUploadDocument.version + 1}
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="version-file" className="text-gray-900">Select File</Label>
                <Input
                  id="version-file"
                  type="file"
                  onChange={handleVersionFileSelect}
                  className="mt-1 bg-white text-gray-900"
                />
                {versionFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {versionFile.name} ({formatFileSize(versionFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="version-notes" className="text-gray-900">Version Notes</Label>
                <Textarea
                  id="version-notes"
                  placeholder="What changed in this version..."
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  className="mt-1 bg-white text-gray-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsVersionUploadOpen(false);
                  setVersionFile(null);
                  setVersionNotes('');
                  setVersionUploadDocument(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleUploadNewVersion}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Upload Version {versionUploadDocument.version + 1}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DocumentForm
            document={editingDocument}
            accounts={accounts}
            contacts={contacts}
            onSave={handleDocumentSave}
            onCancel={() => {
              setIsEditOpen(false);
              setEditingDocument(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-4xl bg-white">
            <DialogHeader>
              <DialogTitle className="text-gray-900">{selectedDocument.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-900">
                <div>
                  <strong>Type:</strong> {selectedDocument.type}
                </div>
                <div>
                  <strong>Size:</strong> {formatFileSize(selectedDocument.fileSize)}
                </div>
                <div>
                  <strong>Uploaded:</strong> {new Date(selectedDocument.uploadedAt).toLocaleString()}
                </div>
                <div>
                  <strong>Version:</strong> {selectedDocument.version}
                </div>
                <div>
                  <strong>Related to:</strong> {getRelatedName(selectedDocument)}
                </div>
                <div>
                  <strong>Uploaded by:</strong> {selectedDocument.uploadedBy}
                </div>
              </div>
              <div>
                <strong className="text-gray-900">SharePoint Location:</strong>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-blue-600">{selectedDocument.sharePointPath}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openInSharePoint(selectedDocument)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div>
                <strong className="text-gray-900">Description:</strong>
                <p className="mt-1 text-gray-700">{selectedDocument.description}</p>
              </div>
              <div className="bg-gray-100 p-8 rounded-lg text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Document preview would appear here</p>
                <p className="text-sm text-gray-500 mt-2">
                  In a real application, this would show the SharePoint document content
                </p>
                <div className="flex gap-2 justify-center mt-4">
                  <Button 
                    onClick={() => handleDownload(selectedDocument)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => openInSharePoint(selectedDocument)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in SharePoint
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}