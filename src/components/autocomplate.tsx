"use client";
import * as React from "react";
import {
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
  Box,
} from "@mui/material";
import { gql, useQuery } from "@apollo/client";
import { Search } from "@mui/icons-material";
import {useRouter} from "next/navigation";

// GraphQL запит для отримання тегів
const GET_TAGS = gql`
  query Query {
    getTags
  }
`;

interface Tags {
  getTags: string[];
}

const AutoComplete = () => {
  const { loading, error, data } = useQuery<Tags>(GET_TAGS);
  const router = useRouter();
  const [tags, setTags] = React.useState<string[]>([]); 

  if (error) return <div>Error: {error.message}</div>;

  const handleSearch = (value: string | undefined) => {
  
    const currentTags = new URLSearchParams(window.location.search)
      .get("tags")
      ?.split(",")
      .filter((tag) => tag.trim() !== "") ?? [];
  
    const newTags = value && currentTags.includes(value) ? currentTags : [...currentTags, value];
    const updatedUrl = `/serch?tags=${newTags.join(",")}`;
  
    router.push(updatedUrl);
  };
  
  return (
    <Autocomplete
      id="serch"
      className="custom-input"
      freeSolo
      loading
      limitTags={5}
      options={data?.getTags ?? []}
      onChange={(event, value) => {
        if (value) {
          handleSearch(value); 
        }
      }}

      renderInput={(params) => (
        <TextField
          {...params}
          label="Search"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                <InputAdornment position="end">
                    <IconButton onClick={() => {
                      handleSearch((params.inputProps.value)?.toString())}}
                    >
                      <Search />
                    </IconButton>
                </InputAdornment>
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default AutoComplete;
