"use client";
import { useQuery, gql } from "@apollo/client";
import { Close } from "@mui/icons-material";
import { Avatar, Button, CircularProgress } from "@mui/material";
import { ObjectId } from "mongodb";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const GET_USERS = gql`
  query Query {
    getUsers {
      _id
      resume {
        name
        photo
        place
        tags
      }
    }
  }
`;

interface Resume {
  name: string;
  photo: string;
  place: string[];
  tags: string[];
}

interface GetUsersResponse {
  getUsers: {
    _id: ObjectId;
    resume: Resume;
  }[];
}

const SerchUser = () => {
  const { loading, error, data } = useQuery<GetUsersResponse>(GET_USERS);

  const searchParams = useSearchParams();
  const tags =
    searchParams
      .get("tags")
      ?.split(",")
      .filter((tag) => tag.trim() !== "") ?? [];

  let filteredUsers: GetUsersResponse["getUsers"][number][] = [];

  if (data) {
    if (tags && tags.length > 0) {
      filteredUsers = data.getUsers.filter((user) => {
        return tags.every((tag) =>
          user.resume.tags.some(
            (userTag) => userTag.toLowerCase() === tag.toLowerCase()
          )
        );
      });
    } else {
      filteredUsers = data.getUsers;
    }
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error</div>;
  }
  return (
    <div>
      <div className="tags">
        {tags.map((tag, index) => (
          <div key={index} className="tag">
            {tag}
            <Button
              variant="text"
              onClick={() => {
                const newTags = tags.filter((allTag) => allTag !== tag);
                const updatedUrl = new URL(window.location.href);
                updatedUrl.searchParams.set("tags", newTags.join(","));
                window.history.pushState({}, "", updatedUrl);
              }}
            >
              <Close />
            </Button>
          </div>
        ))}
      </div>
      <div className="users">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <Link key={index} href={`/serch/${user._id}`}>
              <div className="user">
                {user.resume.photo ? (
                  <Avatar src={user.resume.photo} alt={user.resume.name} />
                ) : (
                  <Avatar alt={user.resume.name}>
                    {user.resume.name[0]?.toUpperCase()}
                  </Avatar>
                )}
                <div className="user_data">
                  <h3>{user.resume.name}</h3>
                  <p className="user_place">{user.resume.place.join(", ")}</p>
                  <p className="user_tag">{user.resume.tags.join(", ")}</p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div>No users found with the selected tags</div>
        )}
      </div>
    </div>
  );
};

export default SerchUser;
