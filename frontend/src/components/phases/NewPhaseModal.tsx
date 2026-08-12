import { yupResolver } from "@hookform/resolvers/yup";
import type {
    CreatePhaseRequest,
    StoredPhase,
} from "@shared/models/Phases.ts";
import {
    useCallback,
    useId,
    useMemo,
    useState,
    type SubmitEventHandler,
} from "react";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as yup from "yup";
import { startOfToday, toDateInputValue } from "../../utils/phaseDates.ts";

type NewPhaseFormValues = {
    startsAt: string;
    duration: number;
};

interface NewPhaseModalProps {
    show: boolean;
    onHide: () => void;
    onCreated: (phase: StoredPhase) => void;
}

const DEFAULT_DURATION = 14;

export default function NewPhaseModal({
    show,
    onHide,
    onCreated,
}: NewPhaseModalProps) {
    const formId = useId();
    const [submitError, setSubmitError] = useState<string | null>(null);
    const minStartDate = useMemo(() => toDateInputValue(startOfToday()), []);
    const schema = useMemo(
        () =>
            yup.object().shape({
                startsAt: yup
                    .string()
                    .required("Enter a start date.")
                    .test(
                        "not-in-past",
                        "Start date must be today or later.",
                        (value) => !!value && value >= minStartDate,
                    ),
                duration: yup
                    .number()
                    .typeError("Enter a duration in days.")
                    .integer("Duration must be a whole number of days.")
                    .min(1, "Duration must be at least 1 day.")
                    .required("Enter a duration in days."),
            }),
        [minStartDate],
    );
    const defaultValues = useMemo(
        (): NewPhaseFormValues => ({
            startsAt: minStartDate,
            duration: DEFAULT_DURATION,
        }),
        [minStartDate],
    );
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<NewPhaseFormValues>({
        resolver: yupResolver(schema),
        mode: "onTouched",
        defaultValues,
    });

    const closeModal = useCallback(() => {
        reset(defaultValues);
        setSubmitError(null);
        onHide();
    }, [defaultValues, onHide, reset]);

    const submitHandler = useCallback(
        async (values: NewPhaseFormValues) => {
            setSubmitError(null);
            const request: CreatePhaseRequest = {
                startsAt: values.startsAt,
                duration: values.duration,
            };

            try {
                const response = await fetch("/api/phases", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(request),
                });
                if (!response.ok) {
                    let message = "Could not create this phase.";
                    try {
                        const body = (await response.json()) as {
                            message?: string;
                        };
                        if (body.message) message = body.message;
                    } catch {
                        // The fallback above handles non-JSON server errors.
                    }
                    setSubmitError(message);
                    return;
                }

                const phase = (await response.json()) as StoredPhase;
                onCreated(phase);
                closeModal();
            } catch {
                setSubmitError("Could not create this phase.");
            }
        },
        [closeModal, onCreated],
    ) as SubmitHandler<NewPhaseFormValues>;

    return (
        <Modal
            show={show}
            onHide={closeModal}
            centered
            aria-labelledby="new-phase-modal-title"
            dialogClassName="kanban-modal modal-todo"
        >
            <Modal.Header closeButton>
                <Modal.Title id="new-phase-modal-title">New Phase</Modal.Title>
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
                        controlId="new-phase-starts-at"
                        label="Start date"
                        className="mb-3"
                    >
                        <Form.Control
                            type="date"
                            placeholder="Start date"
                            min={minStartDate}
                            autoFocus
                            isInvalid={!!errors.startsAt}
                            {...register("startsAt")}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.startsAt?.message?.toString()}
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    <FloatingLabel
                        controlId="new-phase-duration"
                        label="Duration (days)"
                    >
                        <Form.Control
                            type="number"
                            min={1}
                            step={1}
                            placeholder="Duration (days)"
                            isInvalid={!!errors.duration}
                            {...register("duration", { valueAsNumber: true })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.duration?.message?.toString()}
                        </Form.Control.Feedback>
                    </FloatingLabel>

                    {submitError && (
                        <p
                            className="text-danger small mt-3 mb-0"
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
                    {isSubmitting ? "Creating…" : "Create Phase"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
