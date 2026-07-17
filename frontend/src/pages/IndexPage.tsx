import LoginPage from "./LoginPage";

const display = (
  <>
    <h2 className="text-center">Your Destination for Project Management</h2>
  </>
);
export default function IndexPage() {
  return (
    <LoginPage defaultTitle="Welcome to Agility" children={display}></LoginPage>
  );
}
