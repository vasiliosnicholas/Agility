import React from "react";
import {
    PhaseStatuses,
    type DeletePhaseErrorResponse,
    type PhaseListResponse,
    type PhaseStatus,
} from "@shared/models/Phases.ts";
import type { User } from "@shared/models/Users.ts";
import AppNavbar from "../components/AppNavbar.tsx";
import ManagePhaseTicketsModal from "../components/phases/ManagePhaseTicketsModal.tsx";
import NewPhaseModal from "../components/phases/NewPhaseModal.tsx";
import PhaseSection, {
    type PhaseListItemView,
} from "../components/phases/PhaseSection.tsx";
import {
    addDays,
    formatPhaseDate,
    parseDateFromDateTimeString,
} from "../utils/phaseDates.ts";

interface GroupedPhases {
    planned: PhaseListItemView[];
    past: PhaseListItemView[];
}

interface ComputedPhase extends PhaseListItemView {
    status: PhaseStatus;
    startsAt: number;
    endsAt: number;
}

function toListItem({
    id,
    dateRange,
    duration,
    isActive,
}: ComputedPhase): PhaseListItemView {
    return { id, dateRange, duration, isActive };
}

function groupPhases(data: PhaseListResponse | null): GroupedPhases {
    if (!data) return { planned: [], past: [] };

    const phaseItems: ComputedPhase[] = data.phases.map((phase) => {
        const startsAt = parseDateFromDateTimeString(phase.startsAt);
        const endsAt = addDays(startsAt, Math.max(phase.duration, 1));
        return {
            id: phase._id,
            dateRange: `${formatPhaseDate(startsAt)} – ${formatPhaseDate(endsAt)}`,
            duration: phase.duration,
            isActive: phase.status === PhaseStatuses.Active,
            status: phase.status,
            startsAt: startsAt.getTime(),
            endsAt: endsAt.getTime(),
        };
    });

    const active = phaseItems.find(
        ({ status }) => status === PhaseStatuses.Active,
    );
    const planned = phaseItems
        .filter(({ status }) => status === PhaseStatuses.Planned)
        .sort((first, second) => first.startsAt - second.startsAt);
    const past = phaseItems
        .filter(({ status }) => status === PhaseStatuses.Completed)
        .sort((first, second) => second.endsAt - first.endsAt);

    return {
        planned: [...(active ? [active] : []), ...planned].map(toListItem),
        past: past.map(toListItem),
    };
}

export default function PlanPhases() {
    const [user, setUser] = React.useState<User | null>(null);
    const [phaseData, setPhaseData] =
        React.useState<PhaseListResponse | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [actionError, setActionError] = React.useState<string | null>(null);
    const [showNewPhaseModal, setShowNewPhaseModal] = React.useState(false);
    const [managingPhaseId, setManagingPhaseId] = React.useState<string | null>(
        null,
    );
    const groupedPhases = React.useMemo(
        () => groupPhases(phaseData),
        [phaseData],
    );

    const loadPhases = React.useCallback(async (signal?: AbortSignal) => {
        try {
            const phasesResponse = await fetch("/api/phases", { signal });
            if (!phasesResponse.ok) {
                throw new Error("Could not load phases.");
            }
            setPhaseData((await phasesResponse.json()) as PhaseListResponse);
            setActionError(null);
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
                    : "Could not load phases.",
            );
        }
    }, []);

    React.useEffect(() => {
        const controller = new AbortController();

        async function loadPlanPhases() {
            try {
                const userResponse = await fetch("/api/auth/user", {
                    signal: controller.signal,
                });
                if (!userResponse.ok) {
                    throw new Error("Could not load your account.");
                }

                const loadedUser = (await userResponse.json()) as User;
                setUser(loadedUser);
                await loadPhases(controller.signal);
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
                        : "Could not load phases.",
                );
            }
        }

        void loadPlanPhases();
        return () => controller.abort();
    }, [loadPhases]);

    async function handlePhaseCreated() {
        await loadPhases();
    }

    async function handleDeletePhase(phaseId: string) {
        setActionError(null);

        async function sendDelete(confirmMoveTicketsToBacklog?: boolean) {
            return fetch(`/api/phases/${phaseId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    confirmMoveTicketsToBacklog
                        ? { confirmMoveTicketsToBacklog: true }
                        : {},
                ),
            });
        }

        try {
            let response = await sendDelete();

            if (response.status === 409) {
                let deleteError: DeletePhaseErrorResponse | null = null;
                try {
                    deleteError =
                        (await response.json()) as DeletePhaseErrorResponse;
                } catch {
                    // Fall through to generic error handling.
                }

                if (deleteError?.requiresConfirmation) {
                    const ticketCount = deleteError.ticketCount ?? 0;
                    const confirmed = window.confirm(
                        `${ticketCount} ticket${ticketCount === 1 ? "" : "s"} will be moved to backlog if you delete this phase. Continue?`,
                    );
                    if (!confirmed) return;
                    response = await sendDelete(true);
                }
            }

            if (!response.ok) {
                let responseError: DeletePhaseErrorResponse | null = null;
                try {
                    responseError =
                        (await response.json()) as DeletePhaseErrorResponse;
                } catch {
                    // Keep the fallback message for non-JSON errors.
                }
                setActionError(
                    responseError?.message ?? "Could not delete this phase.",
                );
                return;
            }

            await loadPhases();
        } catch {
            setActionError("Could not delete this phase.");
        }
    }

    if (!user) {
        return (
            <div className="kanban-page">
                <main className="kanban-page-content">
                    <p
                        className="kanban-message"
                        role={error ? "alert" : undefined}
                    >
                        {error ?? "Loading phases…"}
                    </p>
                </main>
            </div>
        );
    }

    return (
        <div className="kanban-page">
            <AppNavbar user={user} title="Phases"/>
            <main className="kanban-page-content management-page">
                <header className="management-page-header">
                    <h1 className="type-hero">Plan Phases</h1>
                    <p className="type-body text-muted">
                        Review the active schedule and upcoming phases.
                    </p>
                </header>
                {actionError && (
                    <p className="kanban-message" role="alert">
                        {actionError}
                    </p>
                )}
                {error ? (
                    <p className="kanban-message" role="alert">
                        {error}
                    </p>
                ) : phaseData ? (
                    <div className="management-sections">
                        <PhaseSection
                            id="planned-phases"
                            title="Planned"
                            phases={groupedPhases.planned}
                            emptyMessage="There are no planned phases."
                            onAddPhase={() => setShowNewPhaseModal(true)}
                            onManageTickets={setManagingPhaseId}
                            onDeletePhase={(phaseId) =>
                                void handleDeletePhase(phaseId)
                            }
                        />
                        <PhaseSection
                            id="past-phases"
                            title="Past"
                            phases={groupedPhases.past}
                            emptyMessage="There are no past phases."
                        />
                    </div>
                ) : (
                    <p className="kanban-message">Loading phases…</p>
                )}
            </main>
            <NewPhaseModal
                show={showNewPhaseModal}
                onHide={() => setShowNewPhaseModal(false)}
                onCreated={() => void handlePhaseCreated()}
            />
            <ManagePhaseTicketsModal
                show={managingPhaseId !== null}
                phaseId={managingPhaseId}
                onHide={() => setManagingPhaseId(null)}
            />
        </div>
    );
}
