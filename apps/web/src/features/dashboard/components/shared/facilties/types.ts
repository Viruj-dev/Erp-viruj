import type { VirujFacilityCategory, VirujFacilityStatus } from "@/lib/viruj-backend";

export type FacilityAction =
  | "archive"
  | "create"
  | "delete"
  | "publish"
  | "read"
  | "update";

export type FacilityRoute =
  | { mode: "create" }
  | { id: string; mode: "edit" }
  | { mode: "list" };

export type SortKey =
  | "alphabetical"
  | "display-order"
  | "featured"
  | "newest"
  | "oldest"
  | "updated";

export type FilterState = {
  availability: "all" | "available" | "unavailable";
  category: "all" | VirujFacilityCategory;
  featured: "all" | "featured" | "not-featured";
  quick: "all" | "appointment" | "emergency" | "online" | "twentyfour";
  status: "all" | VirujFacilityStatus;
};