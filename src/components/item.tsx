"use client";
import React, { useContext, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TableCell, TableKit } from "@tiptap/extension-table";
import myContext from "@/lib/content.ts";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "@/style/item.scss";

interface ItemProps {
  text: string;
  id: string;
  index: number;
}

const Item: React.FC<ItemProps> = ({ text, id, index }) => {
  const { onChange, onDelete } = useContext(myContext)!;
  const [twoColumns, setTwoColumns] = useState(false);
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
    console.log("data: ", data)
    // Вставляємо картинку в редактор
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

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    console.log("file: ", file)
    if (file) {
      await uploadStagedFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div ref={setNodeRef} style={style} className="item-block">
      <div {...attributes} {...listeners}>
        ...
      </div>

      <div className="toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleCode().run()}>
          Code
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
        <button onClick={handleToggleColumns}>
          {!twoColumns ? "Add Column" : "Delete Columns"}
        </button>
        <button onClick={triggerFileInput}>Add image</button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      <div className="delete">
        <button onClick={() => onDelete(index)}>Delete</button>
        <button onClick={() => editor.chain().focus().undo().run()}>Undo</button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
};

export default Item;
