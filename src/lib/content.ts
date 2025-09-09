import { UniqueIdentifier } from "@dnd-kit/core";
import { createContext } from "react";

interface contentType {
  onDelete: (index: number) => void;
  onChange: (newText: string, index: number) => void;
  activeId: UniqueIdentifier | null;
  activeItemType: "Item" | "Row" | null;
}

export default createContext<contentType | undefined>(undefined);