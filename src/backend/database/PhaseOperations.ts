import { PhaseStatuses, type StoredPhase } from "../../shared/models/Phases.ts";
import { convertToPhase, getPhasesCollection } from "./Database.ts";

export async function getActivePhase(): Promise<StoredPhase | null> {
  const phaseDocument = await (
    await getPhasesCollection()
  ).findOne({ status: PhaseStatuses.Active }, { sort: { startsAt: -1 } });

  return phaseDocument ? convertToPhase(phaseDocument) : null;
}
