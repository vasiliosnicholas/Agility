import { PhaseStatuses, type StoredPhase } from "../../shared/models/Phases.ts";
import { convertToPhase, getPhasesCollection } from "./Database.ts";

export async function getPhases(): Promise<StoredPhase[]> {
  const phaseDocuments = await (
    await getPhasesCollection()
  )
    .find()
    .sort({ startsAt: 1, _id: 1 })
    .toArray();

  return phaseDocuments.map(convertToPhase);
}

export async function getActivePhase(): Promise<StoredPhase | null> {
  const phaseDocument = await (
    await getPhasesCollection()
  ).findOne({ status: PhaseStatuses.Active }, { sort: { startsAt: -1 } });

  return phaseDocument ? convertToPhase(phaseDocument) : null;
}
