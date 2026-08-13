import { useState, useCallback } from "react";
import { NavDropdown, Accordion } from "react-bootstrap";
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

  const [activeKey, setActiveKey] = useState<string | null | undefined>(
    undefined
  );

  handleSetFormData();

  return (
    <>
      <Accordion
        flush
        activeKey={activeKey}
        onClick={() => setActiveKey(activeKey ? null : "0")}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setActiveKey(null);
        }}
      >
        <Accordion.Item eventKey="0">
          <Accordion.Header>Manage profile</Accordion.Header>
          <Accordion.Body aria-label="Manage Profile">
            <FormWindow
              Modes={[UpdateProfile]}
              ModalButton={NavDropdown.Item}
              initialFormsData={formData ? [formData] : undefined}
              tabIndex={0}
              as="button"
              autoFocus
            />
            <DeleteProfile />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </>
  );
}
