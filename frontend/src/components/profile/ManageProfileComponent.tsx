import { useState, useEffect, useCallback } from "react";
import { NavDropdown } from "react-bootstrap";
import { DropdownSubmenu } from "react-bootstrap-submenu";
import DeleteProfile from "./DeleteProfile";
import FormWindow from "../FormWindow";
import UpdateProfile from "./UpdateProfile";
import type { User } from "@shared/models/Users";
import type { RegisterFormData } from "../FormComponents.d.ts";

const fetchUserInfo = async () => {
  const response = await fetch("/api/auth/user");

  if (response.ok) {
    const user = (await response.json()) as User;
    const userData: RegisterFormData = {
      accountType: user.accountType,
      name: user.name,
      username: user.username,
      email: user.email,
      password: undefined,
      confirmPassword: undefined,
    };
    return userData;
  }
  return undefined;
};

export default function ManageProfileComponent() {
  const [formData, setFormData] = useState<RegisterFormData | undefined>();
  const handleSetFormData = useCallback(async () => {
    const formData = await fetchUserInfo();
    setFormData(formData);
  }, [setFormData]) as () => void;

  handleSetFormData();

  return (
    <>
      <DropdownSubmenu title="Manage profile">
        <NavDropdown.Header>Manage your profile</NavDropdown.Header>
        <FormWindow
          Modes={[UpdateProfile]}
          ModalButton={NavDropdown.Item}
          initialFormsData={formData ? [formData] : undefined}
        ></FormWindow>
        <DeleteProfile />
      </DropdownSubmenu>
    </>
  );
}
