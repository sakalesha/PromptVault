import * as React from 'react';
import { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { TextArea } from './ui/Input';
import { Sparkles, Loader2, Wand2, Copy, Check, Save } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

interface PromptGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onUsePrompt: (content: string, title: string) => void;
}

export function PromptGenerator({ isOpen, onClose, onUsePrompt }: PromptGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<{ title: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePrompt = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or goal');
      return;
    }

    setIsGenerating(true);
    setGeneratedPrompt(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a high-quality, professional AI prompt based on the following topic or goal: "${topic}". 
        The response should be in JSON format with two fields: "title" (a concise, catchy title for the prompt) and "content" (the full, detailed prompt itself).
        The prompt should be well-structured, clear, and effective for an AI model.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["title", "content"],
          },
        },
      });

      const result = JSON.parse(response.text);
      setGeneratedPrompt(result);
      toast.success('Prompt generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt.content);
    setCopied(true);
    toast.success('Generated prompt copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Prompt Generator"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-4">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">AI-Powered Creation</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Describe the task or topic you want a prompt for, and our AI will craft a professional, effective prompt for you.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-400">What do you want to achieve?</label>
          <TextArea
            placeholder="e.g. A creative writing assistant for sci-fi short stories, or a code reviewer for React components..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[100px] bg-zinc-900/50"
          />
          <Button
            onClick={generatePrompt}
            disabled={isGenerating || !topic.trim()}
            className="w-full h-12 bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Prompt...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Prompt
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {generatedPrompt && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Generated Result
                </h4>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 px-3">
                    {copied ? <Check className="w-3.5 h-3.5 mr-2 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-2" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-900/80 rounded-2xl border border-white/5 space-y-3">
                  <div className="pb-3 border-b border-white/5">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1 block">Suggested Title</span>
                    <p className="text-white font-medium">{generatedPrompt.title}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Prompt Content</span>
                    <div className="prose prose-invert prose-sm max-w-none bg-black/40 p-4 rounded-xl border border-white/5 overflow-y-auto max-h-[300px] custom-scrollbar">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {generatedPrompt.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => onUsePrompt(generatedPrompt.content, generatedPrompt.title)}
                    className="flex-1 h-11 bg-white text-black hover:bg-zinc-200"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Use & Save this Prompt
                  </Button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        <div className="pt-4 border-t border-white/5 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
}
