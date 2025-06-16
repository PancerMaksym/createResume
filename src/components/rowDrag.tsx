import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ItemDrag from "./itemDrag";

interface ItemType {
  id: string;
  content: string;
}

interface ColumnType {
  id: string;
  items: ItemType[];
}

interface ItemProps {
  row: ColumnType;
  rowIndex: number;
  itemIds: string[]
  onDelete: (rowIndex: number, itemIndex: number) => void;
  onChange: (newText: string, rowIndex: number, itemIndex: number) => void;
  addItem: (rowIndex: number) => void;
}

const RowDrag: React.FC<ItemProps> = ({
  row,
  rowIndex,
  onDelete,
  onChange,
  addItem,
  itemIds
}) => {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: `row-${row.id}`, data: { type: "Row", row } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className="row">
      <div {...attributes} {...listeners} className="row-handler">
        Рядок 
      </div>
      <SortableContext
        strategy={horizontalListSortingStrategy}
        items={row.items.map((item) => `item-${item.id}`)}
      >
        {row.items.map((item, itemIndex) => (
          <div key={`item-${item.id}`}>
            <ItemDrag
              key={item.id}
              item={item}
              rowIndex={rowIndex}
              itemIndex={itemIndex}
              onChange={onChange}
              onDelete={onDelete}
            />
          </div>
        ))}

        {row.items.length === 1 && (
          <button onClick={() => addItem(rowIndex)}>+</button>
        )}
      </SortableContext>
    </div>
  );
};

export default RowDrag;
