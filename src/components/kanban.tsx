import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
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
  onDragStart: ({ active }: DragStartEvent) => void;
}

const Kanban = ({ html, onDragEnd, onDragStart }: ItemProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <>
      <DndContext
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        sensors={sensors}
      >
        <SortableContext items={html} strategy={verticalListSortingStrategy}>
          {html.map((item, index) => (
            <div key={`${item.id}`} id={`${item.id}`}>
              <Item text={item.content} index={index} id={item.id} />
            </div>
          ))}
        </SortableContext>
      </DndContext>
    </>
  );
};

export default Kanban;
