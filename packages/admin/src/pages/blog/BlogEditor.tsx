import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Input, Select, Modal,
  Tabs, TabsList, TabsTrigger, TabsContent,
  RichTextEditor, CircularProgress, TagInput, FileUpload,
} from '@erp/ui';
import { getBlogPosts, getBlogCategories } from '@erp/demo-data';
import { Sparkles, Check, X as XIcon } from 'lucide-react';

const AI_SAMPLE_CONTENT = `<h2>Introduction</h2>
<p>In today's competitive manufacturing landscape, staying ahead requires embracing innovation and best practices. This guide explores the key strategies and tools that modern manufacturers are using to optimize their operations.</p>

<h2>Key Challenges</h2>
<p>Manufacturing companies face several critical challenges that directly impact their bottom line:</p>
<ul>
<li><strong>Rising operational costs</strong> - Raw materials, labor, and energy costs continue to climb</li>
<li><strong>Quality consistency</strong> - Maintaining uniform quality across production runs</li>
<li><strong>Supply chain disruptions</strong> - Global events creating unpredictable delays</li>
<li><strong>Workforce skills gap</strong> - Finding and retaining qualified technical talent</li>
</ul>

<h2>Best Practices</h2>
<p>Successful manufacturers are implementing these proven strategies:</p>
<ol>
<li>Investing in automation and AI-powered quality inspection</li>
<li>Adopting lean manufacturing principles to eliminate waste</li>
<li>Implementing real-time production monitoring and analytics</li>
<li>Building resilient supply chains with multiple sourcing options</li>
<li>Creating comprehensive training programs for workforce development</li>
</ol>

<h2>The Role of Technology</h2>
<p>Modern ERP systems serve as the backbone of efficient manufacturing operations. By centralizing data from production, quality, inventory, and finance, manufacturers gain the visibility needed to make informed decisions quickly.</p>

<h2>Conclusion</h2>
<p>The path to manufacturing excellence requires a combination of technology, process optimization, and people development. Companies that embrace these principles position themselves for sustainable growth and competitive advantage.</p>`;

export function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  // Content fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [ogImageUrl, setOgImageUrl] = useState('');

  // Post settings
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState('draft');
  const [featuredImage, setFeaturedImage] = useState('');

  // AI modal
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Professional');
  const [aiKeyword, setAiKeyword] = useState('');
  const [aiWordCount, setAiWordCount] = useState('1500');

  const categories = useMemo(() => getBlogCategories(), []);
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.name, label: c.name })),
    [categories]
  );

  // Load existing post for editing
  useEffect(() => {
    if (id) {
      const posts = getBlogPosts();
      const post = posts.find((p) => p.id === id);
      if (post) {
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt || '');
        setContent(post.content || '');
        setSeoTitle(post.seoTitle || '');
        setSeoDescription(post.seoDescription || '');
        setSeoKeywords(post.seoKeywords || []);
        setCategory(post.category || '');
        setTags(post.tags || []);
        setStatus(post.status);
        setFeaturedImage(post.featuredImageUrl || '');
      }
    }
  }, [id]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEditing || !slug) {
      setSlug(
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      );
    }
  }, [title, isEditing, slug]);

  // Word count and read time
  const wordCount = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text ? text.split(/\s+/).length : 0;
  }, [content]);

  const readTime = useMemo(() => Math.max(1, Math.ceil(wordCount / 250)), [wordCount]);

  // SEO Score calculation
  const seoChecks = useMemo(() => {
    const checks = [
      {
        label: 'Title length (50-60 chars)',
        passed: seoTitle.length >= 50 && seoTitle.length <= 60,
      },
      {
        label: 'Meta description (120-160 chars)',
        passed: seoDescription.length >= 120 && seoDescription.length <= 160,
      },
      {
        label: 'Keyword in title',
        passed: seoKeywords.length > 0 && seoKeywords.some((kw) =>
          (seoTitle || title).toLowerCase().includes(kw.toLowerCase())
        ),
      },
      {
        label: 'Has featured image',
        passed: Boolean(featuredImage),
      },
      {
        label: 'Word count > 300',
        passed: wordCount > 300,
      },
      {
        label: 'Content has headings',
        passed: content.includes('<h2') || content.includes('<h3'),
      },
    ];
    return checks;
  }, [seoTitle, seoDescription, seoKeywords, featuredImage, wordCount, content, title]);

  const seoScore = useMemo(() => {
    const passed = seoChecks.filter((c) => c.passed).length;
    return Math.round((passed / seoChecks.length) * 100);
  }, [seoChecks]);

  const handleAIGenerate = useCallback(() => {
    const generatedTitle = aiTopic || 'Best Practices for Modern Manufacturing';
    setTitle(generatedTitle);
    setContent(AI_SAMPLE_CONTENT);
    setExcerpt(
      `A comprehensive guide to ${aiTopic || 'modern manufacturing'} covering key strategies, challenges, and best practices for today's manufacturers.`
    );
    setTags(aiKeyword ? [aiKeyword, 'manufacturing', 'best-practices'] : ['manufacturing', 'best-practices', 'erp']);
    setSeoTitle(`${generatedTitle} | Manufacturing ERP Blog`);
    setSeoDescription(
      `Learn about ${aiTopic || 'modern manufacturing best practices'} and discover how leading manufacturers are optimizing their operations for growth.`
    );
    if (aiKeyword) setSeoKeywords([aiKeyword]);
    setShowAIModal(false);
  }, [aiTopic, aiKeyword]);

  const handleSave = () => {
    navigate('/blog');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-surface-1 px-4 py-2">
        <Tabs defaultValue="content" className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              <Button variant="secondary" size="sm" onClick={() => setShowAIModal(true)}>
                <Sparkles className="h-3.5 w-3.5 mr-1" />
                Generate with AI
              </Button>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {/* Content Tab */}
              <TabsContent value="content">
                <div className="space-y-4 max-w-3xl">
                  <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter post title..."
                  />
                  <Input
                    label="Slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="post-url-slug"
                    hint={`URL: /blog/${slug || '...'}`}
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-text-secondary">Excerpt</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief summary of the post..."
                      rows={3}
                      className="flex w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-text-secondary">Content</label>
                    <RichTextEditor
                      value={content}
                      onChange={setContent}
                      placeholder="Write your blog post..."
                      minHeight="350px"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* SEO Tab */}
              <TabsContent value="seo">
                <div className="space-y-4 max-w-3xl">
                  <Input
                    label="SEO Title"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="SEO-optimized page title (50-60 chars)"
                    hint={`${seoTitle.length} / 60 characters`}
                  />
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-text-secondary">SEO Description</label>
                    <textarea
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Meta description for search engines (120-160 chars)"
                      rows={3}
                      className="flex w-full rounded-md border border-border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 resize-none"
                    />
                    <p className="text-xs text-text-muted">{seoDescription.length} / 160 characters</p>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-text-secondary">SEO Keywords</label>
                    <TagInput
                      tags={seoKeywords}
                      onChange={setSeoKeywords}
                      placeholder="Add keyword..."
                    />
                  </div>
                  <Input
                    label="OG Image URL"
                    value={ogImageUrl}
                    onChange={(e) => setOgImageUrl(e.target.value)}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </TabsContent>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-72 border-l border-border bg-surface-0 overflow-y-auto p-4 space-y-6">
              {/* SEO Score */}
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-text-secondary mb-2">SEO Score</span>
                <CircularProgress value={seoScore} size={100} strokeWidth={6} label="/ 100" />
              </div>

              {/* SEO Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-text-secondary">SEO Checklist</span>
                {seoChecks.map((check) => (
                  <div key={check.label} className="flex items-start gap-2">
                    {check.passed ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <XIcon className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <span className={`text-2xs ${check.passed ? 'text-text-secondary' : 'text-text-muted'}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Post Settings */}
              <div className="space-y-3">
                <span className="text-xs font-medium text-text-secondary">Post Settings</span>
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={categoryOptions}
                  placeholder="Select category"
                />
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-text-secondary">Tags</label>
                  <TagInput tags={tags} onChange={setTags} placeholder="Add tag..." />
                </div>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' },
                  ]}
                />
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Featured Image */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-text-secondary">Featured Image</span>
                <FileUpload
                  value={featuredImage}
                  onChange={setFeaturedImage}
                  placeholder="Upload featured image"
                />
              </div>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between border-t border-border bg-surface-1 px-4 py-2.5">
        <div className="text-xs text-text-muted">
          {wordCount} words &middot; ~{readTime} min read
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate('/blog')}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            {isEditing ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </div>

      {/* AI Generation Modal */}
      <Modal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        title="Generate Blog Post with AI"
        description="Provide details and AI will generate a draft blog post for you."
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Topic"
            value={aiTopic}
            onChange={(e) => setAiTopic(e.target.value)}
            placeholder="e.g., How to Improve Manufacturing Efficiency"
          />
          <Select
            label="Tone"
            value={aiTone}
            onChange={(e) => setAiTone(e.target.value)}
            options={[
              { value: 'Professional', label: 'Professional' },
              { value: 'Casual', label: 'Casual' },
              { value: 'Technical', label: 'Technical' },
            ]}
          />
          <Input
            label="Target Keyword"
            value={aiKeyword}
            onChange={(e) => setAiKeyword(e.target.value)}
            placeholder="e.g., manufacturing efficiency"
          />
          <Input
            label="Word Count Target"
            type="number"
            value={aiWordCount}
            onChange={(e) => setAiWordCount(e.target.value)}
            placeholder="1500"
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

export default BlogEditor;
