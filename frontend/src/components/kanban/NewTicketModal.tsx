import { yupResolver } from "@hookform/resolvers/yup";
import {
    TicketStatuses,
    type CreateTicketRequest,
    type StoredTicket,
    type TicketCreationStatus,
    type TicketPriority,
    type UpdateTicketErrorResponse,
} from "@shared/models/Tickets.ts";
import {
    useCallback,
    useId,
    useState,
    type SubmitEventHandler,
} from "react";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as yup from "yup";

const PRIORITY_OPTIONS = [
    { value: 0, label: "Urgent" },
    { value: 1, label: "High Priority" },
    { value: 2, label: "Normal Priority" },
    { value: 3, label: "Low Priority" },
] satisfies ReadonlyArray<{
    value: TicketPriority;
    label: string;
}>;

const schema = yup.object().shape({
    title: yup
        .string()
        .trim()
        .required("Enter a ticket title.")
        .max(120, "Title must be 120 characters or fewer."),
    description: yup
        .string()
        .trim()
        .max(500, "Description must be 500 characters or fewer.")
        .defined(),
    priority: yup
        .mixed<TicketPriority>()
        .oneOf(
            PRIORITY_OPTIONS.map(({ value }) => value),
            "Select a priority.",
        )
        .required("Select a priority."),
});

type NewTicketFormValues = yup.InferType<typeof schema>;

interface NewTicketModalProps {
    show: boolean;
    status: TicketCreationStatus;
    onHide: () => void;
    onCreated: (ticket: StoredTicket) => void;
}

const DEFAULT_VALUES: NewTicketFormValues = {
    title: "",
    description: "",
    priority: 2,
};

export default function NewTicketModal({
    show,
    status,
    onHide,
    onCreated,
}: NewTicketModalProps) {
    const formId = useId();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<NewTicketFormValues>({
        resolver: yupResolver(schema),
        mode: "onTouched",
        defaultValues: DEFAULT_VALUES,
    });

    const closeModal = useCallback(() => {
        reset(DEFAULT_VALUES);
        setSubmitError(null);
        onHide();
    }, [onHide, reset]);

    const submitHandler = useCallback(
        async (values: NewTicketFormValues) => {
            setSubmitError(null);
            const description = values.description.trim();
            const request: CreateTicketRequest = {
                title: values.title.trim(),
                ...(description ? { description } : {}),
                priority: values.priority,
                status,
            };

            try {
                const response = await fetch("/api/kanban/tickets", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(request),
                });
                if (!response.ok) {
                    let responseError: UpdateTicketErrorResponse | null = null;
                    try {
                        responseError =
                            (await response.json()) as UpdateTicketErrorResponse;
                    } catch {
                        // The fallback below handles non-JSON server errors.
                    }
                    setSubmitError(
                        responseError?.message ?? "Could not create this ticket.",
                    );
                    return;
                }

                const ticket = (await response.json()) as StoredTicket;
                onCreated(ticket);
                closeModal();
            } catch {
                setSubmitError("Could not create this ticket.");
            }
        },
        [closeModal, onCreated, status],
    ) as SubmitHandler<NewTicketFormValues>;

    const isBacklog = status === TicketStatuses.Backlog;

    return (
        <Modal
            show={show}
            onHide={closeModal}
            centered
            aria-labelledby="new-ticket-modal-title"
            dialogClassName={`kanban-modal modal-${isBacklog ? "backlog" : "todo"}`}
        >
            <Modal.Header closeButton>
                <Modal.Title id="new-ticket-modal-title">
                    New {isBacklog ? "Backlog" : "To-Do"} Ticket
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form
                    id={formId}
                    className="modal-form"
                    noValidate
                    onSubmit={
                        handleSubmit(
                            submitHandler,
                        ) as SubmitEventHandler<HTMLFormElement>
                    }
                >
                    <FloatingLabel
                        controlId="new-ticket-title"
                        label="Title"
                        className="mb-3"
                    >
                        <Form.Control
                            type="text"
                            placeholder="Title"
                            autoFocus
                            isInvalid={!!errors.title}
                            {...register("title")}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.title?.message?.toString()}
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    <FloatingLabel
                        controlId="new-ticket-description"
                        label="Description (optional)"
                        className="mb-3"
                    >
                        <Form.Control
                            className="modal-description"
                            as="textarea"
                            rows={3}
                            placeholder="Description"
                            isInvalid={!!errors.description}
                            {...register("description")}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.description?.message?.toString()}
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    <FloatingLabel
                        controlId="new-ticket-priority"
                        label="Priority"
                    >
                        <Form.Select
                            aria-label="Ticket priority"
                            isInvalid={!!errors.priority}
                            {...register("priority", { valueAsNumber: true })}
                        >
                            {PRIORITY_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.priority?.message?.toString()}
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    {submitError && (
                        <p
                            className="text-danger type-meta mt-3 mb-0"
                            role="alert"
                            aria-live="polite"
                        >
                            {submitError}
                        </p>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    type="button"
                    className="btn-action-cancel modal-cancel"
                    onClick={closeModal}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form={formId}
                    className="btn-action-approve modal-submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creating…" : "Create Ticket"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
