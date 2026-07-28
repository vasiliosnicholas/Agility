import { useState, useCallback, useEffect } from "react";
import { Container, Row, Col, Placeholder } from "react-bootstrap";
import AppNavbar from "../components/AppNavbar";
import type { User } from "@shared/models/Users";

import ListDevs from "../components/management/ListDevs";

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
      body: JSON.stringify(developer),
    }),
  ]);
}

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
        user={manager ? manager : { name: "", accountType: "" }}
      ></AppNavbar>
      <div className="kanban-page">
        <main className="kanban-page-content management-page">
          <header className="management-page-header">
            {manager ? (
              <h1 className="type-hero">{`${manager.name}'s Team`}</h1>
            ) : (
              <Placeholder as="h1" animation="wave">
                {" "}
                <Placeholder xs={5} className="rounded-2" />{" "}
              </Placeholder>
            )}

            <h2 className="type-body text-muted">
              Add and remove developers from your team. <br /> Contact
              developers via email.
            </h2>
          </header>

          <Container fluid className="mt-4">
            <Row>
              <Col className="mb-4">
                <ListDevs
                  title="Developers assigned to your team"
                  developers={assignedDevs}
                  action={handleUnassignment}
                  actionName="Unassign"
                  variant="danger"
                />
              </Col>
              {/* <Col xs={1} xl={1} xxl={1} className="min-vh-100 m-0 p-0 align-self-center">
                <div className="vr min-vh-100 justify-self-center"></div>
              </Col> */}
              <Col className="mb-4">
                <ListDevs
                  title="Unassigned developers"
                  developers={unassignedDevs}
                  action={handleAssignment}
                  actionName="Assign"
                  variant="primary"
                />
              </Col>
            </Row>
          </Container>
        </main>
      </div>
    </>
  );
}
