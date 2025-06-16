import UserPage from "../../../components/userPage";

const UserPageWrapper = async({ params }: { params: { id: string } }) => {
  const { id } = await params
  return <UserPage userId={id} />;
};

export default UserPageWrapper;
