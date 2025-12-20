import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import * as React from "react";
import Item from "./item";

interface ColumnType {
  id: string;
  content: string;
}

interface ItemProps {
  html: ColumnType[];
  onDragEnd: ({ active, over }: DragEndEvent) => void;
  onDelete: (index: number) => void;
  onChange: (newText: string, index: number) => void;
}

const Kanban = ({
  html,
  onDragEnd,
  onChange,
  onDelete,
}: ItemProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <>
      <DndContext
        onDragEnd={onDragEnd}
        sensors={sensors}
      >
        <SortableContext items={html} strategy={verticalListSortingStrategy}>
          {html?.map((item, index) => (
            <div key={`${item.id}`} id={`${item.id}`}>
              <Item
                key={item.id}
                text={item.content}
                index={index}
                id={item.id}
                onDelete={onDelete}
                onChange={onChange}
              />
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </>
  );
};

export default React.memo(Kanban);
