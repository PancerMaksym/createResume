"use client";
import { Avatar, Button, TextField } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Item from "@/components/item";
import "@/style/edit.scss";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import React from "react";
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Draggable from "@/components/itemDrag";
import { CSS } from "@dnd-kit/utilities";
import RowDrag from "@/components/rowDrag";
import { ConstructionOutlined } from "@mui/icons-material";

const GET_USER = gql`
  query Query {
    me {
      resume {
        name
        photo
        place
        tags
        HTMLpart
      }
    }
  }
`;

const UPDATE_RESUME = gql`
  mutation UpdateResume($resume: ResumeInput) {
    updateResume(resume: $resume)
  }
`;

interface Resume {
  name: string;
  photo: string;
  place: string[];
  tags: string[];
  HTMLpart: string[][];
}

interface GetUsersResponse {
  me: {
    resume: Resume | null;
  };
}

interface ItemType {
  id: string;
  content: string;
}

interface ColumnType {
  id: string;
  items: ItemType[];
}

const createItem = (content: string = ""): ItemType => ({
  id: Math.random().toString(36).substring(2, 10),
  content,
});

const createColumn = (items: ItemType[] = [createItem()]): ColumnType => ({
  id: Math.random().toString(36).substring(2, 10),
  items,
});

const EditPage = () => {
  const router = useRouter();
  const { loading, error, data } = useQuery<GetUsersResponse>(GET_USER);
  const [updateResume, { loading: updatelog, error: updateerr }] =
    useMutation(UPDATE_RESUME);

  const user = data?.me.resume;

  const [image, setImage] = useState<string>(user ? user.photo : "");
  const [name, setName] = useState<string>(user ? user.name : "");
  const [places, setPlaces] = useState<string[]>(user ? user.place : [""]);
  const [tags, setTags] = useState<string[]>(user ? user.tags : [""]);
  const initialHtml: ColumnType[] = user
    ? user.HTMLpart.map((column) =>
        createColumn(column.map((cell) => createItem(cell)))
      )
    : [createColumn()];

  const [html, setHtml] = useState<ColumnType[]>(initialHtml);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const itemIds = useMemo(
    () => html.flatMap((row) => row.items.map((item) => `item-${item.id}`)),
    [html]
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const onSave = async () => {
    try {
      await updateResume({
        variables: {
          resume: {
            name,
            photo: image,
            place: places,
            tags,
            HTMLpart: html,
          },
        },
        refetchQueries: ["Query"],
        awaitRefetchQueries: true,
      });

      router.push("/profile");
    } catch (err) {
      console.error("Failed to update resume:", err);
    }
  };

  if (loading) return <div>loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!user) return <div>No user data found</div>;

  const AutoWidthTextField = ({
    value,
    onBlurUpdate,
  }: {
    value: string;
    onBlurUpdate: (newVal: string) => void;
  }) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    return (
      <TextField
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={() => onBlurUpdate(localValue)}
        variant="outlined"
        InputProps={{
          sx: {
            padding: 0,
            width: "auto",
          },
        }}
        inputProps={{
          style: {
            width: `${Math.max(localValue.length, 4)}ch`,
          },
        }}
        sx={{
          width: "auto",
          minWidth: "40px",
        }}
      />
    );
  };

  const onDragEnd = (event: DragEndEvent) => {
    console.log("event: ", event);
    const { active, over } = event;

    // Перевірка на наявність об'єктів і різні ID
    if (
      !over ||
      !over.data?.current ||
      !active.data?.current ||
      active.id === over.id
    ) {
      return;
    }

    const updatedHtml = [...html];

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // === 1. Переміщення РЯДКІВ ===
    if (activeType === "Row" && overType === "Row") {
      console.log(1);

      const activeRowIndex = active.data.current.sortable?.index ?? -1;
      const overRowIndex = over.data.current.sortable?.index ?? -1;

      if (
        activeRowIndex >= 0 &&
        overRowIndex >= 0 &&
        updatedHtml[activeRowIndex] &&
        updatedHtml[overRowIndex]
      ) {
        [updatedHtml[activeRowIndex], updatedHtml[overRowIndex]] = [
          updatedHtml[overRowIndex],
          updatedHtml[activeRowIndex],
        ];
      }

      // === 2. Переміщення ЕЛЕМЕНТА в кінець РЯДКА ===
    } else if (activeType === "Item" && overType === "Row") {
      console.log(2);

      const fromRowIndex = active.data.current.sortable?.index ?? -1;
      const toRowIndex = over.data.current.sortable?.index ?? -1;
      const itemIndex = active.data.current?.item;

      if (
        fromRowIndex >= 0 &&
        toRowIndex >= 0 &&
        typeof itemIndex === "number" &&
        updatedHtml[fromRowIndex]?.items?.[itemIndex]
      ) {
        const [movedItem] = updatedHtml[fromRowIndex].items.splice(
          itemIndex,
          1
        );
        updatedHtml[toRowIndex].items.push(movedItem);
      }

      // === 3. Переміщення або заміна між ЕЛЕМЕНТАМИ ===
    } else if (activeType === "Item" && overType === "Item") {
      const activeRowIndex = active.data.current.sortable?.index ?? -1;
      const overRowIndex = over.data.current.sortable?.index ?? -1;

      if (
        activeRowIndex >= 0 &&
        overRowIndex >= 0 &&
        updatedHtml[activeRowIndex]?.items &&
        updatedHtml[overRowIndex]?.items
      ) {
        const activeItemId = active.data.current?.item?.id;
        const overItemId = over.data.current?.item?.id;

        const activeItemIndex = updatedHtml[activeRowIndex].items.findIndex(
          (item) => item.id === activeItemId
        );
        const overItemIndex = updatedHtml[overRowIndex].items.findIndex(
          (item) => item.id === overItemId
        );

        if (activeItemIndex === -1 || overItemIndex === -1) return;

        // === 3.1. Заміна елементів ===
        if (
          updatedHtml[activeRowIndex].id === updatedHtml[overRowIndex].id ||
          updatedHtml[overRowIndex].items.length === 2
        ) {
          console.log(3);
          [
            updatedHtml[activeRowIndex].items[activeItemIndex],
            updatedHtml[overRowIndex].items[overItemIndex],
          ] = [
            updatedHtml[overRowIndex].items[overItemIndex],
            updatedHtml[activeRowIndex].items[activeItemIndex],
          ];
        }

        // === 3.2. Переміщення елемента в інший рядок ===
        else {
          console.log(4);
          const [movedItem] = updatedHtml[activeRowIndex].items.splice(
            activeItemIndex,
            1
          );
          updatedHtml[overRowIndex].items.push(movedItem); // або .unshift(movedItem) якщо треба на початок
        }
      }
    }

    setHtml(updatedHtml);
  };

  const onDragUpdate = (update: any) => {
    const { destination } = update;
    if (!destination) return;
  };

  const onDelete = (rowIndex: number, itemIndex: number) => {
    const updated = [...html];
    updated[rowIndex].items.splice(itemIndex, 1);

    const cleaned = updated.filter((row) =>
      row.items.some((cell) => cell !== null)
    );

    setHtml(cleaned);
  };
  const onChange = (newText: string, rowIndex: number, itemIndex: number) => {
    const updated = [...html];
    updated[rowIndex].items[itemIndex].content = newText;
    setHtml(updated);
  };
  const addItem = (rowIndex: number) => {
    const updated = [...html];
    updated[rowIndex].items = [...updated[rowIndex].items, createItem()];
    setHtml(updated);
  };

  return (
    <div className="edit_page">
      <div className="main-part">
        <div>
          <input
            ref={inputRef}
            id="photo-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setImage(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          <Avatar
            src={image}
            sx={{ width: 50, height: 50, cursor: "pointer" }}
            onClick={() => inputRef.current?.click()}
          />
        </div>

        <TextField
          id="standard-required"
          focused
          label="Name"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="places">
          {places.map((place, index) => (
            <AutoWidthTextField
              key={`place-${index}`}
              value={place}
              onBlurUpdate={(newVal) => {
                setPlaces((prev) => {
                  const updated = [...prev];
                  updated[index] = newVal;
                  return updated;
                });
              }}
            />
          ))}
          <Button onClick={() => setPlaces((prev) => [...prev, ""])}>
            Add place
          </Button>
        </div>

        <div className="tags">
          {tags.map((tag, index) => (
            <AutoWidthTextField
              key={`tag-${index}`}
              value={tag}
              onBlurUpdate={(newVal) => {
                setTags((prev) => {
                  const updated = [...prev];
                  updated[index] = newVal;
                  return updated;
                });
              }}
            />
          ))}
          <Button onClick={() => setTags((prev) => [...prev, ""])}>
            Add tag
          </Button>
        </div>

        <Button variant="contained" onClick={onSave}>
          Save Data
        </Button>
      </div>

      <div className="html_map">
        <DndContext
          onDragEnd={onDragEnd}
          sensors={sensors}
          collisionDetection={closestCenter}
        >
          <SortableContext
            items={html.map((row) => `row-${row.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {html.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`}>
                <RowDrag
                  row={row}
                  itemIds={itemIds}
                  rowIndex={rowIndex}
                  onChange={onChange}
                  onDelete={onDelete}
                  addItem={addItem}
                />
              </div>
            ))}
          </SortableContext>
        </DndContext>

        <Button
          onClick={() => {
            setHtml([...html, createColumn()]);
          }}
        >
          Add block
        </Button>
      </div>
    </div>
  );
};

export default EditPage;
