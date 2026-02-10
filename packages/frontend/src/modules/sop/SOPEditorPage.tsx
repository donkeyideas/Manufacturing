import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Input, Select, RichTextEditor, TagInput, Modal } from '@erp/ui';
import { useSOP } from '../../data-layer/hooks/useSOP';
import { Sparkles, Save } from 'lucide-react';

const DEPARTMENTS = [
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Quality', label: 'Quality' },
  { value: 'Warehouse', label: 'Warehouse' },
  { value: 'Shipping', label: 'Shipping' },
  { value: 'Safety', label: 'Safety' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const ALL_ROLES = [
  'CNC Operator', 'Machine Operator', 'Production Technician', 'Quality Inspector',
  'Quality Manager', 'Production Supervisor', 'Maintenance Technician', 'Warehouse Associate',
  'Shipping Clerk', 'Receiving Clerk', 'Assembly Technician', 'Line Lead',
  'Environmental Coordinator',
];

const AI_TEMPLATE = `<h2>1. Purpose</h2>
<p>This SOP establishes the standard procedure for [TOPIC] to ensure safety, quality, and compliance with regulatory requirements.</p>

<h2>2. Scope</h2>
<p>This procedure applies to all personnel involved in [TOPIC] operations within the [DEPARTMENT] department.</p>

<h2>3. Required PPE</h2>
<ul>
<li>Safety glasses with side shields</li>
<li>Steel-toed boots</li>
<li>Appropriate gloves for the task</li>
<li>Hearing protection (if noise levels exceed 85 dB)</li>
</ul>

<h2>4. Procedure Steps</h2>
<ol>
<li>Verify all equipment is in proper working condition</li>
<li>Complete the pre-operation safety checklist</li>
<li>Follow the established workflow sequence</li>
<li>Document all readings and observations</li>
<li>Report any deviations to the supervisor immediately</li>
</ol>

<h2>5. Quality Checkpoints</h2>
<ul>
<li>Initial verification at process start</li>
<li>In-process inspection per the control plan</li>
<li>Final quality check before sign-off</li>
</ul>

<h2>6. Safety Warnings</h2>
<p><strong>DANGER:</strong> Follow all lockout/tagout procedures before performing any maintenance. Report all near-misses and safety incidents immediately.</p>

<h2>7. Documentation</h2>
<p>All activities must be recorded in the ERP system. Maintain complete traceability for audit compliance.</p>`;

export default function SOPEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { data: existingSOP } = useSOP(id || '');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [department, setDepartment] = useState('Manufacturing');
  const [version, setVersion] = useState('1.0');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [effectiveDate, setEffectiveDate] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiDepartment, setAiDepartment] = useState('Manufacturing');
  const [aiHazardLevel, setAiHazardLevel] = useState('Medium');
  const [aiEquipment, setAiEquipment] = useState('');

  useEffect(() => {
    if (existingSOP && isEditing) {
      setTitle(existingSOP.title);
      setContent(existingSOP.content || '');
      setStatus(existingSOP.status);
      setDepartment(existingSOP.department);
      setVersion(existingSOP.version);
      setSelectedRoles(existingSOP.roles || []);
      setTags(existingSOP.tags || []);
      setEffectiveDate(existingSOP.effectiveDate || '');
      setReviewDate(existingSOP.reviewDate || '');
    }
  }, [existingSOP, isEditing]);

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleAIGenerate = () => {
    const generated = AI_TEMPLATE
      .replace(/\[TOPIC\]/g, aiTopic || 'the specified process')
      .replace(/\[DEPARTMENT\]/g, aiDepartment);
    setTitle(aiTopic || 'Generated SOP');
    setContent(generated);
    setDepartment(aiDepartment);
    if (!tags.length) setTags(['generated', 'safety']);
    setShowAIModal(false);
  };

  const handleSave = () => {
    // In demo mode, just navigate back
    navigate('/sop/list');
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">
            {isEditing ? 'Edit SOP' : 'Create New SOP'}
          </h1>
          <p className="text-xs text-text-muted">
            {isEditing ? `Editing ${existingSOP?.sopNumber || ''}` : 'Define a new standard operating procedure'}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setShowAIModal(true)}>
          <Sparkles className="h-4 w-4 mr-1" />
          Generate with AI
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter SOP title..."
          />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-secondary">Content</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write the SOP content..."
              minHeight="400px"
            />
          </div>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS}
          />
          <Select
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            options={DEPARTMENTS}
          />
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-secondary">Version</label>
            <div className="flex h-9 w-full items-center rounded-md border border-border bg-surface-2 px-3 text-sm text-text-muted">
              {version}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-secondary">Assigned Roles</label>
            <div className="max-h-48 overflow-y-auto rounded-md border border-border bg-surface-0 p-2 space-y-1">
              {ALL_ROLES.map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer text-xs text-text-primary hover:bg-surface-1 rounded px-1 py-0.5">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="rounded border-border"
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-secondary">Tags</label>
            <TagInput tags={tags} onChange={setTags} placeholder="Add tag..." />
          </div>

          <Input
            label="Effective Date"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
          <Input
            label="Review Date"
            type="date"
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-1" />
          {isEditing ? 'Save Changes' : 'Create SOP'}
        </Button>
      </div>

      {/* AI Generation Modal */}
      <Modal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="Generate SOP with AI"
        description="Provide details and AI will generate a draft SOP for you."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Title / Topic"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="e.g., CNC Machine Coolant Replacement"
          />
          <Select
            label="Department"
            value={aiDepartment}
            onChange={(e) => setAiDepartment(e.target.value)}
            options={DEPARTMENTS}
          />
          <Select
            label="Hazard Level"
            value={aiHazardLevel}
            onChange={(e) => setAiHazardLevel(e.target.value)}
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
            ]}
          />
          <Input
            label="Equipment Involved"
            value={aiEquipment}
            onChange={(e) => setAiEquipment(e.target.value)}
            placeholder="e.g., CNC Mill, Coolant Pump, PPE"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAIModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIGenerate}>
              <Sparkles className="h-4 w-4 mr-1" />
              Generate Draft
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
