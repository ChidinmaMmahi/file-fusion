import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import {
    HiOutlineBold,
    HiOutlineItalic,
    HiOutlineUnderline,
    HiOutlineStrikethrough,
    HiOutlineListBullet,
    HiOutlineQueueList,
    HiOutlineBars3BottomLeft,
    HiOutlineBars3,
    HiOutlineBars3BottomRight,
    HiOutlineArrowUturnLeft,
    HiOutlineArrowUturnRight,
} from "react-icons/hi2";
import { LuHeading1, LuHeading2, LuHeading3 } from "react-icons/lu";
import { RxTextAlignJustify } from "react-icons/rx";

type RichTextEditorProps = {
    content: string;
    onChange?: (html: string) => void;
};

const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-colors ${
            isActive
                ? "bg-accent/20 text-accent"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-glass"
        } ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
    >
        {children}
    </button>
);

const Divider = () => <div className="w-px h-5 bg-border mx-2" />;

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Underline,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: "Start editing your document...",
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "tiptap focus:outline-none min-h-[500px] p-4",
            },
        },
    });

    if (!editor) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden border border-border bg-surface-elevated">
            {/* Toolbar */}
            <div className="bg-surface-glass border-b border-border p-3 flex flex-wrap items-center gap-1">
                {/* Undo/Redo */}
                <MenuButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="Undo"
                >
                    <HiOutlineArrowUturnLeft className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="Redo"
                >
                    <HiOutlineArrowUturnRight className="text-lg" />
                </MenuButton>

                <Divider />

                {/* Headings */}
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    <LuHeading1 className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    <LuHeading2 className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                >
                    <LuHeading3 className="text-lg" />
                </MenuButton>

                <Divider />

                {/* Text formatting */}
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                    title="Bold"
                >
                    <HiOutlineBold className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                    title="Italic"
                >
                    <HiOutlineItalic className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive("underline")}
                    title="Underline"
                >
                    <HiOutlineUnderline className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                    title="Strikethrough"
                >
                    <HiOutlineStrikethrough className="text-lg" />
                </MenuButton>

                <Divider />

                {/* Lists */}
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                    title="Bullet List"
                >
                    <HiOutlineListBullet className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                    title="Numbered List"
                >
                    <HiOutlineQueueList className="text-lg" />
                </MenuButton>

                <Divider />

                {/* Text alignment */}
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    isActive={editor.isActive({ textAlign: "left" })}
                    title="Align Left"
                >
                    <HiOutlineBars3BottomLeft className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    isActive={editor.isActive({ textAlign: "center" })}
                    title="Align Center"
                >
                    <HiOutlineBars3 className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    isActive={editor.isActive({ textAlign: "right" })}
                    title="Align Right"
                >
                    <HiOutlineBars3BottomRight className="text-lg" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    isActive={editor.isActive({ textAlign: "justify" })}
                    title="Justify"
                >
                    <RxTextAlignJustify className="text-lg" />
                </MenuButton>
            </div>

            {/* Editor Content */}
            <div className="bg-surface p-2">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};
