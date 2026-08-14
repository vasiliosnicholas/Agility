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
      <NavDropdown.Item as="button" onClick={showModal}>
        Delete Profile
      </NavDropdown.Item>
      <Modal
        className="kanban-modal"
        show={show}
        onHide={closeModal}
        aria-labelledby="delete-profile-title"
        centered
      >
        <Modal.Header>
          <Modal.Title id="delete-profile-title">
            Confirm Account Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          Are you sure you want to delete your account?
        </Modal.Body>
        <Modal.Footer className="justify-content-between">
          <Button
            onClick={closeModal}
            className="btn-action-cancel modal-cancel"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="btn-action-destructive"
            onClick={() => void handleDelete()}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
