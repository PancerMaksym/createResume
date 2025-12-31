'use client';
import { gql, useQuery } from '@apollo/client';
import { Avatar, Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../../style/profile.scss';
import { useApolloClient } from '@apollo/client';
import {publish} from './../../components/header'
import { useCookies } from 'react-cookie';

const GET_USER = gql`
  query GetProfile{
    getProfile{
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

const Profile =() => {
  const router = useRouter();
  const client = useApolloClient();
  const [, , removeCookie] = useCookies(['access_token'])
  
  const { loading, error, data } = useQuery<{ getProfile: Resume }>(GET_USER, {
    fetchPolicy: 'network-only',
  });

  if (loading) {
    return <div>Loading</div>;
  }

  if (error) {
    router.push('/register');
  }

  const user = data?.getProfile;

  const onLogout = async () => {
    try {
      removeCookie('access_token', {path: '/'})
      localStorage.removeItem('access_token')
      await client.clearStore();
      await publish('auth:changed');
      router.push('/');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  return (
    <>
      {user?.name !== '' && user ? (
        <main className="profile_page">
          <div className="main_part">
            <div className="main_inner">
              {user.photo ? (
                <Avatar src={user.photo} alt={user.name} />
              ) : user.name ? (
                <Avatar>{user?.name[0]?.toUpperCase()}</Avatar>
              ) : null}
              {user.name ? <h2>{user.name}</h2> : null}
              {user.places ? (
                <div className="places">
                  <h4>Places:</h4>
                  {user.places.map((place, index) => (
                    <div className="single_field" key={index}>
                      {place}
                    </div>
                  ))}
                </div>
              ) : null}
              {user.tags ? (
                <div className="tags">
                  <h4>Tags:</h4>
                  {user.tags.map((tag, index) => (
                    <div className="single_field" key={index}>
                      {tag}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="user_button">
                <Link href={'/profile/edit'}>
                  <Button id='edit' variant="contained">Edit</Button>
                </Link>
                <div>
                  <Button onClick={onLogout} variant="contained">
                    LogOut
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="html_part">
            {user.places ? (
              <>
                <div className="html_inner">
                  {user.html_parts.map((html) => (
                    <div
                      key={html.id}
                      dangerouslySetInnerHTML={{ __html: html.content }}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </main>
      ) : (
        <Link href={'/profile/edit'}>
          <Button variant="contained">Create Resume</Button>
        </Link>
      )}
    </>
  );
};

export default Profile;
