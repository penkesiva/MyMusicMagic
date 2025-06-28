"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Wand2 } from "lucide-react";
import { Portfolio } from "@/types/portfolio";

interface PortfolioAIAssistantProps {
  portfolio: Portfolio | null;
  onPortfolioUpdate: (updatedPortfolio: Portfolio) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  theme: any;
  onSave?: () => Promise<void>;
}

export default function PortfolioAIAssistant({
  portfolio,
  onPortfolioUpdate,
  isGenerating,
  setIsGenerating,
  theme,
  onSave
}: PortfolioAIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const placeholders = [
    "Build a portfolio for an upcoming cello artist...",
    "A full-stack developer specializing in React and Node.js...",
    "Create a page for a freelance photographer...",
    "A UI/UX designer with a passion for mobile apps...",
  ];

  useEffect(() => {
    if (isUserInteracting) return; // Stop scrolling if user is interacting
    
    let i = 0;
    const interval = setInterval(() => {
      setPrompt(placeholders[i]);
      i = (i + 1) % placeholders.length;
    }, 3000);
    return () => clearInterval(interval);
  }, [isUserInteracting]);

  const handleTextareaFocus = () => {
    setIsUserInteracting(true);
  };

  const handleTextareaBlur = () => {
    // Only resume scrolling if the textarea is empty
    if (!prompt.trim()) {
      setIsUserInteracting(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt || !portfolio) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt, currentPortfolio: portfolio }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to generate content from AI.';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Merge AI data with existing portfolio, keeping IDs and other essential fields
      const updatedPortfolio = { ...portfolio, ...data };
      onPortfolioUpdate(updatedPortfolio);

      // Auto-save after successful AI generation
      if (onSave) {
        try {
          await onSave();
        } catch (error) {
          console.error('Auto-save after AI generation failed:', error);
        }
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      const errorMessage = error instanceof Error ? error.message : "There was an error generating the portfolio content. Please try again.";
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the entire portfolio? All your current content will be cleared.")) {
      // This will be handled by the parent component
      alert("Portfolio has been reset to its last saved state.");
    }
  };

  return (
    <div className="relative rounded-xl bg-violet-900/80 border border-violet-700 p-4 pb-5 shadow-md flex flex-col justify-between min-h-[170px]" style={{ minHeight: 170 }}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-purple-300 text-lg">✨</span>
        <span className="font-bold text-base text-white">AI Assistant</span>
      </div>
      <textarea
        className="flex-1 rounded-lg px-3 py-2 bg-violet-800 text-white placeholder-violet-300 focus:ring-2 focus:ring-purple-400 border border-violet-700 resize-none min-h-[60px] max-h-[120px] text-sm"
        placeholder="Describe what you want to generate…"
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        onFocus={handleTextareaFocus}
        onBlur={handleTextareaBlur}
        disabled={isGenerating}
        rows={3}
        style={{ minHeight: 60, maxHeight: 120 }}
      />
      <button
        className="absolute bottom-3 right-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-3 text-white hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 shadow-lg"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        aria-label="Generate with AI"
        style={{ boxShadow: '0 2px 8px 0 rgba(80,0,120,0.15)' }}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 18l6-6-6-6" />
        </svg>
      </button>
      <div className="text-xs text-violet-200 pt-2">
        Fill all editable fields with AI
      </div>
    </div>
  );
} 