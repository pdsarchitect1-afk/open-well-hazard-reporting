import authoritiesData from "@/data/authorities.json";
import type { Authority } from "./types";

type AuthorityMap = Record<string, Authority[]>;

const data = authoritiesData as AuthorityMap;

/**
 * Suggest the responsible authorities for a given district.
 * Falls back to a generic government chain when the district is unknown.
 * This starter dataset is intentionally small — admins can extend it later.
 */
export function suggestAuthorities(district?: string): Authority[] {
  if (district && data[district]) {
    return data[district];
  }
  return data._default ?? [];
}
