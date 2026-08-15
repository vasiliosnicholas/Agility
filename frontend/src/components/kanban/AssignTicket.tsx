import { type UserMetaData } from "@shared/models/Users";
import { FloatingLabel, Form, type FormSelectProps } from "react-bootstrap";
 
interface AssignTicketProps extends FormSelectProps {
  label?: string;
  teamMembers: UserMetaData[];
}

export default function AssignTicket({
  teamMembers,
  label = "Select Assignee for Ticket",
  "aria-label": ariaLabel = "Select Assignee for Ticket",
  ...props
}: AssignTicketProps) {
  return (
    <FloatingLabel label={label} controlId="select-assignee">
      <Form.Select
        aria-label={ariaLabel}
        id="select-assignee"
        {...props}
      >
        {teamMembers.map((member) =>
          member._id ? (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ) : null
        )}
      </Form.Select>
    </FloatingLabel>
  );
}
