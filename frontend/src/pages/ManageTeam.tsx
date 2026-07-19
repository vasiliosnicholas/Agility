import { useState, useCallback, useEffect } from "react";
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
  const response = await fetch("/api/developers?assigned=true");
  return response.ok ? ((await response.json()) as User[]) : undefined;
};

async function handleConcurrentUpdate(
  developer: User,
  newAssignedDevs: User[],
  devUpdateMethod: "PUT" | "DELETE"
) {
  return Promise.all([
    fetch("/api/developers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAssignedDevs),
    }),
    fetch(`/api/developers/${developer._id}`, {
      method: devUpdateMethod,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(developer)
    }),
  ]);
}

interface ListDevsPropTypes {
  developers: User[] | undefined;
  action: (developer: User) => () => void;
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
              onClick={action(user) as React.MouseEventHandler<HTMLElement>}
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
type UserTuple = [User[] | undefined, User[] | undefined];

export default function ManageDevs() {
  const [manager, setManager] = useState<User | undefined>();
  const [[assignedDevs, unassignedDevs], setAssignedAndUnassignedDevs] =
    useState<UserTuple>([undefined, undefined]);
  const handleSetManager = useCallback(async () => {
    const user = await fetchManagerInfo();
    setManager(user);
  }, [setManager]) as () => void;

  const handleSetDevs = useCallback(async () => {
    const devs = await Promise.all([
      fetchAssignedDevs(),
      fetchUnassignedDevs(),
    ]);
    setAssignedAndUnassignedDevs(devs);
  }, [setAssignedAndUnassignedDevs]) as () => void;

  function handleAssignment(developer: User) {
    return async () => {
      const newAssignedDevs = assignedDevs
        ? [...assignedDevs, developer]
        : [developer];
      const newUnAssignedDevs = unassignedDevs
        ? unassignedDevs.filter((dev) => dev._id !== developer._id)
        : [];
      const [assignDevelopersResponse, assignManagerResponse] =
        await handleConcurrentUpdate(developer, newAssignedDevs, "PUT");
      if (assignDevelopersResponse.ok && assignManagerResponse.ok) {
        setAssignedAndUnassignedDevs([newAssignedDevs, newUnAssignedDevs]);
      } else {
        alert(`Error assigning ${developer.username}`);
      }
    };
  }

  function handleUnassignment(developer: User) {
    return async () => {
      const newUnAssignedDevs = unassignedDevs
        ? [...unassignedDevs, developer]
        : [developer];
      const newAssignedDevs = assignedDevs
        ? assignedDevs.filter((dev) => dev._id !== developer._id)
        : [];
      const [assignDevelopersResponse, assignManagerResponse] =
        await handleConcurrentUpdate(developer, newAssignedDevs, "DELETE");
      if (assignDevelopersResponse.ok && assignManagerResponse.ok) {
        setAssignedAndUnassignedDevs([newAssignedDevs, newUnAssignedDevs]);
      } else {
        alert(`Error unassigning ${developer.username}`);
      }
    };
  }
  useEffect(() => {
    handleSetManager();
    handleSetDevs();
  }, [handleSetManager, handleSetDevs]);

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
              action={handleUnassignment}
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
              action={handleAssignment}
              actionName="Assign"
              bg="primary"
            />
          </Col>
        </Row>
      </Container>
    </>
  );
}
