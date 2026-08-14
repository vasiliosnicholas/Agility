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
  value=undefined,
  ...props
}: AssignTicketProps) {
  return (
    <FloatingLabel label={label}>
      <Form.Select
        aria-label={ariaLabel}
        value={value}
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
