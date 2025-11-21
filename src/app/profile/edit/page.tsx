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

const GET_USER = gql`
  query GetProfile {
    getProfile {
      id
      name
      photo
      tags
      places
      html_parts
    }
  }
`;

const UPDATE_RESUME = gql`
  mutation UpdateResume($updateProfileInput: UpdateProfileIntut!) {
    updateProfile(updateProfileInput: $updateProfileInput)
  }
`;

interface Resume {
  name: string;
  photo: string;
  place: string[];
  tags: string[];
  HTMLpart: {
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
  const { loading, error, data } = useQuery<Resume>(GET_USER);
  const [updateResume] = useMutation(UPDATE_RESUME);

  const user = data;

  const [image, setImage] = useState<string>(user ? user.photo : '');
  const [name, setName] = useState<string>(user ? user.name : '');
  const [places, setPlaces] = useState<string[]>(user ? user.place : ['']);
  const [tags, setTags] = useState<string[]>(user ? user.tags : ['']);
  const initialHtml: ColumnType[] = user
    ? user.HTMLpart.map((column) => createColumn(column.id, column.content))
    : [createColumn()];

  const [html, setHtml] = useState<ColumnType[]>(initialHtml);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeItemType, setActiveType] = useState<'Item' | 'Row' | null>(null);

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
        refetchQueries: ['Query'],
        awaitRefetchQueries: true,
      });

      router.push('/profile');
    } catch (err) {
      console.error('Failed to update resume:', err);
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
    setActiveId(null);
    setActiveType(null);
    console.log('Active: ', active);
    console.log('Over: ', over);

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

    console.log('updatedHtml: ', updatedHtml);
    setHtml(updatedHtml);
  };

  const onDragUpdate = (update: any) => {
    const { destination } = update;
    if (!destination) return;
  };

  const onDelete = (index: number) => {
    setHtml((prev) => prev.filter((_, i) => i !== index));
  };

  const onChange = (newText: string, index: number) => {
    setHtml((prev) => {
      const updated = [...prev];
      updated[index].content = newText;
      return updated;
    });
  };

  return (
    <main className="edit_page">
      <div className="main_part">
        <div className="main_inner">
          <Main
            image={image}
            name={name}
            places={places}
            tags={tags}
            onImageChange={setImage}
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
            html={html}
            onDragEnd={onDragEnd}
            onDragStart={onDragStart}
            onChange={onChange}
            onDelete={onDelete}
          />

          <Button
            onClick={() => {
              setHtml([...html, createColumn()]);
            }}
          >
            Add block
          </Button>
        </div>
      </div>
    </main>
  );
};

export default EditPage;
