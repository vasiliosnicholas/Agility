import { useState } from "react";
import { Button, Modal, NavDropdown } from "react-bootstrap";

export default function DeleteProfile() {
  const [show, setShow] = useState(false);

  const closeModal = () => setShow(false);
  const showModal = () => setShow(true);
  const handleDelete = async () => {
    const response = await fetch("/api/auth/user", {method:"DELETE"});
    if (response.ok) {
      alert("Account successfully deleted!");
      window.location.href = "/";
    } else {
      alert("Error deleting your account!");
    }
  };

  return (
    <>
      <NavDropdown.Item onClick={showModal}>
        Delete Profile
      </NavDropdown.Item>
      <Modal className="kanban-modal" show={show} onHide={closeModal}>
        <Modal.Header>Confirm Account Deletion</Modal.Header>
        <Modal.Body className="text-center">
          Are you sure you want to delete your account?
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button
            onClick={closeModal}
            variant="danger"
            className="modal-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            className="modal-submit"
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
