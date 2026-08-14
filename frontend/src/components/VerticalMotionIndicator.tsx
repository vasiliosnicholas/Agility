import { Col, Row } from "react-bootstrap";
import { CaretLeft, CaretRight } from "react-bootstrap-icons";

/**
 * Vertical separator with left/right carets indicating motion
 * Hides below lg breakpoint.
 * @param props React.HTMLAttributes<HTMLElement> props
 * @returns vertical motion indicator.
 */
export default function VerticalMotionIndicator({
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <Col
      xs={1}
      xl={1}
      xxl={1}
      className="d-none d-lg-flex flex-row h-100 m-0 p-0 align-self-start justify-content-center justify-items-center"
      {...props}
    >
      <Row className="h-100 p-0 m-0 gx-3">
        <Col className="align-content-center p-0 m-0">
          <CaretLeft color="grey" />
        </Col>
        <Col>
          <div className="vr h-100 justify-self-center "></div>
        </Col>
        <Col className="align-content-center p-0 m-0">
          <CaretRight color="grey" />
        </Col>
      </Row>
    </Col>
  );
}
