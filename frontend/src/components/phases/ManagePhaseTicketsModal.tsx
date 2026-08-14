import type { PhaseTicketsManageData } from "@shared/models/Phases.ts";
import type {
    AssignPhaseTicketRequest,
    UpdateTicketErrorResponse,
} from "@shared/models/Tickets.ts";
import type { UserMetaData } from "@shared/models/Users.ts";
import { useCallback, useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";

interface ManagePhaseTicketsModalProps {
    show: boolean;
    phaseId: string | null;
    onHide: () => void;
}

export default function ManagePhaseTicketsModal({
    show,
    phaseId,
    onHide,
}: ManagePhaseTicketsModalProps) {
    const [phaseTickets, setPhaseTickets] = useState<
        PhaseTicketsManageData["tickets"]
    >([]);
    const [backlogTickets, setBacklogTickets] = useState<
        PhaseTicketsManageData["backlogTickets"]
    >([]);
    const [teamMembers, setTeamMembers] = useState<UserMetaData[]>([]);
    const [selectedTicketId, setSelectedTicketId] = useState("");
    const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadToken, setReloadToken] = useState(0);

    const assigneeNames = new Map(
        teamMembers.flatMap((member) =>
            member._id ? [[member._id, member.name] as const] : [],
        ),
    );

    const closeModal = useCallback(() => {
        setLoading(true);
        setError(null);
        onHide();
    }, [onHide]);

    useEffect(() => {
        if (!show || !phaseId) return;

        const controller = new AbortController();

        void (async () => {
            try {
                const response = await fetch(`/api/phases/${phaseId}/tickets`, {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error("Could not load tickets for this phase.");
                }

                const data = (await response.json()) as PhaseTicketsManageData;
                if (controller.signal.aborted) return;

                setPhaseTickets(data.tickets);
                setBacklogTickets(data.backlogTickets);
                setTeamMembers(data.teamMembers);
                setSelectedTicketId(data.backlogTickets[0]?._id ?? "");
                setSelectedAssigneeId(data.teamMembers[0]?._id ?? "");
                setError(null);
            } catch (loadError) {
                if (
                    loadError instanceof DOMException &&
                    loadError.name === "AbortError"
                ) {
                    return;
                }
                setError(
                    loadError instanceof Error
                        ? loadError.message
                        : "Could not load tickets for this phase.",
                );
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [show, phaseId, reloadToken]);

    async function handleAssign() {
        if (!phaseId || !selectedTicketId || !selectedAssigneeId) return;

        setBusy(true);
        setError(null);
        const request: AssignPhaseTicketRequest = {
            ticketId: selectedTicketId,
            assigneeId: selectedAssigneeId,
        };

        try {
            const response = await fetch(`/api/phases/${phaseId}/tickets`, {
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
                setError(
                    responseError?.message ?? "Could not assign this ticket.",
                );
                return;
            }

            setLoading(true);
            setReloadToken((token) => token + 1);
        } catch {
            setError("Could not assign this ticket.");
        } finally {
            setBusy(false);
        }
    }

    async function handleRemove(ticketId: string) {
        if (!phaseId) return;

        setBusy(true);
        setError(null);
        try {
            const response = await fetch(
                `/api/phases/${phaseId}/tickets/${ticketId}`,
                { method: "DELETE" },
            );
            if (!response.ok) {
                let responseError: UpdateTicketErrorResponse | null = null;
                try {
                    responseError =
                        (await response.json()) as UpdateTicketErrorResponse;
                } catch {
                    // The fallback below handles non-JSON server errors.
                }
                setError(
                    responseError?.message ?? "Could not remove this ticket.",
                );
                return;
            }

            setLoading(true);
            setReloadToken((token) => token + 1);
        } catch {
            setError("Could not remove this ticket.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Modal
            show={show}
            onHide={closeModal}
            centered
            aria-labelledby="manage-phase-tickets-title"
            dialogClassName="kanban-modal modal-todo"
        >
            <Modal.Header closeButton>
                <Modal.Title id="manage-phase-tickets-title">
                    Manage Tickets
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading || !phaseId ? (
                    <p className="kanban-message mb-0">Loading tickets…</p>
                ) : (
                    <div className="manage-tickets">
                        <section className="manage-tickets-section">
                            <h3 className="manage-tickets-heading type-section">
                                On this phase
                            </h3>
                            {phaseTickets.length === 0 ? (
                                <p className="manage-tickets-empty">
                                    No tickets on this phase.
                                </p>
                            ) : (
                                <ul className="manage-tickets-list">
                                    {phaseTickets.map((ticket) => (
                                        <li
                                            key={ticket._id}
                                            className="manage-tickets-item"
                                        >
                                            <div className="manage-tickets-item-content">
                                                <span className="manage-tickets-item-title">
                                                    {ticket.title}
                                                </span>
                                                <span className="manage-tickets-item-meta">
                                                    {ticket.assigneeId
                                                        ? (assigneeNames.get(
                                                              ticket.assigneeId,
                                                          ) ?? "Unknown")
                                                        : "Unassigned"}
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="management-delete-button"
                                                disabled={busy}
                                                onClick={() =>
                                                    void handleRemove(
                                                        ticket._id,
                                                    )
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className="manage-tickets-section">
                            <h3 className="manage-tickets-heading type-section">
                                Add from backlog
                            </h3>
                            {backlogTickets.length === 0 ? (
                                <p className="manage-tickets-empty">
                                    No backlog tickets.
                                </p>
                            ) : (
                                <Form
                                    className="modal-form"
                                    onSubmit={(event) => {
                                        event.preventDefault();
                                        void handleAssign();
                                    }}
                                >
                                    <Form.Group className="mb-3">
                                        <Form.Label>Ticket</Form.Label>
                                        <Form.Select
                                            aria-label="Backlog ticket"
                                            value={selectedTicketId}
                                            disabled={busy}
                                            onChange={(event) =>
                                                setSelectedTicketId(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {backlogTickets.map((ticket) => (
                                                <option
                                                    key={ticket._id}
                                                    value={ticket._id}
                                                >
                                                    {ticket.title}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Assignee</Form.Label>
                                        <Form.Select
                                            aria-label="Assignee"
                                            value={selectedAssigneeId}
                                            disabled={busy}
                                            onChange={(event) =>
                                                setSelectedAssigneeId(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            {teamMembers.map((member) =>
                                                member._id ? (
                                                    <option
                                                        key={member._id}
                                                        value={member._id}
                                                    >
                                                        {member.name}
                                                    </option>
                                                ) : null,
                                            )}
                                        </Form.Select>
                                    </Form.Group>
                                    <Button
                                        type="submit"
                                        className="btn-action-approve modal-submit"
                                        disabled={
                                            busy ||
                                            !selectedTicketId ||
                                            !selectedAssigneeId
                                        }
                                    >
                                        {busy ? "Adding…" : "Add"}
                                    </Button>
                                </Form>
                            )}
                        </section>

                        {error && (
                            <p
                                className="text-danger type-meta mt-3 mb-0"
                                role="alert"
                                aria-live="polite"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    type="button"
                    className="btn-action-cancel modal-cancel"
                    onClick={closeModal}
                    disabled={busy}
                >
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
