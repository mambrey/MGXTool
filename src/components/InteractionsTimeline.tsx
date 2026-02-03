import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Calendar, FileText, TrendingUp, Plus, Filter, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import type { Interaction, RelationshipHealth } from '@/types/crm-advanced';

interface InteractionsTimelineProps {
  onBack: () => void;
}

export default function InteractionsTimeline({ onBack }: InteractionsTimelineProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [relationshipHealth, setRelationshipHealth] = useState<RelationshipHealth[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [relatedFilter, setRelatedFilter] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Sample data
  useEffect(() => {
    const sampleInteractions: Interaction[] = [
      {
        id: '1',
        type: 'call',
        title: 'Q4 Pricing Discussion',
        description: 'Discussed updated pricing structure for Q4. Sarah expressed concerns about margin impact but showed interest in volume commitments.',
        outcome: 'positive',
        nextAction: 'Send detailed pricing proposal with volume tiers',
        nextActionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        relatedId: 'contact-1',
        relatedType: 'contact',
        relatedName: 'Sarah Johnson - Walmart Inc.',
        participantIds: ['contact-1'],
        createdBy: 'John Smith',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 45,
        attachments: [],
        tags: ['pricing', 'q4', 'volume'],
        sentiment: 3,
        dealValue: 250000,
        probability: 75
      },
      {
        id: '2',
        type: 'meeting',
        title: 'Contract Renewal Meeting',
        description: 'In-person meeting at Target HQ to discuss contract renewal terms. Positive reception to our new sustainability initiatives.',
        outcome: 'positive',
        nextAction: 'Draft contract with sustainability clauses',
        nextActionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        relatedId: 'account-2',
        relatedType: 'account',
        relatedName: 'Target Corporation',
        participantIds: ['contact-2', 'contact-3'],
        createdBy: 'Sarah Johnson',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 120,
        location: 'Target HQ, Minneapolis',
        attachments: ['presentation-1', 'contract-draft-1'],
        tags: ['contract', 'renewal', 'sustainability'],
        sentiment: 4,
        dealValue: 500000,
        probability: 85
      },
      {
        id: '3',
        type: 'email',
        title: 'Product Demo Follow-up',
        description: 'Sent follow-up email after product demonstration. Included technical specifications and implementation timeline.',
        outcome: 'neutral',
        nextAction: 'Schedule technical deep-dive session',
        nextActionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        relatedId: 'account-3',
        relatedType: 'account',
        relatedName: 'Costco Wholesale',
        participantIds: ['contact-4'],
        createdBy: 'Michael Chen',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: ['tech-specs-1'],
        tags: ['demo', 'technical', 'follow-up'],
        sentiment: 2,
        dealValue: 150000,
        probability: 60
      },
      {
        id: '4',
        type: 'proposal',
        title: 'Expansion Proposal Submitted',
        description: 'Submitted comprehensive proposal for expanding into Home Depot\'s eastern region stores. Includes ROI projections and implementation plan.',
        outcome: 'pending',
        nextAction: 'Follow up on proposal review timeline',
        nextActionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        relatedId: 'account-4',
        relatedType: 'account',
        relatedName: 'The Home Depot',
        participantIds: ['contact-5'],
        createdBy: 'Emily Rodriguez',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: ['proposal-1', 'roi-analysis-1'],
        tags: ['proposal', 'expansion', 'roi'],
        sentiment: 3,
        dealValue: 750000,
        probability: 70
      },
      {
        id: '5',
        type: 'demo',
        title: 'Product Demonstration',
        description: 'Conducted live product demonstration for Kroger procurement team. Highlighted new features and cost savings potential.',
        outcome: 'positive',
        nextAction: 'Prepare pilot program proposal',
        nextActionDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        relatedId: 'account-5',
        relatedType: 'account',
        relatedName: 'Kroger Co.',
        participantIds: ['contact-6', 'contact-7'],
        createdBy: 'David Kim',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        duration: 90,
        location: 'Kroger Corporate Office',
        attachments: ['demo-slides-1'],
        tags: ['demo', 'pilot', 'cost-savings'],
        sentiment: 4,
        dealValue: 300000,
        probability: 80
      },
      {
        id: '6',
        type: 'social',
        title: 'LinkedIn Connection',
        description: 'Connected with new procurement director on LinkedIn. Shared industry insights and company updates.',
        outcome: 'positive',
        relatedId: 'contact-8',
        relatedType: 'contact',
        relatedName: 'Lisa Anderson - Various Accounts',
        participantIds: ['contact-8'],
        createdBy: 'Lisa Anderson',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        attachments: [],
        tags: ['social', 'linkedin', 'networking'],
        sentiment: 2
      }
    ];

    const sampleHealth: RelationshipHealth[] = [
      {
        contactId: 'contact-1',
        accountId: 'account-1',
        score: 85,
        trend: 'improving',
        lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        interactionFrequency: 4.2,
        responseRate: 92,
        sentimentAverage: 3.5,
        riskLevel: 'low',
        recommendations: ['Continue regular check-ins', 'Focus on value delivery'],
        lastCalculated: new Date().toISOString()
      },
      {
        contactId: 'contact-2',
        accountId: 'account-2',
        score: 78,
        trend: 'stable',
        lastInteraction: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        interactionFrequency: 3.1,
        responseRate: 88,
        sentimentAverage: 3.2,
        riskLevel: 'low',
        recommendations: ['Maintain current engagement level', 'Explore new opportunities'],
        lastCalculated: new Date().toISOString()
      },
      {
        contactId: 'contact-4',
        accountId: 'account-3',
        score: 62,
        trend: 'declining',
        lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        interactionFrequency: 2.1,
        responseRate: 65,
        sentimentAverage: 2.1,
        riskLevel: 'medium',
        recommendations: ['Increase engagement frequency', 'Address concerns proactively'],
        lastCalculated: new Date().toISOString()
      }
    ];

    setInteractions(sampleInteractions);
    setRelationshipHealth(sampleHealth);
  }, []);

  const getInteractionIcon = (type: Interaction['type']) => {
    switch (type) {
      case 'call': return <Phone className="w-5 h-5 text-blue-500" />;
      case 'email': return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'meeting': return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'proposal': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'demo': return <TrendingUp className="w-5 h-5 text-indigo-500" />;
      case 'contract': return <FileText className="w-5 h-5 text-red-500" />;
      case 'social': return <Heart className="w-5 h-5 text-pink-500" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getOutcomeColor = (outcome: Interaction['outcome']) => {
    switch (outcome) {
      case 'positive': return 'bg-green-100 text-green-800';
      case 'negative': return 'bg-red-100 text-red-800';
      case 'neutral': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentEmoji = (sentiment: number) => {
    if (sentiment >= 4) return '😊';
    if (sentiment >= 2) return '😐';
    if (sentiment >= 0) return '😔';
    return '😞';
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: RelationshipHealth['trend']) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const filteredInteractions = interactions.filter(interaction => {
    if (typeFilter !== 'all' && interaction.type !== typeFilter) return false;
    if (outcomeFilter !== 'all' && interaction.outcome !== outcomeFilter) return false;
    if (relatedFilter !== 'all' && interaction.relatedId !== relatedFilter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return interaction.title.toLowerCase().includes(searchLower) ||
             interaction.description.toLowerCase().includes(searchLower) ||
             interaction.relatedName.toLowerCase().includes(searchLower) ||
             interaction.tags.some(tag => tag.toLowerCase().includes(searchLower));
    }
    
    return true;
  });

  const totalInteractions = interactions.length;
  const positiveOutcomes = interactions.filter(i => i.outcome === 'positive').length;
  const averageSentiment = interactions.reduce((sum, i) => sum + (i.sentiment || 0), 0) / interactions.length;
  const totalDealValue = interactions.reduce((sum, i) => sum + (i.dealValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" onClick={onBack} className="mb-2">
            ← Back to Dashboard
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Interactions Timeline
          </h2>
          <p className="text-gray-600">Track communications and relationship health</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Log Interaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log New Interaction</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="interaction-title">Title</Label>
                <Input id="interaction-title" placeholder="Interaction title..." className="mt-1" />
              </div>
              <div>
                <Label htmlFor="interaction-description">Description</Label>
                <Textarea id="interaction-description" placeholder="Detailed description..." className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interaction-type">Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interaction-outcome">Outcome</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select outcome" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Sentiment Score: 3/5</Label>
                <Slider
                  defaultValue={[3]}
                  max={5}
                  min={-5}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="next-action">Next Action</Label>
                <Input id="next-action" placeholder="What's the next step?" className="mt-1" />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interactions</p>
                <p className="text-2xl font-bold">{totalInteractions}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Positive Outcomes</p>
                <p className="text-2xl font-bold text-green-600">{positiveOutcomes}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Sentiment</p>
                <p className="text-2xl font-bold">{averageSentiment.toFixed(1)}/5</p>
              </div>
              <div className="text-2xl">{getSentimentEmoji(averageSentiment)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-2xl font-bold">${(totalDealValue / 1000000).toFixed(1)}M</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relationship Health */}
      <Card>
        <CardHeader>
          <CardTitle>Relationship Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relationshipHealth.map(health => (
              <Card key={health.contactId} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Contact Health</h3>
                    <div className="flex items-center gap-1">
                      <span className={`text-2xl font-bold ${getHealthColor(health.score)}`}>
                        {health.score}
                      </span>
                      <span className="text-lg">{getTrendIcon(health.trend)}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Response Rate:</span>
                      <span>{health.responseRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interactions/Month:</span>
                      <span>{health.interactionFrequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Level:</span>
                      <Badge variant={health.riskLevel === 'low' ? 'outline' : health.riskLevel === 'medium' ? 'secondary' : 'destructive'}>
                        {health.riskLevel}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-gray-600 mb-1">Recommendations:</p>
                    <ul className="text-xs text-gray-700 space-y-1">
                      {health.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search interactions..."
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
                <SelectItem value="call">Phone Calls</SelectItem>
                <SelectItem value="email">Emails</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="proposal">Proposals</SelectItem>
                <SelectItem value="demo">Demos</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="social">Social</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Outcomes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={relatedFilter} onValueChange={setRelatedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Accounts/Contacts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts/Contacts</SelectItem>
                <SelectItem value="account-1">Walmart Inc.</SelectItem>
                <SelectItem value="account-2">Target Corporation</SelectItem>
                <SelectItem value="account-3">Costco Wholesale</SelectItem>
                <SelectItem value="account-4">The Home Depot</SelectItem>
                <SelectItem value="account-5">Kroger Co.</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Interaction Timeline ({filteredInteractions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {filteredInteractions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No interactions match your current filters</p>
                </div>
              ) : (
                filteredInteractions.map((interaction, index) => (
                  <div key={interaction.id} className="relative">
                    {index !== filteredInteractions.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center">
                        {getInteractionIcon(interaction.type)}
                      </div>
                      <Card className="flex-1">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">{interaction.title}</h3>
                                <Badge variant="outline">{interaction.type}</Badge>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(interaction.outcome)}`}>
                                  {interaction.outcome}
                                </span>
                                {interaction.sentiment !== undefined && (
                                  <span className="text-lg">{getSentimentEmoji(interaction.sentiment)}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{interaction.relatedName}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(interaction.createdAt).toLocaleString()} • by {interaction.createdBy}
                                {interaction.duration && ` • ${interaction.duration} min`}
                                {interaction.location && ` • ${interaction.location}`}
                              </p>
                            </div>
                            {interaction.dealValue && (
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Deal Value</p>
                                <p className="font-semibold">${(interaction.dealValue / 1000).toFixed(0)}K</p>
                                {interaction.probability && (
                                  <p className="text-xs text-gray-500">{interaction.probability}% prob</p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <p className="text-sm mb-3">{interaction.description}</p>
                          
                          {interaction.nextAction && (
                            <div className="bg-blue-50 p-3 rounded-lg mb-3">
                              <p className="text-sm font-medium text-blue-800 mb-1">Next Action:</p>
                              <p className="text-sm text-blue-700">{interaction.nextAction}</p>
                              {interaction.nextActionDate && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Due: {new Date(interaction.nextActionDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {interaction.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          {interaction.attachments.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <FileText className="w-4 h-4" />
                              <span>{interaction.attachments.length} attachment(s)</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}