import { useState, type JSX } from "react";
import { Alert, NavDropdown } from "react-bootstrap";
import ManageProfileComponent from "./ManageProfileComponent";

interface ProfileDropdownProps {
  profileComponent: JSX.Element;
  userName: string;
}

export default function ProfileDropdown({
  profileComponent,
  userName,
}: ProfileDropdownProps) {
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLogoutError("");
    setLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });

      if (!response.ok) {
        setLogoutError("Could not log out. Please try again.");
        return;
      }

      window.location.href = "/login#logout";
    } catch {
      setLogoutError("Could not connect to the server.");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <NavDropdown
      title={
        <span aria-label="Profile actions dropdown">{profileComponent}</span>
      }
    >
      <NavDropdown.Header>
        {userName ? `Hello, ${userName}` : "Profile"}
      </NavDropdown.Header>

      <ManageProfileComponent />

      <NavDropdown.Item
        as="button"
        onClick={() => void logout()}
        disabled={loggingOut}
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </NavDropdown.Item>

      {logoutError && (
        <Alert variant="danger" className="m-2 py-2" role="alert">
          {logoutError}
        </Alert>
      )}
    </NavDropdown>
  );
}
