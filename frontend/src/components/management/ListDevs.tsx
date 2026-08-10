import {
  Button,
  ListGroup,
  type ButtonProps,
  Placeholder,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { EnvelopeFill } from "react-bootstrap-icons";
import type { User } from "@shared/models/Users.ts";
import Avatar from "../profile/Avatar";
import useGridKeyboardControls, {
  type AdjacentColumnRefObjectProps,
} from "../../hooks/useGridKeyboardControls";

interface ListDevsPropTypes
  extends AdjacentColumnRefObjectProps<HTMLElement>{
  title: string;
  developers: User[] | undefined;
  action: (developer: User) => () => void;
  actionName: string;
  actionChildren: React.JSX.Element;
  actionOrientation: "first" | "last";
  variant?: ButtonProps["variant"];
}

const ListDevs = ({
  title,
  developers,
  action,
  actionName,
  actionChildren,
  actionOrientation: actionOrder,
  variant = undefined,
  leftColumnRef,
  rightColumnRef,
  setColumnRef,
}: ListDevsPropTypes) => {
  const [handleRow, colProps] = useGridKeyboardControls<
    HTMLLIElement,
    HTMLElement
  >({ leftColumnRef, rightColumnRef, setColumnRef });

  return (
    <section className="management-section" {...colProps}>
      <header
        className="management-section-header justify-content-start"
        role="columnheader"
      >
        <h3 className="management-section-title">{title}</h3>
        <span className="management-section-count">
          {developers ? (
            `${developers.length} developer${developers.length != 1 ? "s" : ""}`
          ) : (
            <Placeholder as="span" animation="wave">
              <Placeholder xs={12} className="rounded-2"></Placeholder>
            </Placeholder>
          )}
        </span>
      </header>
      {developers ? (
        developers.length > 0 ? (
          <ListGroup
            as="ol"
            className="d-flex flex-column management-list overflow-y-auto"
          >
            {developers.map((user, index) => (
              <ListGroup.Item
                key={index}
                as="li"
                className={`management-list-item d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-stretch p-0 parent-with-actions ${actionOrder == "first" ? "ps-0" : "pe-0"} ${index < developers.length - 1 ? "mb-2" : ""}`}
                action
                {...handleRow(index)}
              >
                <div className="d-flex flex-row justify-content-between align-items-start w-100 p-2">
                  <div className={`ms-2 me-4`}>
                    <h4 className="fw-bold management-list-title">
                      <Avatar userFullName={user.name} /> {user.name}
                    </h4>
                    <div>
                      <small className="management-list-meta">{`@${user.username}`}</small>
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
                      variant="info"
                      as="a"
                      className="text-white fw-bold text-center px-sm-3 rounded-5 py-lg-2 hover-actions"
                      aria-label={`email ${user.name}`}
                      href={`mailto:${user.email}`}
                    >
                      <EnvelopeFill />
                    </Button>
                  </OverlayTrigger>
                </div>
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
                      variant={variant}
                      className=" text-white fw-bold text-center d-lg-flex flex-lg-row align-items-center rounded-0"
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
          <p className=" management-list-meta m-2 text-center">
            No {title.toLowerCase()}
          </p>
        )
      ) : (
        <Placeholder as="section" animation="wave">
          <Placeholder xs={6} className="rounded-2" />
          <Placeholder className="w-75 rounded-2" />
          <Placeholder className="rounded-2" style={{ width: "25%" }} />
        </Placeholder>
      )}
    </section>
  );
};

export default ListDevs;
