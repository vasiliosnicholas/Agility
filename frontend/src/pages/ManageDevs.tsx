import { useState, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Badge,
  type BadgeProps,
} from "react-bootstrap";
import AppNavbar from "../components/AppNavbar";
import type { User } from "@shared/models/Users";

const fetchManagerInfo = async () => {
  const response = await fetch("/api/auth/user");
  return response.ok ? ((await response.json()) as User) : undefined;
};

const fetchUnassignedDevs = async () => {
  const response = await fetch("/api/developers/");
  return response.ok ? ((await response.json()) as User[]) : undefined;
};

const fetchAssignedDevs = async () => {
  const response = await fetch("/api/developers/&assigned=true");
  return response.ok ? ((await response.json()) as User[]) : undefined;
};

interface ListDevsPropTypes {
  developers: User[] | undefined;
  action: React.MouseEventHandler<HTMLElement>;
  actionName: string;
  bg?: BadgeProps["bg"];
}

const ListDevs = ({
  developers,
  action,
  actionName,
  bg = undefined,
}: ListDevsPropTypes) => {
  return (
    <ListGroup as="ol" numbered>
      {developers ? (
        developers.map((user, index) => (
          <ListGroup.Item
            key={index}
            as="li"
            className="d-flex justify-content-between align-items-start mb-2 overflow-auto"
          >
            <div className="ms-2 me-auto">
              <div className="fw-bold">{user.name}</div>
              <small>{`@${user.username}`}</small>
            </div>
            <Badge
              bg="primary"
              as="a"
              href={`mailto:${user.email}`}
              className="text-decoration-none px-3 mx-1"
              pill
            >
              Email
            </Badge>
            <Badge
              as="button"
              bg={bg}
              onClick={action}
              className="px-3 mx-1"
              pill
            >
              {actionName}
            </Badge>
          </ListGroup.Item>
        ))
      ) : (
        <p className="text-center mt-3">No developers in this category</p>
      )}
    </ListGroup>
  );
};

export default function ManageDevs() {
  const [manager, setManager] = useState<User | undefined>();
  const [assignedDevs, setAssignedDevs] = useState<User[] | undefined>();
  const [unassignedDevs, setUnassignedDevs] = useState<User[] | undefined>();
  const handleSetManager = useCallback(async () => {
    const user = await fetchManagerInfo();
    setManager(user);
  }, [setManager]) as () => void;

  const handleSetAssignedDevs = useCallback(async () => {
    const devs = await fetchAssignedDevs();
    setAssignedDevs(devs);
  }, [setAssignedDevs]) as () => void;

  const handleSetUnassignedDevs = useCallback(async () => {
    const devs = await fetchUnassignedDevs();
    setUnassignedDevs(devs);
  }, [setUnassignedDevs]) as () => void;

  function handleAssignment(developerId: string): React.MouseEventHandler<HTMLElement> {
    return () => {};
  }
  function handleUnassignment(developerId: string): React.MouseEventHandler<HTMLElement> {
    return () => {}
  }

  handleSetManager();
  handleSetAssignedDevs();
  handleSetUnassignedDevs();

  return (
    <>
      <AppNavbar
        user={manager ? manager : { name: "Error", accountType: "Error" }}
      ></AppNavbar>
      <div className="mb-5"></div>
      <div className="mb-5"></div>
      <div className="mb-5"></div>

      <Container fluid>
        <Row>
          <Col className="kanban-modal">
            <h3 className="text-center modal-title my-5">
              Developers assigned to your Team
            </h3>
            <ListDevs
              developers={assignedDevs}
              action={() => {
                return;
              }}
              actionName="Unassign"
              bg="primary"
            />
          </Col>
          <Col className="kanban-modal">
            <h3 className="text-center modal-title my-5">
              Unassigned developers
            </h3>
            <ListDevs
              developers={unassignedDevs}
              action={() => {
                return;
              }}
              actionName="Assign"
              bg="primary"
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
