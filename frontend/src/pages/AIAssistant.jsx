import React from 'react';
import AIChatWidget from '../components/AIChatWidget';
import { Bot, Sparkles } from 'lucide-react';

export default function AIAssistant() {
  return (
    <div className="space-y-4 animate-fade-in pb-12 max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col text-slate-900 dark:text-white">
      <div className="flex items-center space-x-3">
        <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            AI Smart Factory Assistant
            <Sparkles className="w-4 h-4 text-amber-500" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ask natural language questions about machines, risk scores, maintenance, energy, or production status</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AIChatWidget />
      </div>
    </div>
  );
}
