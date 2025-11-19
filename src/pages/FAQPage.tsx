import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ, FAQFormData } from '@/types/faq';

const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState<FAQFormData>({
    question: '',
    answer: '',
  });

  // Load FAQs from localStorage on mount
  useEffect(() => {
    const storedFaqs = localStorage.getItem('crm_faqs');
    if (storedFaqs) {
      try {
        setFaqs(JSON.parse(storedFaqs));
      } catch (error) {
        console.error('Error loading FAQs:', error);
      }
    }
  }, []);

  // Save FAQs to localStorage whenever they change
  useEffect(() => {
    if (faqs.length > 0 || localStorage.getItem('crm_faqs')) {
      localStorage.setItem('crm_faqs', JSON.stringify(faqs));
    }
  }, [faqs]);

  const handleOpenDialog = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq);
      setFormData({
        question: faq.question,
        answer: faq.answer,
      });
    } else {
      setEditingFaq(null);
      setFormData({
        question: '',
        answer: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFaq(null);
    setFormData({
      question: '',
      answer: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Please fill in both question and answer fields.');
      return;
    }

    if (editingFaq) {
      // Update existing FAQ
      setFaqs(
        faqs.map((faq) =>
          faq.id === editingFaq.id
            ? {
                ...faq,
                question: formData.question.trim(),
                answer: formData.answer.trim(),
                updatedAt: new Date().toISOString(),
              }
            : faq
        )
      );
    } else {
      // Add new FAQ
      const newFaq: FAQ = {
        id: `faq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setFaqs([newFaq, ...faqs]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter((faq) => faq.id !== id));
    }
  };

  const filteredFaqs = faqs.filter((faq) =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        </div>
        <p className="text-muted-foreground">
          Find answers to common questions or add your own
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Manage FAQs</CardTitle>
          <CardDescription>
            Search existing questions or add new ones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </CardContent>
      </Card>

      {filteredFaqs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No FAQs Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'No FAQs match your search. Try a different query.'
                : 'Get started by adding your first FAQ.'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First FAQ
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={faq.id} value={faq.id}>
                  <div className="flex items-start gap-2">
                    <AccordionTrigger className="flex-1 text-left hover:no-underline">
                      <div className="flex items-start gap-3 pr-4">
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                          {index + 1}
                        </span>
                        <span className="font-medium">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <div className="flex gap-1 pt-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(faq)}
                        className="h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(faq.id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent>
                    <div className="pl-9 pr-20 pt-2 text-muted-foreground whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                    <div className="pl-9 pt-3 text-xs text-muted-foreground">
                      Last updated: {new Date(faq.updatedAt).toLocaleDateString()}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </DialogTitle>
              <DialogDescription>
                {editingFaq
                  ? 'Update the question and answer below.'
                  : 'Enter a question and its answer to add to the FAQ list.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  placeholder="Enter your question..."
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  placeholder="Enter the answer..."
                  value={formData.answer}
                  onChange={(e) =>
                    setFormData({ ...formData, answer: e.target.value })
                  }
                  rows={6}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingFaq ? 'Update FAQ' : 'Add FAQ'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FAQPage;