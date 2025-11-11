import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertTriangle, Plus, Filter, Search, Calendar, User, Send, Edit, Trash2 } from 'lucide-react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import TaskForm from './TaskForm';
import type { Task } from '@/types/crm-advanced';
import type { Account, Contact } from '@/types/crm';
import { loadFromStorage, saveToStorage } from '@/lib/storage';

interface TaskManagementProps {
  accounts: Account[];
  contacts?: Contact[];
  onBack: () => void;
}

export default function TaskManagement({ accounts, contacts = [], onBack }: TaskManagementProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Load tasks from localStorage and initialize with sample data if empty
  useEffect(() => {
    const savedTasks = loadFromStorage('crm-tasks', []);
    console.log('Loading tasks from localStorage:', savedTasks);
    
    if (savedTasks && savedTasks.length > 0) {
      setTasks(savedTasks);
    } else {
      // Initialize with sample data only if no tasks exist
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Follow up on Walmart proposal',
          description: 'Schedule meeting to discuss Q4 pricing proposal with procurement team',
          type: 'follow-up',
          priority: 'high',
          status: 'pending',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          dueDateAlert: true, // Enable alert for sample task
          assignedTo: 'Mora Ambrey',
          relatedId: 'account-1',
          relatedType: 'account',
          relatedName: 'Walmart Inc.',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedHours: 2,
          tags: ['proposal', 'pricing', 'urgent']
        },
        {
          id: '2',
          title: 'Prepare Target contract renewal',
          description: 'Review current contract terms and prepare renewal documentation',
          type: 'contract',
          priority: 'critical',
          status: 'in-progress',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          dueDateAlert: false, // No alert for this task
          assignedTo: 'Sarah Johnson',
          relatedId: 'account-2',
          relatedType: 'account',
          relatedName: 'Target Corporation',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedHours: 8,
          actualHours: 4,
          tags: ['contract', 'renewal', 'legal']
        },
        {
          id: '3',
          title: 'Research Costco expansion opportunities',
          description: 'Analyze potential for expanding product placement in western regions',
          type: 'research',
          priority: 'medium',
          status: 'pending',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          dueDateAlert: false, // No alert for this task
          assignedTo: 'Michael Chen',
          relatedId: 'account-3',
          relatedType: 'account',
          relatedName: 'Costco Wholesale',
          createdAt: new Date().toISOString(),
          estimatedHours: 12,
          tags: ['research', 'expansion', 'analysis']
        }
      ];
      setTasks(sampleTasks);
      saveToStorage('crm-tasks', sampleTasks);
      console.log('Initialized with sample tasks and saved to localStorage');
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      saveToStorage('crm-tasks', tasks);
      console.log('Saved tasks to localStorage:', tasks);
    }
  }, [tasks]);

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'follow-up': return '📞';
      case 'meeting': return '🤝';
      case 'proposal': return '📋';
      case 'contract': return '📄';
      case 'research': return '🔍';
      default: return '📌';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getAccountOwner = (relatedId: string, relatedType: string) => {
    if (relatedType === 'account') {
      const account = accounts.find(a => a.id === relatedId);
      return account?.accountOwner || 'Unknown';
    }
    return 'N/A';
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (assigneeFilter !== 'all' && task.assignedTo !== assigneeFilter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return task.title.toLowerCase().includes(searchLower) ||
             task.description?.toLowerCase().includes(searchLower) ||
             task.relatedName.toLowerCase().includes(searchLower) ||
             task.tags.some(tag => tag.toLowerCase().includes(searchLower));
    }
    
    return true;
  });

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
          }
        : task
    ));
  };

  const handleTaskSave = (taskData: Task) => {
    console.log('Saving task:', taskData);
    
    if (selectedTask) {
      // Update existing task
      setTasks(prev => {
        const updated = prev.map(task => 
          task.id === selectedTask.id ? taskData : task
        );
        console.log('Updated tasks:', updated);
        return updated;
      });
    } else {
      // Add new task
      setTasks(prev => {
        const updated = [...prev, taskData];
        console.log('Added new task, total tasks:', updated);
        return updated;
      });
    }
    
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setTaskToDelete(task);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      setTasks(prev => {
        const updated = prev.filter(task => task.id !== taskToDelete.id);
        console.log('Deleted task, remaining tasks:', updated);
        return updated;
      });
      setTaskToDelete(null);
    }
  };

  const generatePowerAutomateAlert = (task: Task) => {
    const accountOwner = getAccountOwner(task.relatedId, task.relatedType);
    const alertData = {
      taskId: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
      accountName: task.relatedName,
      accountOwner: accountOwner,
      status: task.status,
      type: task.type,
      dueDateAlert: task.dueDateAlert
    };
    
    // In a real implementation, this would make an HTTP request to Power Automate
    console.log('Power Automate Alert Generated:', alertData);
    
    // For demo purposes, show a success message
    alert(`Power Automate alert sent for task: ${task.title}\nAccount: ${task.relatedName}\nAccount Owner: ${accountOwner}\nAssigned To: ${task.assignedTo}\nDue Date Alert: ${task.dueDateAlert ? 'Enabled' : 'Disabled'}`);
  };

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignedTo)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6" />
            Task Management
          </h2>
          <p className="text-gray-600">Organize and track follow-ups, meetings, and deliverables</p>
        </div>
        <Button 
          onClick={() => {
            setSelectedTask(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{totalTasks}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingTasks}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Assignees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                {uniqueAssignees.map(assignee => (
                  <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No tasks match your current filters</p>
                  <p className="text-sm mt-2">Create a new task to get started</p>
                </div>
              ) : (
                filteredTasks.map(task => {
                  const daysUntil = getDaysUntilDue(task.dueDate);
                  const accountOwner = getAccountOwner(task.relatedId, task.relatedType);
                  
                  return (
                    <Card key={task.id} className={`${task.status === 'overdue' ? 'border-red-200 bg-red-50' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-2xl">{getTypeIcon(task.type)}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{task.title}</h3>
                                <Badge variant={getPriorityColor(task.priority)}>
                                  {task.priority}
                                </Badge>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                  {task.status.replace('-', ' ')}
                                </span>
                                {task.dueDateAlert && (
                                  <Badge variant="outline" className="text-yellow-600 bg-yellow-50 border-yellow-200">
                                    🔔 Alert On
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {task.status === 'overdue' ? `${Math.abs(daysUntil)} days overdue` : 
                                   daysUntil === 0 ? 'Due today' :
                                   daysUntil === 1 ? 'Due tomorrow' :
                                   daysUntil > 0 ? `Due in ${daysUntil} days` :
                                   'Past due'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  {task.assignedTo}
                                </span>
                                <span>Account: {task.relatedName}</span>
                                <span>Owner: {accountOwner}</span>
                                {task.estimatedHours && (
                                  <span>{task.estimatedHours}h estimated</span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTask(task)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generatePowerAutomateAlert(task)}
                              className="flex items-center gap-1"
                            >
                              <Send className="w-4 h-4" />
                              Alert
                            </Button>
                            {task.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleTaskStatusChange(task.id, 'in-progress')}
                              >
                                Start
                              </Button>
                            )}
                            {task.status === 'in-progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleTaskStatusChange(task.id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                            {(task.status === 'pending' || task.status === 'in-progress') && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleTaskStatusChange(task.id, 'cancelled')}
                              >
                                Cancel
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setTaskToDelete(task)}
                                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{task.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setTaskToDelete(null)}>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={confirmDeleteTask} className="bg-red-600 hover:bg-red-700">
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TaskForm
            accounts={accounts}
            contacts={contacts}
            onSave={handleTaskSave}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <TaskForm
            task={selectedTask}
            accounts={accounts}
            contacts={contacts}
            onSave={handleTaskSave}
            onCancel={() => {
              setIsEditOpen(false);
              setSelectedTask(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}