import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { CURRENCY_SYMBOLS } from '../../data/seedData';
import {
  Sparkles,
  Send,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  Table,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  evidence?: any;
  timestamp: string;
}

export const AiStoreAssistant: React.FC = () => {
  const { currentStore, products, orders } = useStore();
  const currencySymbol = CURRENCY_SYMBOLS[currentStore.settings.currency] || '$';

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Hello! I'm your executive AI Store Assistant for **${currentStore.name}**. I analyze your real order transactions, product sales rankings, and inventory levels in real-time.\n\nAsk me about top selling items, low stock warnings, order fulfillment queues, or category revenue contributions!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const suggestedPrompts = [
    'What are my top 5 selling products?',
    'Which products are running low on stock?',
    'How many orders are still waiting to be shipped?',
    'Summarize my recent sales performance',
    'Which category generated the most revenue?',
  ];

  const handleSend = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Call secure server endpoint with authenticated store data
      const response = await fetch('/api/ai/store-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          storeName: currentStore.name,
          currency: currentStore.settings.currency || 'USD',
          products: products.map(p => ({
            id: p.id,
            name: p.name,
            sku: p.sku,
            category: p.category,
            price: p.price,
            stockQuantity: p.stockQuantity,
            lowStockThreshold: p.lowStockThreshold || 5,
          })),
          orders: orders.map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            total: o.total,
            fulfillmentStatus: o.fulfillmentStatus,
            items: o.items,
            createdAt: o.createdAt,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Analysis complete.',
        evidence: data.evidence,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.warn('AI query request error:', err);
      // Helpful honest fallback message
      const fallbackMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `I experienced a temporary communication hiccup with the analysis service. However, here is what your verified store data currently shows:\n\n- **Total Revenue:** ${currencySymbol}${orders.reduce((sum, o) => sum + (o.total || 0), 0).toFixed(2)}\n- **Total Orders:** ${orders.length}\n- **Active Products:** ${products.length}\n- **Low Stock Alerts:** ${products.filter(p => p.stockQuantity <= (p.lowStockThreshold || 5)).length} item(s)`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Store Assistant</h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Executive natural-language intelligence grounded strictly in your store's authenticated database records.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> Suggestions:
        </span>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50 text-xs text-slate-700 whitespace-nowrap transition shadow-xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[560px]">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'user';
            const isEvidenceOpen = expandedEvidenceId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-2xl ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-100 text-slate-900 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>

                {/* Evidence Transparency Panel for Assistant Responses */}
                {!isUser && msg.evidence && (
                  <div className="mt-2 w-full">
                    <button
                      onClick={() =>
                        setExpandedEvidenceId(isEvidenceOpen ? null : msg.id)
                      }
                      className="text-[11px] text-indigo-700 font-semibold hover:underline flex items-center gap-1 px-1"
                    >
                      <Table className="w-3 h-3" />
                      {isEvidenceOpen ? 'Hide verified data behind answer' : 'View verified data behind answer'}
                      {isEvidenceOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isEvidenceOpen && (
                      <div className="mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5 animate-fadeIn">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-[11px] text-slate-500">
                          <span><strong>Scope:</strong> {msg.evidence.dateRange}</span>
                          <span><strong>Criteria:</strong> Non-cancelled orders</span>
                        </div>

                        {/* Top Products Table if present */}
                        {msg.evidence.topSellingProducts?.length > 0 && (
                          <div>
                            <span className="font-bold text-[11px] text-slate-700 block mb-1">
                              Product Sales Ranking:
                            </span>
                            <div className="space-y-1">
                              {msg.evidence.topSellingProducts.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between text-[11px] text-slate-600">
                                  <span>{i + 1}. {p.product} ({p.category})</span>
                                  <span className="font-mono font-bold text-slate-800">
                                    {p.unitsSold} units • {p.revenue}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Low stock if present */}
                        {msg.evidence.lowStockProducts?.length > 0 && (
                          <div>
                            <span className="font-bold text-[11px] text-amber-800 block mb-1">
                              Items at / below low-stock threshold:
                            </span>
                            <div className="space-y-1">
                              {msg.evidence.lowStockProducts.map((p: any, i: number) => (
                                <div key={i} className="flex justify-between text-[11px] text-amber-700">
                                  <span>{p.name}</span>
                                  <span className="font-mono font-bold">{p.stock} units left</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                          Grounded in {currentStore.name}'s verified database records.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}

          {/* Loading Skeleton Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 w-48 text-xs text-slate-500 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Analyzing store database...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              placeholder="Ask anything about sales, orders, or inventory..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-40 transition active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Ask
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
