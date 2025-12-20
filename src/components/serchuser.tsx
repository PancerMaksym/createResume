'use client';
import { useQuery, gql } from '@apollo/client';
import { Close } from '@mui/icons-material';
import { Avatar, Button, CircularProgress } from '@mui/material';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const GET_USERS = gql`
  query GetUsers($first: Int, $cursor: Int, $tags: [String!]) {
    findUsers(first: $first, cursor: $cursor, tags: $tags) {
      id
      photo
      name
      tags
    }
  }
`;

interface Resume {
  id: string;
  photo: string;
  name: string;
  tags: string[];
}

const SerchUser = () => {
  const searchParams = useSearchParams();
  const tags =
    searchParams
      .get('tags')
      ?.split(',')
      .filter((tag) => tag.trim() !== '') ?? [];

  const page = 0;

  const { loading, error, data } = useQuery<{findUsers: Resume[]}>(GET_USERS, {
    variables: {
      first: 5,
      cursor: page,
      tags: tags,
    },
  });

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    console.error('Error', error.message)
    return <div>Error</div>;
  }
  if (data) {
    const users = data.findUsers;
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
                  updatedUrl.searchParams.set('tags', newTags.join(','));
                  window.history.pushState({}, '', updatedUrl);
                }}
              >
                <Close />
              </Button>
            </div>
          ))}
        </div>
        <div className="users">
          {users.length > 0 ? (
            users.map((user, index) => (
              <Link key={index} href={`/serch/${user.id}`}>
                <div className="user">
                  {user.photo ? (
                    <Avatar src={user.photo} alt={user.name} />
                  ) : (
                    <Avatar alt={user.name}>
                      {user.name[0]?.toUpperCase()}
                    </Avatar>
                  )}
                  <div className="user_data">
                    <h3>{user.name}</h3>
                    <p className="user_tag">{user.tags.join(', ')}</p>
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
  }
};

export default SerchUser;
