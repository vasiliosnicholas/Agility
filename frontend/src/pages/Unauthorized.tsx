import { useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import AgilityLogo from "../components/AgilityLogo";

const elementAlignment = "justify-content-center";

const textAlignment = "text-center";

export default function Unauthorized() {
  useEffect(() => {document.title = `Agility | Unauthorized`}, []);
  return (
    <div  className="kanban-page">
    <Modal
      show
      centered
      size="lg"
      className="kanban-modal"
      aria-labelledby="unauthorized-title"
    >
      <Modal.Header className={elementAlignment}>
        <Modal.Title id="unauthorized-title" as="h1" className={textAlignment}>
          Unauthorized
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={elementAlignment}>
        <h2 className={textAlignment}>You cannot access this content with your account type</h2>
      </Modal.Body>
      <Modal.Footer className={elementAlignment}>
        <Button type="button" onClick={() => history.back()} className="btn-action-approve modal-submit">
          Go Back
        </Button>
      </Modal.Footer>
    </Modal>
    <AgilityLogo className="agility-logo-splash"/>
    </div>
  );
}
