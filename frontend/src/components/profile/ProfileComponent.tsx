import { useCallback, useState, type JSX } from "react";
import { NavDropdown, Placeholder } from "react-bootstrap";
import { NavDropdownMenu } from "react-bootstrap-submenu";
import type { User } from "@shared/models/Users";
import ManageProfileComponent from "./ManageProfileComponent";

const logout = async () => {
  const reponse = await fetch("/api/auth/logout", { method: "POST" });
  if (reponse.ok) window.location.href = "/login#logout";
};

const defaultName = "";

const fetchUsername = async () => {
  const response = await fetch("/api/auth/user");
  return `Hello, ${response.ok ? ((await response.json()) as User).name : defaultName}`;
};

/**
 * Dopdown with profile actions: Manage profile, and logout
 * @returns Dropdown button.
 */
export default function ProfileDropdown({
  profileComponent,
}: {
  profileComponent: JSX.Element;
}) {
  const [name, setName] = useState(defaultName);
  const handleSetName = useCallback(async () => {
    const username = await fetchUsername();
    setName(username);
  }, [setName]) as () => void;

  handleSetName();

  return (
    <>
      <NavDropdownMenu title={profileComponent}>
        <NavDropdown.Header>
          {name ? (
            name
          ) : (
            <Placeholder as="span" animation="wave">
              <Placeholder xs={12} className="rounded-2"></Placeholder>
            </Placeholder>
          )}
        </NavDropdown.Header>

        <ManageProfileComponent />

        <NavDropdown.Item as="button" onClick={() => void logout()} disabled={!name}>
          Logout
        </NavDropdown.Item>
      </NavDropdownMenu>
    </>
  );
}
