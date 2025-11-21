'use client';

import { gql, useQuery } from '@apollo/client';
import { Avatar } from '@mui/material';
import '@/style/profile.scss';
import { useParams } from 'next/navigation';

const GET_USER = gql`
  query FindUser($id: Int) {
    findUser(id: $id) {
      name
      photo
      tags
      places
      html_parts
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

const UserPageWrapper = () => {
  const { id } = useParams<{ id: string }>();

  const { loading, error, data } = useQuery<Resume>(GET_USER, {
    variables: { id },
  });

  if (loading) return <div>loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (data) {
    const user = data;

    if (!user) return <div>User not found</div>;

    return (
      <div className="user_page">
        <div className="main_part">
          <div className="main_inner">
            {user.photo ? (
              <Avatar src={user.photo} alt={user.name} />
            ) : (
              <Avatar>{user.name[0]?.toUpperCase()}</Avatar>
            )}

            <h2>{user.name}</h2>

            <div className="places">
              <h4>Places:</h4>
              {user.place.map((place, index) => (
                <div className="single_field" key={index}>
                  {place}
                </div>
              ))}
            </div>

            <div className="tags">
              <h4>Tags:</h4>
              {user.tags.map((tag, index) => (
                <div className="single_field" key={index}>
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="html_part">
          <div className="html_inner">
            {user.HTMLpart.map((html) => (
              <div
                key={html.id}
                dangerouslySetInnerHTML={{ __html: html.content }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default UserPageWrapper;
