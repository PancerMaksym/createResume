"use client";
import { Avatar, Button, TextField } from "@mui/material";
import {
  createContext,
  useEffect,
  useRef,
  useState,
} from "react";
import "@/style/edit.scss";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import React from "react";
import {
  DragEndEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import Kanban from "@/components/kanban";

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
  HTMLpart: {
    id: string;
    content: string
  }[];
}

interface GetUsersResponse {
  me: {
    resume: Resume | null;
  };
}

interface ColumnType {
  id: string;
  content: string;
}

interface contentType {
  onDelete: (index: number) => void;
  onChange: (newText: string, index: number) => void;
  activeId: UniqueIdentifier | null;
  activeItemType: "Item" | "Row" | null;
}

const createColumn = (
  id: string = Math.random().toString(36).substring(2, 10),
  content: string = "<table><tbody><tr><td/></tr></tbody></table>"
): ColumnType => ({
  id,
  content,
});

export const MyContext = createContext<contentType | undefined>(undefined);

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
    ? user.HTMLpart.map((column) => createColumn(column.id, column.content))
    : [createColumn()];

  const [html, setHtml] = useState<ColumnType[]>(initialHtml);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeItemType, setActiveType] = useState<"Item" | "Row" | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

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

  function onDragStart({ active }: DragStartEvent) {
    setActiveType(active.data.current?.type);
    setActiveId(active.data.current?.id);
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setActiveType(null);
    console.log("Active: ", active);
    console.log("Over: ", over);

    if (!over?.data?.current || !active.data?.current) {
      return;
    }

    const updatedHtml = [...html];

    [
      updatedHtml[active.data.current.sortable.index],
      updatedHtml[over.data.current.sortable.index],
    ] = [
      updatedHtml[over.data.current.sortable.index],
      updatedHtml[active.data.current.sortable.index],
    ];

    console.log("updatedHtml: ", updatedHtml);
    setHtml(updatedHtml);
  };

  const onDragUpdate = (update: any) => {
    const { destination } = update;
    if (!destination) return;
  };

  const onDelete = (index: number) => {
    const updated = [...html];
    updated.splice(index, 1);

    setHtml(updated);
  };

  const onChange = (newText: string, index: number) => {
    const updated = [...html];
    updated[index].content = newText;
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
        <MyContext value={{ onDelete, onChange, activeId, activeItemType }}>
          <Kanban html={html} onDragEnd={onDragEnd} onDragStart={onDragStart} />
        </MyContext>

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
