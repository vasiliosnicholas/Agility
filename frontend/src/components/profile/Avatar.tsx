import { Spinner } from "react-bootstrap";

function parseInitials(fullName: string) {
  return fullName.includes(" ")
    ? `${fullName.charAt(0).toUpperCase()}${fullName.split(" ")[1].charAt(0).toUpperCase()}`
    : fullName.charAt(0).toUpperCase();
}

export default function Avatar({
  userFullName,
}: {
  userFullName: string | null | undefined;
}) {
  return (
    <span className="navbar-avatar">
      {userFullName ? (
        parseInitials(userFullName)
      ) : (
        <Spinner animation="border" />
      )}
    </span>
  );
}
