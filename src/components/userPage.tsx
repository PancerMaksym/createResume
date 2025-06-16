// components/UserPage.tsx
"use client";

import { gql, useQuery } from "@apollo/client";
import { Avatar } from "@mui/material";

const GET_USER = gql`
  query Query($id: ID!) {
    getUser(id: $id) {
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

interface Resume {
  name: string;
  photo: string;
  place: string[];
  tags: string[];
  HTMLpart: string[];
}

interface GetUsersResponse {
  getUser: {
    resume: Resume | null;
  };
}

const UserPage = ({ userId }: { userId: string }) => {
  const { loading, error, data } = useQuery<GetUsersResponse>(GET_USER, {
    variables: { id: userId },
  });

  if (loading) return <div>loading...</div>;
  if (error) return <div>{error.message}</div>;

  if(data){
  const user = data?.getUser.resume;

  if (!user) return <div>User not found</div>;

  return (
    <div className="user_page">
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
  );
}
};

export default UserPage;
