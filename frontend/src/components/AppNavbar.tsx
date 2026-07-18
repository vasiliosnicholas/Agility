import { Badge, Container, Nav, Navbar } from "react-bootstrap";
import { Link, NavLink } from "react-router";
import { AccountTypes, type User } from "@shared/models/Users.ts";
import ProfileDropdown from "./profile/ProfileComponent";

interface AppNavbarProps {
  user: Pick<User, "name" | "accountType">;
}

export default function AppNavbar({ user }: AppNavbarProps) {
  const isManager = user.accountType === AccountTypes.Manager;

  return (
    <Navbar className="navbar">
      <Container fluid className="navbar-container">
        <Navbar.Brand as={Link} to="/kanban" className="navbar-brand">
          <svg className="navbar-logo" viewBox="0 0 18 18">
            <rect
              className="fill-todo"
              x="1"
              y="2"
              width="4"
              height="14"
              rx="1.5"
            />
            <rect
              className="fill-progress"
              x="7"
              y="0"
              width="4"
              height="16"
              rx="1.5"
            />
            <rect
              className="fill-completed"
              x="13"
              y="4"
              width="4"
              height="12"
              rx="1.5"
            />
          </svg>
          <span>Agility</span>
        </Navbar.Brand>
        <Nav className="navbar-links me-auto">
          <Nav.Link as={NavLink} to="/kanban">
            Tasks
          </Nav.Link>
          {isManager && (
            <Nav.Link as={NavLink} to="/phases">
              Plan Phases
            </Nav.Link>
          )}
        </Nav>

        <div className="navbar-user" aria-label="Current user">
          <ProfileDropdown
            profileComponent={
              <span className="navbar-avatar">
                {user.name.charAt(0).toUpperCase()}
              </span>
            }
          ></ProfileDropdown>

          <span>{user.name}</span>
          {isManager && (
            <Badge pill bg="light" className="navbar-role">
              ADMIN
            </Badge>
          )}
        </div>
      </Container>
    </Navbar>
  );
}
