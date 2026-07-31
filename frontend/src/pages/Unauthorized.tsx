import { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const elementAlignment = "justify-content-center";

const textAlignment = "text-center";

export default function Unauthorized() {
  useEffect(() => {document.title = `Agility | Unauthorized`}, []);
  return (
    <Modal show centered size="lg"  className="kanban-modal">
      <Modal.Header className={elementAlignment}>
        <h1 className={textAlignment}>Unauthorized</h1>
      </Modal.Header>
      <Modal.Body className={elementAlignment}>
        <h2 className={textAlignment}>You cannot access this content with your account type</h2>
      </Modal.Body>
      <Modal.Footer className={elementAlignment}>
        <Button type="button" onClick={() => history.back()} className="modal-submit">
          Go Back
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
