'use client';
import { gql, useQuery } from '@apollo/client';
import { Avatar, Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../../style/profile.scss';

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

const Profile = () => {
  const router = useRouter();

  const { loading, error, data } = useQuery<Resume>(GET_USER);

  if (loading) {
    return <div>Loading</div>;
  }

  if (error) {
    router.push('/register');
  }

  const user = data;

  const onLogout = () => {
    localStorage.setItem('token', '');
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <>
      {user ? (
        <main className="profile_page">
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

              <div className="user_button">
                <Link href={'/profile/edit'}>
                  <Button variant="contained">Edit</Button>
                </Link>
                <Link className="logout_button" href={'/'}>
                  <Button onClick={onLogout} variant="contained">
                    LogOut
                  </Button>
                </Link>
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
