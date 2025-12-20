'use client';

import { Avatar, Button, TextField } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core';
import Kanban from '../../../components/kanban';
import '../../../style/profile.scss';
import Main from '../../../components/main';
import { arrayMove } from '@dnd-kit/sortable';

const GET_USER = gql`
  query GetProfile {
    getProfile {
      id
      photo
      name
      places
      tags
      html_parts {
        id
        content
      }
    }
  }
`;

const UPDATE_RESUME = gql`
  mutation UpdateResume(
    $photo: String!
    $name: String!
    $places: [String!]
    $tags: [String!]
    $html_parts: [HtmlPartInput!]
  ) {
    updateProfile(
      updateProfileInput: {
        name: $name
        photo: $photo
        tags: $tags
        places: $places
        html_parts: $html_parts
      }
    )
  }
`;

interface Resume {
  name: string;
  photo: string;
  places: string[];
  tags: string[];
  html_parts: {
    id: string;
    content: string;
  }[];
}

interface ColumnType {
  id: string;
  content: string;
}

const createColumn = (
  id: string = Math.random().toString(36).substring(2, 10),
  content = '<table><tbody><tr><td/></tr></tbody></table>'
): ColumnType => ({
  id,
  content,
});

const EditPage = () => {
  const router = useRouter();
  const [updateResume] = useMutation<{ updateProfile: string }>(UPDATE_RESUME);
  const { loading, error, data } = useQuery<{ getProfile: Resume }>(GET_USER, {
    fetchPolicy: 'network-only',
  });

  const user = data?.getProfile;

  const [photo, setPhoto] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [places, setPlaces] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>(['']);
  const [htmlParts, setHtmlParts] = useState<ColumnType[]>([]);
  const htmlPartsRef = useRef<ColumnType[]>([]);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeItemType, setActiveType] = useState<'Item' | 'Row' | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!user) return;

    setPhoto(user.photo);
    setName(user.name);
    setPlaces(user.places ?? ['']);
    setTags(user.tags ?? ['']);

    const initial = user.html_parts?.length
      ? user.html_parts.map((c) => createColumn(c.id, c.content))
      : [createColumn()];

    setHtmlParts(initial);
    htmlPartsRef.current = initial;
  }, [user]);

  const syncHtml = (next: ColumnType[]) => {
    setHtmlParts(next);
    htmlPartsRef.current = next;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;
  if (!user) return <div>No user found</div>;

  const onSave = async () => {
    try {
      const mappedHtmlParts = htmlPartsRef.current.map((p) => ({
        id: p.id,
        content: p.content,
      }));

      const res = await updateResume({
        variables: {
          photo,
          name,
          places,
          tags,
          html_parts: mappedHtmlParts,
        },
      });

      if (res.data?.updateProfile === 'Success') {
        router.push('/profile');
      }
    } catch (err) {
      console.error('Failed to update resume:', err);
    }
  };

  const AutoWidthTextField = ({
    value,
    onBlurUpdate,
  }: {
    value: string;
    onBlurUpdate: (newVal: string) => void;
  }) => {
    const [localValue, setLocalValue] = useState(value);
    const spanRef = useRef<HTMLSpanElement>(null);
    const [width, setWidth] = useState(40);

    useEffect(() => {
      if (spanRef.current) {
        setWidth(spanRef.current.offsetWidth + 20);
      }
    }, [localValue]);

    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    return (
      <div className="field">
        <span
          ref={spanRef}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'pre',
            font: 'inherit',
          }}
        >
          {localValue || ' '}
        </span>

        <TextField
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={() => onBlurUpdate(localValue)}
          variant="outlined"
          InputProps={{
            sx: {
              padding: 0,
              width: 'auto',
            },
          }}
          inputProps={{ style: { width, padding: 0 }, maxLength: 20 }}
          sx={{
            width: 'auto',
            minWidth: '40px',
          }}
        />
      </div>
    );
  };

  function onDragStart({ active }: DragStartEvent) {
    setActiveType(active.data.current?.type);
    setActiveId(active.data.current?.id);
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const oldIndex = htmlParts.findIndex((p) => p.id === active.id);
    const newIndex = htmlParts.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    syncHtml(arrayMove(htmlParts, oldIndex, newIndex));
  };

  const onDragUpdate = (update: any) => {
    const { destination } = update;
    if (!destination) return;
  };

  const onDelete = (index: number) => {
    syncHtml(htmlParts.filter((_, i) => i !== index));
  };

  const onChange = (newText: string, index: number) => {
    syncHtml(
      htmlParts.map((p, i) => (i === index ? { ...p, content: newText } : p))
    );
  };

  return (
    <main className="edit_page">
      <div className="main_part">
        <div className="main_inner">
          <Main
            image={photo}
            name={name}
            places={places}
            tags={tags}
            onImageChange={setPhoto}
            onNameChange={setName}
            onPlacesChange={setPlaces}
            onTagsChange={setTags}
            onSave={onSave}
            AutoWidthTextField={AutoWidthTextField}
          />
        </div>
      </div>

      <div className="html_part">
        <div className="html_inner">
          <Kanban
            html={htmlParts}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onChange={onChange}
            onDelete={onDelete}
          />

          <Button onClick={() => syncHtml([...htmlParts, createColumn()])}>
            Add block
          </Button>
        </div>
      </div>
    </main>
  );
};

export default EditPage;
