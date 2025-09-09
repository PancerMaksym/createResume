"use client";
import { gql, useQuery } from "@apollo/client";
import { Avatar, Button } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/style/profile.scss";

const GET_USER = gql`
  query Query {
    me {
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
  me: {
    resume: Resume | null;
  };
}

const Profile = () => {
  const router = useRouter();

  const { loading, error, data } = useQuery<GetUsersResponse>(GET_USER);

  if (loading) {
    return <div>Loading</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const user = data?.me.resume;

  const onLogout = () => {
    localStorage.setItem("token", "");
    window.dispatchEvent(new Event("storage"));
    router.push("/");
  };

  if (user) {
    return (
      <>
        {user ? (
          <div className="profile_page">
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

              <Link href={"/profile/edit"}>
                <Button variant="contained">Edit Resume</Button>
              </Link>
              <Button variant="contained" onClick={onLogout}>
                LogOut
              </Button>
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
        ) : (
          <Link href={"/profile/edit"}>
            <Button variant="contained">Create Resume</Button>
          </Link>
        )}
      </>
    );
  }
};

export default Profile;
