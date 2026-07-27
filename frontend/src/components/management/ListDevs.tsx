import {
  Button,
  ListGroup,
  Badge,
  type BadgeProps,
  Placeholder,
} from "react-bootstrap";
import type { User } from "@shared/models/Users.ts";
import Avatar from "../profile/Avatar";

interface ListDevsPropTypes {
  title: string;
  developers: User[] | undefined;
  action: (developer: User) => () => void;
  actionName: string;
  bg?: BadgeProps["bg"];
}

const ListDevs = ({
  title,
  developers,
  action,
  actionName,
  bg = undefined,
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
          <ListGroup as="ol" numbered className="management-list">
            {developers.map((user, index) => (
              <ListGroup.Item
                key={index}
                as="li"
                className={`d-flex justify-content-between align-items-start overflow-auto management-list-item ${index < developers.length - 1 ? "mb-2" : ""}`}
              >
                <div className="ms-2 me-auto">
                  <span className="fw-bold management-list-title">
                    <Avatar userFullName={user.name} /> {user.name}
                  </span>
                  <div>
                    <small className="management-list-meta">{`@${user.username}`}</small>
                  </div>
                </div>
                <Badge
                  bg="info"
                  className="text-decoration-none px-2 ms-5 me-1"
                  pill
                >
                  <Button
                    variant=""
                    size="sm"
                    as="a"
                    className="text-white fw-bold"
                    href={`mailto:${user.email}`}
                  >
                    Email
                  </Button>
                </Badge>
                <Badge bg={bg} className="px-2 me-1" pill>
                  <Button
                    variant=""
                    size="sm"
                    className="text-white fw-bold"
                    onClick={
                      action(user) as React.MouseEventHandler<HTMLElement>
                    }
                  >
                    {actionName}
                  </Button>
                </Badge>
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
