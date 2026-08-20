import {
  Button,
  ListGroup,
  Placeholder,
  OverlayTrigger,
  Tooltip,
  Container,
  Row,
} from "react-bootstrap";
import { EnvelopeFill } from "react-bootstrap-icons";
import type { Developer } from "@shared/models/Users.ts";
import Avatar from "../profile/Avatar";
import useGridKeyboardControls, {
  type AdjacentColumnRefObjectProps,
} from "../../hooks/useGridKeyboardControls";
import type React from "react";
import TaskProgressBar from "../kanban/TaskProgressBar";
import type { StoredTicket } from "@shared/models/Tickets";

interface ListDevsPropTypes extends AdjacentColumnRefObjectProps<HTMLElement> {
  title: string;
  developers: Developer[] | undefined;
  tickets?: StoredTicket[];
  action: (developer: Developer) => () => void;
  actionName: string;
  actionChildren: React.JSX.Element;
  actionOrientation: "first" | "last";
  actionButtonClass: string;
}

const ListDevs = ({
  title,
  developers,
  tickets,
  action,
  actionName,
  actionChildren,
  actionOrientation: actionOrder,
  actionButtonClass,
  leftColumnRef,
  rightColumnRef,
  setColumnRef,
}: ListDevsPropTypes) => {
  const [handleRow, colProps] = useGridKeyboardControls<
    HTMLDivElement,
    HTMLElement
  >({
    leftColumnRef,
    rightColumnRef,
    setColumnRef,
  });
  const titleId = `list-devs-${title.replace(/\s+/g, "-").toLowerCase()}-title`;
  const countId = `list-devs-${title.replace(/\s+/g, "-").toLowerCase()}-count`;
  const countLabel = developers
    ? `${developers.length} developer${developers.length !== 1 ? "s" : ""}`
    : undefined;

  return (
    <section
      className="management-section"
      {...colProps}
      aria-labelledby={titleId}
      aria-describedby={countLabel ? countId : undefined}
    >
      <header className="management-section-header justify-content-start">
        <h3 id={titleId} className="management-section-title type-section">
          {title}
        </h3>
        <span id={countId} className="management-section-count">
          {developers ? (
            countLabel
          ) : (
            <Placeholder as="span" animation="wave">
              <Placeholder xs={12} className="rounded-2"></Placeholder>
            </Placeholder>
          )}
        </span>
      </header>
      {developers ? (
        developers.length > 0 ? (
          <ListGroup className="overflow-y-auto d-flex flex-column management-list">
            {developers.map((user, index) => (
              <ListGroup.Item
                key={index}
                as="div"
                className={`management-list-item d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-stretch p-0 parent-with-actions ${actionOrder == "first" ? "ps-0" : "pe-0"} ${index < developers.length - 1 ? "mb-2" : ""}`}
                action
                {...handleRow(index)}
              >
                <Container fluid>
                  <Row>
                    <div className="flex-row p-2 d-flex justify-content-between align-items-start w-100">
                      <div className={`ms-2 me-4`}>
                        <h4 className="management-list-title">
                          <Avatar userFullName={user.name} /> {user.name}
                        </h4>
                        <div>
                          <span className="management-list-meta type-meta">{`@${user.username}`}</span>
                        </div>
                      </div>

                      <OverlayTrigger
                        placement="left"
                        delay={{ show: 0, hide: 0 }}
                        overlay={(props) => (
                          <Tooltip {...props}>Email {user.name}</Tooltip>
                        )}
                      >
                        <Button
                          as="a"
                          className="text-center btn-action-info px-sm-3 rounded-5 py-lg-2 hover-actions"
                          aria-label={`email ${user.name}`}
                          href={`mailto:${user.email}`}
                        >
                          <EnvelopeFill />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </Row>
                  {tickets && (
                    <Row>
                      <section>
                        <h5>{user.name}'s progress on the current phase</h5>
                        <TaskProgressBar
                          phaseTickets={tickets.filter(
                            ({ assigneeId }) => assigneeId == user._id,
                          )}
                          total={
                            tickets.filter(
                              ({ assigneeId }) => assigneeId == user._id,
                            ).length
                          }
                          className="mb-2"
                        />
                      </section>
                    </Row>
                  )}
                </Container>
                <div
                  className={`hover-actions flex-column flex-lg-row order-${actionOrder}`}
                >
                  <OverlayTrigger
                    placement="auto"
                    delay={{ show: 0, hide: 0 }}
                    overlay={(props) => (
                      <Tooltip {...props}>
                        {actionName} {user.name}
                      </Tooltip>
                    )}
                  >
                    <Button
                      className={`${actionButtonClass} text-center d-lg-flex flex-lg-row align-items-center rounded-0`}
                      aria-label={`${actionName} ${user.name}`}
                      onClick={
                        action(user) as React.MouseEventHandler<HTMLElement>
                      }
                    >
                      {actionChildren}
                    </Button>
                  </OverlayTrigger>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="m-2 text-center management-list-meta">
            No {title.toLowerCase()}
          </p>
        )
      ) : (
        <Placeholder as="section" animation="wave">
          <Placeholder xs={6} className="rounded-2" />
          <Placeholder
            className="ww-75 rounded-2 />
          <Placeholder className="
            rrounded-2
            style={{ width: "25%" }}
          />
        </Placeholder>
      )}
    </section>
  );
};

export default ListDevs;
