"use client";
import React, { useState, useRef, memo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableCell, TableKit } from "@tiptap/extension-table";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TextAlign from "@tiptap/extension-text-align";

import ViewDayIcon from "@mui/icons-material/ViewDay";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import DragHandleIcon from "@mui/icons-material/DragHandle";

import "@/style/item.scss";

interface ItemProps {
  text: string;
  id: string;
  index: number;
  onDelete: (index: number) => void;
  onChange: (newText: string, index: number) => void;
}

const Item: React.FC<ItemProps> = ({ text, id, index, onChange, onDelete }) => {
  const [twoColumns, setTwoColumns] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      TableKit.configure({
        table: { resizable: true },
        tableCell: false,
      }),
      TableCell,
      Image,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: text,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), index);
    },
  });

  if (!editor) return null;

  const uploadStagedFile = async (stagedFile: File | Blob) => {
    const form = new FormData();
    form.set("file", stagedFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    console.log("data: ", data);
    editor.chain().focus().setImage({ src: data.imgUrl }).run();
  };

  const handleToggleColumns = () => {
    if (!twoColumns) {
      editor.chain().focus().addColumnAfter().run();
    } else {
      editor.chain().focus().deleteColumn().run();
    }
    setTwoColumns((prev) => !prev);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("file: ", file);
    if (file) {
      await uploadStagedFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div ref={setNodeRef} style={style} className="item-block">
      <div {...attributes} {...listeners} className="handle">
        <DragHandleIcon />
      </div>

      <div className="main_block">
        <div className="toolbar">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "active" : ""}
          >
            <strong>B</strong>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={editor.isActive("code") ? "active" : ""}
          >
            {"</>"}
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "active" : ""}
          >
            <em>I</em>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "active" : ""}
          >
            •
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={editor.isActive({ textAlign: "left" }) ? "active" : ""}
          >
            <FormatAlignLeftIcon />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={editor.isActive({ textAlign: "center" }) ? "active" : ""}
          >
            <FormatAlignCenterIcon />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={editor.isActive({ textAlign: "right" }) ? "active" : ""}
          >
            <FormatAlignRightIcon />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={
              editor.isActive({ textAlign: "justify" }) ? "active" : ""
            }
          >
            <FormatAlignJustifyIcon />
          </button>

          <button onClick={handleToggleColumns}>
            {!twoColumns ? <ViewDayIcon /> : <ViewColumnIcon />}
          </button>

          <button onClick={triggerFileInput}>
            <ImageIcon />
          </button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <button onClick={() => onDelete(index)}>
            <DeleteIcon />
          </button>
          <button onClick={() => editor.chain().focus().undo().run()}>
            <UndoIcon />
          </button>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default memo(Item);
