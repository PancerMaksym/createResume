import { useDraggable } from "@dnd-kit/core";
import Item from "./item";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ItemProps {
  item: { content: string; id: string };
  rowIndex: number;
  itemIndex: number;
  onDelete: (rowIndex: number, itemIndex: number) => void;
  onChange: (newText: string, rowIndex: number, itemIndex: number) => void;
}

const ItemDrag: React.FC<ItemProps> = ({
  item,
  rowIndex,
  itemIndex,
  onDelete,
  onChange,
}) => {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: `item-${item.id}`, data: { type: "Item", item } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className="items-drag" ref={setNodeRef} style={style} >
      <div {...attributes} {...listeners}>
        ///
      </div>
      <Item
        text={item.content}
        itemIndex={itemIndex}
        rowIndex={rowIndex}
        onDelete={onDelete}
        onChange={onChange}
      />
    </div>
  );
};

export default ItemDrag;
