import { Button, ListGroup, Badge, type BadgeProps } from "react-bootstrap";
import type { User } from "@shared/models/Users.ts";

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
              className="text-decoration-none px-3 mx-1"
              pill
            >
              <Button variant="" size="sm" as="a" className="text-white"  href={`mailto:${user.email}`}> Email</Button>
            </Badge>
            <Badge bg={bg} className="px-3 mx-1" pill>
              <Button
                variant="" size="sm"
                className="text-white"
                onClick={action(user) as React.MouseEventHandler<HTMLElement>}
              >{actionName}</Button>
              
            </Badge>
          </ListGroup.Item>
        ))
      ) : (
        <p className="text-center mt-3">No developers in this category</p>
      )}
    </ListGroup>
  );
};

export default ListDevs;
