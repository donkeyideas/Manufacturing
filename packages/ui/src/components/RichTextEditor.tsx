import { useRef, useCallback } from 'react';
import {
  Bold, Italic, Link, List, ListOrdered, Image, Heading2, Heading3,
  BarChart3, Undo, Redo,
} from 'lucide-react';
import { cn } from '../lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        'flex h-7 w-7 items-center justify-center rounded text-xs transition-colors',
        active
          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300'
          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  className,
  minHeight = '300px',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleAddLink = () => {
    const url = prompt('Enter URL:');
    if (url) exec('createLink', url);
  };

  const handleAddImage = () => {
    const url = prompt('Enter image URL:');
    if (url) exec('insertImage', url);
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={cn('rounded-lg border border-border overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-1 px-2 py-1.5">
        <ToolbarButton icon={Bold} label="Bold" onClick={() => exec('bold')} />
        <ToolbarButton icon={Italic} label="Italic" onClick={() => exec('italic')} />
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => exec('formatBlock', 'H2')} />
        <ToolbarButton icon={Heading3} label="Heading 3" onClick={() => exec('formatBlock', 'H3')} />
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton icon={List} label="Bullet List" onClick={() => exec('insertUnorderedList')} />
        <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => exec('insertOrderedList')} />
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton icon={Link} label="Add Link" onClick={handleAddLink} />
        <ToolbarButton icon={Image} label="Add Image" onClick={handleAddImage} />
        <ToolbarButton icon={BarChart3} label="Add Chart" onClick={() => exec('insertHTML', '<div class="chart-placeholder" style="padding:2rem;background:#f0f0f0;border-radius:8px;text-align:center;color:#666">[Chart Placeholder]</div>')} />
        <div className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton icon={Undo} label="Undo" onClick={() => exec('undo')} />
        <ToolbarButton icon={Redo} label="Redo" onClick={() => exec('redo')} />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
        className="prose prose-sm dark:prose-invert max-w-none px-4 py-3 outline-none text-text-primary [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-text-muted"
        style={{ minHeight }}
      />
    </div>
  );
}
