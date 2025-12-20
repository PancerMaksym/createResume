import React, { useState } from 'react';
import { Avatar, Button, TextField } from '@mui/material';

interface AutoWidthTextFieldProps {
  value: string;
  onBlurUpdate: (newVal: string) => void;
}

interface MainProps {
  image: string;
  name: string;
  places: string[];
  tags: string[];
  onImageChange: (newImage: string) => void;
  onNameChange: (newName: string) => void;
  onPlacesChange: (newPlaces: string[]) => void;
  onTagsChange: (newTags: string[]) => void;
  onSave: () => void;
  AutoWidthTextField: React.FC<AutoWidthTextFieldProps>;
}

function EditableName({
  name,
  onNameChange,
}: {
  name: string;
  onNameChange: (value: string) => void;
}) {
  const [localData, setLocalData] = useState(name);

  return (
    <TextField
      className="name_input"
      id="standard-required"
      focused
      label="Name"
      variant="standard"
      value={localData}
      onChange={(e) => setLocalData(e.target.value)}
      onBlur={(e) => onNameChange(e.target.value)}
    />
  );
}

const Main: React.FC<MainProps> = ({
  image,
  name,
  places,
  tags,
  onImageChange,
  onNameChange,
  onPlacesChange,
  onTagsChange,
  onSave,
  AutoWidthTextField,
}) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <>
      <div>
        <input
          ref={inputRef}
          id="photo-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                onImageChange(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <Avatar
          src={image}
          sx={{ width: 50, height: 50, cursor: 'pointer' }}
          onClick={() => inputRef.current?.click()}
        />
      </div>
      <TextField
        className="name_input"
        id="standard-required"
        focused
        label="Name"
        variant="standard"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        onBlur={(e) => onNameChange(e.target.value)}
      />

      <div className="places">
        <h4>Places:</h4>
        {places?.map((place, index) => (
          <AutoWidthTextField
            key={`place-${index}`}
            value={place}
            onBlurUpdate={(newVal) => {
              const updated = [...places];
              updated[index] = newVal;
              onPlacesChange(updated);
            }}
          />
        ))}
        <Button onClick={() => onPlacesChange([...places, ''])}>
          Add place
        </Button>
      </div>

      <div className="tags">
        <h4>Tags:</h4>
        {tags?.map((tag, index) => (
          <AutoWidthTextField
            key={`tag-${index}`}
            value={tag}
            onBlurUpdate={(newVal) => {
              const updated = [...tags];
              updated[index] = newVal;
              onTagsChange(updated);
            }}
          />
        ))}
        <Button onClick={() => onTagsChange([...tags, ''])}>Add tag</Button>
      </div>

      <Button variant="contained" onClick={onSave}>
        Save Data
      </Button>
    </>
  );
};

export default React.memo(Main, (prev, next) => {
  return (
    prev.image === next.image &&
    prev.name === next.name &&
    prev.tags === next.tags &&
    prev.places === next.places
  );
});
