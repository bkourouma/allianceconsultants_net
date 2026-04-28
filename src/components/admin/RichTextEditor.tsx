"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Rédigez votre article…",
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        bulletList: { HTMLAttributes: { class: "list-disc pl-6" } },
        orderedList: { HTMLAttributes: { class: "list-decimal pl-6" } },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer nofollow",
          target: "_blank",
        },
      }),
      Image.configure({ inline: false }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[300px] focus:outline-none px-4 py-3",
        "aria-label": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) {
    return (
      <div className="min-h-[320px] rounded-lg border border-slate-300 bg-white p-4 text-sm text-slate-500">
        Chargement de l&apos;éditeur…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  function tb(active: boolean) {
    return cn(
      "h-8 rounded px-2 text-xs font-medium transition-colors",
      active
        ? "bg-primary text-white"
        : "text-slate-700 hover:bg-slate-200/70",
    );
  }

  function setLink() {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien (laisser vide pour retirer) :", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  }

  function setImage() {
    const url = window.prompt("URL de l'image :", "/uploads/blog/");
    if (!url) return;
    const alt = window.prompt("Texte alternatif (description courte) :", "") ?? "";
    editor.chain().focus().setImage({ src: url, alt }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-2 py-1.5">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={tb(editor.isActive("bold"))}
        aria-label="Gras"
      >
        Gras
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={tb(editor.isActive("italic"))}
        aria-label="Italique"
      >
        Italique
      </button>
      <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={tb(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={tb(editor.isActive("heading", { level: 3 }))}
      >
        H3
      </button>
      <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={tb(editor.isActive("bulletList"))}
      >
        Liste
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={tb(editor.isActive("orderedList"))}
      >
        Liste num.
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={tb(editor.isActive("blockquote"))}
      >
        Citation
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={tb(editor.isActive("codeBlock"))}
      >
        Code
      </button>
      <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden />
      <button type="button" onClick={setLink} className={tb(editor.isActive("link"))}>
        Lien
      </button>
      <button type="button" onClick={setImage} className={tb(false)}>
        Image
      </button>
      <span className="mx-1 h-5 w-px bg-slate-300" aria-hidden />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className={tb(false)}
        disabled={!editor.can().undo()}
        aria-label="Annuler"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className={tb(false)}
        disabled={!editor.can().redo()}
        aria-label="Rétablir"
      >
        Rétablir
      </button>
    </div>
  );
}
