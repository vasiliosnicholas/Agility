import { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const elementAlignment = "justify-content-center";

const textAlignment = "text-center";

export default function Unauthorized() {
  useEffect(() => {document.title = `Agility | 404`}, []);
  return (
    <Modal show centered size="lg">
      <Modal.Header className={elementAlignment}>
        <h1 className={textAlignment}>404</h1>
      </Modal.Header>
      <Modal.Body className={elementAlignment}>
        <h2 className={textAlignment}>Page not found!</h2>
      </Modal.Body>
      <Modal.Footer className={elementAlignment}>
        <Button type="button" onClick={() => history.back()}>
          Go Back
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
