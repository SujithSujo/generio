"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor: current }) => {
      onChange(current.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[160px] px-3 py-2 text-sm leading-relaxed outline-none prose prose-sm max-w-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current && value !== editor.getText()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div className="min-h-[200px] rounded-md border border-[var(--border)] bg-[var(--surface-muted)]" />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)]">
      <div className="flex flex-wrap gap-1 border-b border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1.5">
        {(
          [
            ["Bold", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold")],
            ["Italic", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic")],
            ["H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 })],
            ["H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 })],
            ["List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList")],
            ["Ordered", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList")],
          ] as const
        ).map(([label, action, active]) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={action}
            className={`rounded px-2 py-1 text-xs font-medium ${
              active
                ? "bg-white text-[var(--brand-deep)] shadow-sm"
                : "text-[var(--ink-muted)] hover:bg-white/70"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
