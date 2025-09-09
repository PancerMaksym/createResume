'use client'

import { gql, useQuery } from "@apollo/client";
import { Avatar } from "@mui/material";
import "@/style/profile.scss"
import { useParams } from 'next/navigation';

const GET_USER = gql`
  query Query($id: ID!) {
    getUser(id: $id) {
      resume {
        name
        photo
        place
        tags
        HTMLpart {
          id
          content
        }
      }
    }
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

interface GetUsersResponse {
  getUser: {
    resume: Resume | null;
  };
}

const UserPageWrapper = () => {
  const { id } = useParams<{id: string}>();
  
  const { loading, error, data } = useQuery<GetUsersResponse>(GET_USER, {
    variables: { id },
  });

  if (loading) return <div>loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (data) {
    const user = data?.getUser.resume;

    if (!user) return <div>User not found</div>;

    return (
      <div className="user_page">
        <div className="main_part">
          {user.photo ? (
            <Avatar src={user.photo} alt={user.name} />
          ) : (
            <Avatar>{user.name[0]?.toUpperCase()}</Avatar>
          )}
          <div>{user.name}</div>
          {user.place.map((place, index) => (
            <div key={index}>{place}</div>
          ))}
          {user.tags.map((tag, index) => (
            <div key={index}>{tag}</div>
          ))}
        </div>
        <div className="html_part">
          {user.HTMLpart.map((html) => (
            <div
              key={html.id}
              dangerouslySetInnerHTML={{ __html: html.content }}
            />
          ))}
        </div>
      </div>
    );
  }
};

export default UserPageWrapper;
