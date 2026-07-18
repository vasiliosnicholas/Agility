import { ObjectId } from "mongodb";

/**
 * Manager id + dev ids.
 */
export function getManagerTeamIds(
  userId: string,
  developers: unknown
): string[] {
  const developerIds = Array.isArray(developers)
    ? developers.flatMap((id) => {
        if (id instanceof ObjectId) return [id.toHexString()];
        return typeof id === "string" && ObjectId.isValid(id) ? [id] : [];
      })
    : [];
  return [...new Set([userId, ...developerIds])];
}
