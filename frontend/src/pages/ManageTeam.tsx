import { useState, useCallback, useEffect, useRef } from "react";
import { Container, Row, Col, Placeholder } from "react-bootstrap";
import AppNavbar from "../components/AppNavbar";
import type { User } from "@shared/models/Users";
import {
  CaretLeftFill,
  CaretRightFill,
  CaretUp,
  CaretDown,
  CaretDownFill,
  CaretUpFill,
} from "react-bootstrap-icons";
import ListDevs from "../components/management/ListDevs";
import VerticalMotionIndicator from "../components/VerticalMotionIndicator";
import type { ColElementRefObject } from "../hooks/useGridKeyboardControls";
import type { KanbanData } from "@shared/models/Kanban";
import type { StoredTicket } from "@shared/models/Tickets";

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

const fetchKanbanData = async () => {
  const response = await fetch("/api/kanban");

  return response.ok
    ? ((await response.json()) as KanbanData)
    : undefined;
};

async function updateDeveloperAssignment(
  developerId: string,
  method: "PUT" | "DELETE"
) {
  return fetch(`/api/developers/${developerId}`, { method });
}

type UserTuple = [User[] | undefined, User[] | undefined];

export default function ManageDevs() {
  const headingRef = useRef<HTMLElement>(null);

  const [manager, setManager] = useState<User | undefined>();

  const [[assignedDevs, unassignedDevs], setAssignedAndUnassignedDevs] =
    useState<UserTuple>([undefined, undefined]);

  const [tickets, setTickets] = useState<StoredTicket[]>();

  const [leftColumnRef, setLeftColumnRef] =
    useState<ColElementRefObject<HTMLElement>>();

  const [rightColumnRef, setRightColumnRef] =
    useState<ColElementRefObject<HTMLElement>>();

  const handleSetManager = useCallback(async () => {
    const user = await fetchManagerInfo();
    setManager(user);
  }, []);

  const handleSetDevs = useCallback(async () => {
    const devs = await Promise.all([
      fetchAssignedDevs(),
      fetchUnassignedDevs(),
    ]);

    setAssignedAndUnassignedDevs(devs);
  }, []);

  const handleSetTickets = useCallback(async () => {
    const response = await fetchKanbanData();

    setTickets(
      response?.tickets.filter(
        (ticket) => ticket.phaseId === response.phase?._id
      )
    );
  }, []);

  function handleAssignment(developer: User) {
    return async () => {
      if (!developer._id) {
        alert("This developer is missing an ID");
        return;
      }

      try {
        const response = await updateDeveloperAssignment(
          developer._id,
          "PUT"
        );

        if (!response.ok) {
          const error = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;

          alert(
            error?.message ||
              `Error assigning ${developer.username}`
          );

          return;
        }

        const newAssignedDevs = assignedDevs
          ? [...assignedDevs, developer]
          : [developer];

        const newUnassignedDevs = unassignedDevs
          ? unassignedDevs.filter(
              (dev) => dev._id !== developer._id
            )
          : [];

        setAssignedAndUnassignedDevs([
          newAssignedDevs,
          newUnassignedDevs,
        ]);

        await handleSetTickets();
      } catch {
        alert(`Error assigning ${developer.username}`);
      }
    };
  }

  function handleUnassignment(developer: User) {
    return async () => {
      if (!developer._id) {
        alert("This developer is missing an ID");
        return;
      }

      try {
        const response = await updateDeveloperAssignment(
          developer._id,
          "DELETE"
        );

        if (!response.ok) {
          const error = (await response.json().catch(() => null)) as
            | { message?: string }
            | null;

          alert(
            error?.message ||
              `Error unassigning ${developer.username}`
          );

          return;
        }

        const newUnassignedDevs = unassignedDevs
          ? [...unassignedDevs, developer]
          : [developer];

        const newAssignedDevs = assignedDevs
          ? assignedDevs.filter(
              (dev) => dev._id !== developer._id
            )
          : [];

        setAssignedAndUnassignedDevs([
          newAssignedDevs,
          newUnassignedDevs,
        ]);

        await handleSetTickets();
      } catch {
        alert(`Error unassigning ${developer.username}`);
      }
    };
  }

  useEffect(() => {
    void handleSetManager();
    void handleSetDevs();
    void handleSetTickets();

    headingRef.current?.focus();
  }, [handleSetManager, handleSetDevs, handleSetTickets]);

  return (
    <>
      <AppNavbar
        user={
          manager
            ? manager
            : { name: "", accountType: "" }
        }
        title="Manage your Team"
      />

      <div className="kanban-page">
        <main className="kanban-page-content management-page">
          <header
            className="management-page-header"
            ref={headingRef}
            tabIndex={0}
          >
            {manager ? (
              <h1 className="type-hero">
                {`${manager.name}'s Team`}
              </h1>
            ) : (
              <Placeholder as="h1" animation="wave">
                <Placeholder xs={5} className="rounded-2" />
              </Placeholder>
            )}

            <h2 className="type-body text-muted">
              Add and remove developers from your team. <br />
              Contact developers via email.
            </h2>
          </header>

          <Container
            fluid
            className="mt-4 d-flex flex-row justify-content-center"
            aria-label="Developer assignment lists. Press Enter to navigate through developers in a section with navigation controls. Press Escape to navigate between assigned and unassigned developer sections with navigation controls. Alternatively, use the horizontal arrow keys for section traversal and vertical arrow keys for developer traversal"
          >
            <Row className="d-flex flex-row w-100">
              <Col>
                <ListDevs
                  title="Developers assigned to your team"
                  developers={assignedDevs}
                  tickets={tickets}
                  action={handleUnassignment}
                  actionName="Unassign"
                  actionChildren={
                    <div>
                      <CaretRightFill className="d-none d-lg-inline" />
                      <CaretDownFill className="d-lg-none" />
                    </div>
                  }
                  actionOrientation="last"
                  actionButtonClass="btn-action-destructive"
                  setColumnRef={(colRef) =>
                    setLeftColumnRef(colRef)
                  }
                  rightColumnRef={rightColumnRef}
                />
              </Col>

              <VerticalMotionIndicator />

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
                  actionButtonClass="btn-action-approve"
                  setColumnRef={(colRef) =>
                    setRightColumnRef(colRef)
                  }
                  leftColumnRef={leftColumnRef}
                />
              </Col>
            </Row>
          </Container>
        </main>
      </div>
    </>
  );
}
