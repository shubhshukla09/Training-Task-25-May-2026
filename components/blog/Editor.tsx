"use client";

import { useState, useRef } from "react";
import MarkdownReader from "./MarkdownReader";
import { Bold, Italic, Link2, Heading1, Heading2, Code, Eye, Edit3, SplitSquareVertical } from "lucide-react";

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

type ViewMode = "edit" | "preview" | "split";

export default function Editor({ content, onChange, placeholder = "Write some beautiful markdown here..." }: EditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert markdown templates at cursor
  function insertMarkdown(prefix: string, suffix: string = "") {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = prefix + (selected || "text") + suffix;

    const newValue = text.substring(0, start) + replacement + text.substring(end);
    onChange(newValue);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected || "text").length);
    }, 50);
  }

  const toolbarActions = [
    { icon: <Heading1 className="w-4 h-4" />, label: "Header 1", action: () => insertMarkdown("# ", "\n") },
    { icon: <Heading2 className="w-4 h-4" />, label: "Header 2", action: () => insertMarkdown("## ", "\n") },
    { icon: <Bold className="w-4 h-4" />, label: "Bold", action: () => insertMarkdown("**", "**") },
    { icon: <Italic className="w-4 h-4" />, label: "Italic", action: () => insertMarkdown("_", "_") },
    { icon: <Link2 className="w-4 h-4" />, label: "Link", action: () => insertMarkdown("[", "](url)") },
    { icon: <Code className="w-4 h-4" />, label: "Code Block", action: () => insertMarkdown("```javascript\n", "\n```") },
  ];

  return (
    <div className="w-full flex flex-col rounded-2xl border border-white/10 bg-zinc-950/40 overflow-hidden shadow-glass-md">
      {/* Editor Toolbar Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-[#09090b]/80 border-b border-white/5 gap-3">
        {/* Markdown Controls */}
        <div className="flex items-center space-x-1.5 border-r border-white/5 pr-4">
          {toolbarActions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={item.action}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none"
              title={item.label}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {/* View Layout Toggle Options */}
        <div className="flex items-center space-x-1 border border-white/5 rounded-xl p-1 bg-zinc-900/50">
          <button
            type="button"
            onClick={() => setViewMode("edit")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none ${
              viewMode === "edit" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Write</span>
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode("split")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none ${
              viewMode === "split" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Screen</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("preview")}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none ${
              viewMode === "preview" ? "bg-white/10 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] h-[550px] relative bg-zinc-950/20">
        {/* Write Textarea Panel */}
        {(viewMode === "edit" || viewMode === "split") && (
          <div
            className={`h-full border-r border-white/5 p-4 flex flex-col ${
              viewMode === "split" ? "lg:col-span-6" : "lg:col-span-12"
            }`}
          >
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full h-full flex-grow bg-transparent text-sm text-zinc-100 placeholder-zinc-600 border-none outline-none resize-none font-mono focus:ring-0 leading-relaxed overflow-y-auto"
            />
          </div>
        )}

        {/* Live Preview Panel */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div
            className={`h-full p-6 overflow-y-auto ${
              viewMode === "split" ? "lg:col-span-6" : "lg:col-span-12"
            }`}
          >
            {content ? (
              <MarkdownReader content={content} />
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-600 text-sm italic">
                A live preview of your formatted article will render here...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
