import { useState } from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@erp/ui';

const inputClass = 'w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500';
const selectClass = 'rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-500';
const btnPrimary = 'rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors';
const btnSecondary = 'rounded-md border border-border bg-surface-0 px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-2 transition-colors';

export default function SubmitTicketPage() {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const resetForm = () => {
    setSubject('');
    setCategory('');
    setPriority('Medium');
    setDescription('');
    setLocation('');
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!subject.trim() || !description.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Submit a Ticket</h1>
          <p className="text-xs text-text-muted mt-0.5">Report an issue or request support</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent>
              <div className="flex flex-col items-center py-10 text-center space-y-4">
                <CheckCircle className="h-14 w-14 text-green-500" />
                <h2 className="text-lg font-semibold text-text-primary">Ticket Submitted Successfully</h2>
                <p className="text-sm text-text-secondary max-w-md">
                  Your ticket <span className="font-mono font-medium text-brand-600">TKT-2024-0146</span> has been created and assigned to the IT support team.
                </p>
                <button type="button" onClick={resetForm} className={btnPrimary}>
                  Submit Another Ticket
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Submit a Ticket</h1>
        <p className="text-xs text-text-muted mt-0.5">Report an issue or request support</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader><CardTitle>New Support Ticket</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of the issue" className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={`w-full ${selectClass}`}>
                    <option value="">Select category</option>
                    {['IT/Hardware', 'Software/Access', 'Facilities', 'HR Questions', 'Safety', 'Other'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} className={`w-full ${selectClass}`}>
                    {['Low', 'Medium', 'High', 'Critical'].map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue in detail..." className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Building A, Floor 2, Machine #5" className={inputClass} />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Attachments</label>
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-0 p-6 text-center hover:bg-surface-2 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-text-muted mb-2" />
                  <p className="text-sm text-text-secondary">Drag and drop files here or click to browse</p>
                  <p className="text-xs text-text-muted mt-1">PNG, JPG, PDF up to 10 MB</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className={btnSecondary}>Cancel</button>
                <button type="button" onClick={handleSubmit} className={btnPrimary}>Submit Ticket</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
