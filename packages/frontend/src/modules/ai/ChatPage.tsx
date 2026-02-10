import { useMemo } from 'react';
import { Send } from 'lucide-react';
import { Card, CardContent } from '@erp/ui';
import { useChatHistory } from '../../data-layer/hooks/useAI';
import { format } from 'date-fns';

export default function ChatPage() {
  const { data, isLoading } = useChatHistory();
  const messages = useMemo(() => data ?? [], [data]);

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">AI Assistant</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Ask questions about your business data in natural language
        </p>
      </div>

      {/* Chat Window */}
      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <p className="text-sm text-text-muted">Loading conversation...</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex flex-col ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm p-3 max-w-[70%] ml-auto'
                        : 'bg-surface-1 border border-border rounded-2xl rounded-bl-sm p-3 max-w-[70%]'
                    }
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                  <span className="text-xs text-text-muted mt-1 px-1">
                    {format(new Date(message.timestamp), 'h:mm a')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fake Input Area */}
      <div className="flex items-center gap-2">
        <div className="flex-1 px-4 py-3 rounded-lg border border-border bg-surface-1 text-sm text-text-muted">
          Ask about your manufacturing data...
        </div>
        <button
          disabled
          className="p-3 rounded-lg bg-blue-600 text-white opacity-50 cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
