import { useEffect } from "react";
import { Badge, Container, Nav, Navbar, Spinner } from "react-bootstrap";
import { Link, NavLink } from "react-router";
import { AccountTypes, type User } from "@shared/models/Users.ts";
import ProfileDropdown from "./profile/ProfileComponent";
import Avatar from "./profile/Avatar";
import AgilityLogo from "./AgilityLogo";

interface AppNavbarProps {
  user: Pick<User, "name" | "accountType">;
  title: string;
}

export default function AppNavbar({ user, title }: AppNavbarProps) {
  const isManager = user.accountType === AccountTypes.Manager;

  useEffect(() => {
    document.title = `Agility | ${title}`;
  }, [title]);

  return (
    <Navbar className="navbar" expand="lg" sticky="top">
      <Container fluid className="navbar-container">
        <Navbar.Brand as={Link} to="/kanban" className="navbar-brand">
          <AgilityLogo className="navbar-logo" />
          <span>Agility</span>
        </Navbar.Brand>

        <Nav className="navbar-links me-auto">
          <Nav.Link as={NavLink} to="/kanban">
            Tasks
          </Nav.Link>

          {isManager && (
            <>
              <Nav.Link as={NavLink} to="/phases">
                Plan Phases
              </Nav.Link>

              <Nav.Link as={NavLink} to="/team">
                Manage Team
              </Nav.Link>
            </>
          )}
        </Nav>

        <Nav className="navbar-user" aria-label="Current user">
          <ProfileDropdown
            userName={user.name}
            profileComponent={<Avatar userFullName={user.name} />}
          />

          <span>
            {user.name ? user.name : <Spinner animation="border" />}
          </span>

          {isManager && (
            <Badge pill bg="light" className="navbar-role">
              ADMIN
            </Badge>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}
