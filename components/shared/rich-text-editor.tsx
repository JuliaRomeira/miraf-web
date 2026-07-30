"use client";

import { useState } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyleKit } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
  Underline,
  Unlink,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  /**
   * Nome do campo — grava o HTML num input oculto lido pelo FormData (modo
   * não-controlado). Omitir quando usar `value`/`onChange` (modo controlado,
   * ex.: dentro do JSON de sabores).
   */
  readonly name?: string;
  /** HTML (ou texto legado) inicial (modo não-controlado). */
  readonly defaultValue?: string;
  /** Valor inicial no modo controlado. */
  readonly value?: string;
  /** Callback do modo controlado; quando presente, não renderiza input oculto. */
  readonly onChange?: (html: string) => void;
  readonly placeholder?: string;
}

/** Tamanhos de fonte oferecidos no editor (valor CSS + rótulo). */
const FONT_SIZES: { value: string; label: string }[] = [
  { value: "", label: "Tamanho" },
  { value: "0.875rem", label: "Pequeno" },
  { value: "1rem", label: "Normal" },
  { value: "1.25rem", label: "Médio" },
  { value: "1.5rem", label: "Grande" },
  { value: "2rem", label: "Muito grande" },
];

/** Um bloco só tem um nível de título por vez; "p" = parágrafo. */
type BlockValue = "p" | "1" | "2" | "3";

const BLOCK_OPTIONS: { value: BlockValue; label: string }[] = [
  { value: "p", label: "Parágrafo" },
  { value: "1", label: "Título 1" },
  { value: "2", label: "Título 2" },
  { value: "3", label: "Título 3" },
];

interface ToolbarButtonProps {
  readonly onClick: () => void;
  readonly active?: boolean;
  readonly label: string;
  readonly children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: ToolbarButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring flex size-8 items-center justify-center rounded-md transition focus-visible:ring-2 focus-visible:outline-none",
        active && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

const selectClass =
  "border-input bg-background focus-visible:ring-ring h-8 rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none";

/**
 * Editor de texto rico (WYSIWYG) baseado em TipTap. Suporta negrito, itálico,
 * sublinhado, títulos (H1–H3), tamanho de fonte, cor, listas, alinhamento,
 * links e quebras de linha/parágrafo. O conteúdo é serializado como HTML num
 * input oculto de nome `name`, então o formulário existente (FormData) o lê sem
 * mudanças no Server Action. Quando o editor fica vazio, o valor vira "" para
 * disparar a validação de campo obrigatório do Zod.
 */
export function RichTextEditor({
  name,
  defaultValue,
  value,
  onChange,
  placeholder,
}: RichTextEditorProps): React.ReactElement {
  const initialContent = value ?? defaultValue ?? "";
  const [html, setHtml] = useState(initialContent);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      TextStyleKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "rich-content tiptap",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
    onUpdate: ({ editor }) => {
      // Editor vazio → "" (força a validação de obrigatório); senão, o HTML.
      const next = editor.getText().trim() === "" ? "" : editor.getHTML();
      setHtml(next);
      onChange?.(next);
    },
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }: { editor: Editor | null }) =>
      editor
        ? {
            bold: editor.isActive("bold"),
            italic: editor.isActive("italic"),
            underline: editor.isActive("underline"),
            strike: editor.isActive("strike"),
            bulletList: editor.isActive("bulletList"),
            orderedList: editor.isActive("orderedList"),
            link: editor.isActive("link"),
            alignLeft: editor.isActive({ textAlign: "left" }),
            alignCenter: editor.isActive({ textAlign: "center" }),
            alignRight: editor.isActive({ textAlign: "right" }),
            alignJustify: editor.isActive({ textAlign: "justify" }),
            block: editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
                ? "2"
                : editor.isActive("heading", { level: 3 })
                  ? "3"
                  : "p",
          }
        : null,
  });

  const setBlock = (value: BlockValue): void => {
    if (!editor) return;
    if (value === "p") {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .setHeading({ level: Number(value) as 1 | 2 | 3 })
        .run();
    }
  };

  const toggleLink = (): void => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Endereço do link (https://...)");
    if (url === null) return; // cancelou
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: trimmed }).run();
  };

  return (
    <div className="rich-editor border-input focus-within:ring-ring overflow-hidden rounded-md border focus-within:ring-2">
      {/* Toolbar */}
      <div className="border-input bg-muted/40 flex flex-wrap items-center gap-1 border-b p-1.5">
        <select
          aria-label="Estilo do bloco"
          className={selectClass}
          value={active?.block ?? "p"}
          onChange={(event) => setBlock(event.target.value as BlockValue)}
        >
          {BLOCK_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          aria-label="Tamanho da fonte"
          className={selectClass}
          value=""
          onChange={(event) => {
            const value = event.target.value;
            if (!editor) return;
            if (value === "") {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(value).run();
            }
          }}
        >
          {FONT_SIZES.map((size) => (
            <option key={size.label} value={size.value}>
              {size.label}
            </option>
          ))}
        </select>

        <label
          className="hover:bg-accent flex size-8 cursor-pointer items-center justify-center rounded-md transition"
          title="Cor do texto"
        >
          <span className="text-sm font-semibold" aria-hidden="true">
            A
          </span>
          <input
            type="color"
            aria-label="Cor do texto"
            className="size-0 opacity-0"
            onChange={(event) => editor?.chain().focus().setColor(event.target.value).run()}
          />
        </label>

        <span className="bg-border mx-0.5 h-6 w-px" aria-hidden="true" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={active?.bold}
          label="Negrito"
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={active?.italic}
          label="Itálico"
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          active={active?.underline}
          label="Sublinhado"
        >
          <Underline className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={active?.strike}
          label="Tachado"
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>

        <span className="bg-border mx-0.5 h-6 w-px" aria-hidden="true" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={active?.bulletList}
          label="Lista com marcadores"
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          active={active?.orderedList}
          label="Lista numerada"
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>

        <span className="bg-border mx-0.5 h-6 w-px" aria-hidden="true" />

        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          active={active?.alignLeft}
          label="Alinhar à esquerda"
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          active={active?.alignCenter}
          label="Centralizar"
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          active={active?.alignRight}
          label="Alinhar à direita"
        >
          <AlignRight className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
          active={active?.alignJustify}
          label="Justificar"
        >
          <AlignJustify className="size-4" />
        </ToolbarButton>

        <span className="bg-border mx-0.5 h-6 w-px" aria-hidden="true" />

        <ToolbarButton onClick={toggleLink} active={active?.link} label="Inserir/remover link">
          {active?.link ? <Unlink className="size-4" /> : <Link2 className="size-4" />}
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      {/* Modo não-controlado: serializa o HTML num input oculto (FormData). No
          modo controlado (onChange), o valor vai pelo callback — sem input. */}
      {name && <input type="hidden" name={name} value={html} />}
    </div>
  );
}
