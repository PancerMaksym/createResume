"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { DraggableAttributes } from "@dnd-kit/core";

interface ItemProps {
  text: string;
  rowIndex: number;
  itemIndex: number;
  onDelete: (rowIndex: number, itemIndex: number) => void;
  onChange: (newText: string, rowIndex: number, itemIndex: number) => void;
}

const Item: React.FC<ItemProps> = ({
  text,
  onDelete,
  onChange,
  rowIndex,
  itemIndex,
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: text,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), rowIndex, itemIndex);
    },
  });

  if (!editor) return null;

  return (
    <div className="item-block">
      <div className="toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>
      </div>
      <div className="delete">
        <button onClick={() => onDelete(rowIndex, itemIndex)}>Delete</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default Item;
