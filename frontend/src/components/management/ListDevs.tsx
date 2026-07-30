import {
  Button,
  ListGroup,
  type ButtonProps,
  Placeholder,
} from "react-bootstrap";
import type { User } from "@shared/models/Users.ts";
import Avatar from "../profile/Avatar";

interface ListDevsPropTypes {
  title: string;
  developers: User[] | undefined;
  action: (developer: User) => () => void;
  actionChildren: React.JSX.Element;
  variant?: ButtonProps["variant"];
}

const ListDevs = ({
  title,
  developers,
  action,
  actionChildren,
  variant = undefined,
}: ListDevsPropTypes) => {
  return (
    <section className="management-section">
      <header className="management-section-header justify-content-start">
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
          <ListGroup as="ol" numbered className="management-list overflow-y-auto">
            {developers.map((user, index) => (
              <ListGroup.Item
                key={index}
                tabIndex={0}
                as="li"
                className={`d-flex justify-content-between align-items-start management-list-item ${index < developers.length - 1 ? "mb-2" : ""}`}
                action
              >
                <div className="ms-2 me-auto">
                  
                  <h4 className="fw-bold management-list-title">
                    <Avatar userFullName={user.name} /> {user.name}
                  </h4>
                  <div>
                    <small className="management-list-meta">{`@${user.username}`}</small>
                  </div>
                </div>

                <Button
                  variant="info"
                  as="a"
                  className="text-white fw-bold text-center px-3 me-1 rounded-5 py-lg-2"
                  href={`mailto:${user.email}`}
                >
                  Email
                </Button>

                <Button
                  variant={variant}
                  className="text-white fw-bold text-center px-3 d-lg-flex flex-lg-row align-items-center me-1 rounded-5 py-sm-0 py-lg-2"
                  onClick={action(user) as React.MouseEventHandler<HTMLElement>}
                >
                  {actionChildren}
                </Button>
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
          {" "}
          <Placeholder xs={6} className="rounded-2" />
          <Placeholder className="w-75 rounded-2" />{" "}
          <Placeholder className="rounded-2" style={{ width: "25%" }} />
        </Placeholder>
      )}
    </section>
  );
};

export default ListDevs;
