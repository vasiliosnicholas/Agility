import { useState, useCallback, useEffect, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Placeholder,
} from "react-bootstrap";
import AppNavbar from "../components/AppNavbar";
import type { User } from "@shared/models/Users";
import {
  CaretLeft,
  CaretRight,
  CaretLeftFill,
  CaretRightFill,
  CaretUp,
  CaretDown,
  CaretDownFill,
  CaretUpFill,
} from "react-bootstrap-icons";
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [manager, setManager] = useState<User | undefined>();
  const [[assignedDevs, unassignedDevs], setAssignedAndUnassignedDevs] =
    useState<UserTuple>([undefined, undefined]);
  const handleSetManager = useCallback(async () => {
    const user = await fetchManagerInfo();
    setManager(user);
    headingRef.current?.focus();
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
        title="Manage your Team"
      ></AppNavbar>
      <div className="kanban-page">
        <main className="kanban-page-content management-page">
          <header className="management-page-header">
            {manager ? (
              <h1
                className="type-hero"
                ref={headingRef}
              >{`${manager.name}'s Team`}</h1>
            ) : (
              <Placeholder as="h1" animation="wave">
                <Placeholder xs={5} className="rounded-2" />{" "}
              </Placeholder>
            )}

            <h2 className="type-body text-muted">
              Add and remove developers from your team. <br /> Contact
              developers via email.
            </h2>
          </header>

          <Container
            fluid
            className="mt-4 d-flex flex-row justify-content-center"
          >
            <Row className="d-flex flex-row w-100">
              <Col>
                <ListDevs
                  title="Developers assigned to your team"
                  developers={assignedDevs}
                  action={handleUnassignment}
                  actionName="Unassign"
                  actionChildren={
                    <div>
                      <CaretRightFill className="d-none d-lg-inline" />
                      <CaretDownFill className="d-lg-none" />
                    </div>
                  }
                  actionOrientation="last"
                  variant="danger"
                />
              </Col>
              <Col
                xs={1}
                xl={1}
                xxl={1}
                className="d-none d-lg-flex flex-row h-100 m-0 p-0 align-self-start justify-content-center justify-items-center
              "
              >
                <Row className="h-100 p-0 m-0 gx-3">
                  <Col className="align-content-center p-0 m-0">
                    <CaretLeft color="grey" />
                  </Col>
                  <Col>
                    <div className="vr h-100 justify-self-center "></div>
                  </Col>
                  <Col className="align-content-center p-0 m-0">
                    <CaretRight color="grey" />
                  </Col>
                </Row>
              </Col>

              <div className="d-lg-none vstack align-items-center justify-items-center my-4">
                <CaretUp color="grey" />
                <hr className="w-100 my-2" />
                <CaretDown color="grey" />
              </div>
              <Col>
                <ListDevs
                  title="Unassigned developers"
                  developers={unassignedDevs}
                  action={handleAssignment}
                  actionName="Assign"
                  actionChildren={
                    <div>
                      <CaretUpFill className="d-lg-none" />
                      <CaretLeftFill className="d-none d-lg-inline" />
                    </div>
                  }
                  actionOrientation="first"
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
