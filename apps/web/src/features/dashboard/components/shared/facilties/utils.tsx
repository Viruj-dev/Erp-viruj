import { AlertTriangle, CalendarCheck, CheckCircle2, ClipboardList, Star, Zap } from "lucide-react";
import type { ChangeEvent } from "react";
import type { VirujFacility, VirujFacilityInput, VirujFacilityStatus } from "@/lib/viruj-backend";
import type { FacilityAction, FacilityRoute, FilterState, SortKey } from "./types";
export function parseFacilityRoute(segments: string[]): FacilityRoute {
  const facilityIndex = segments.indexOf("facilities");
  const trailing = facilityIndex >= 0 ? segments.slice(facilityIndex + 1) : [];
  const first = trailing[0];
  const second = trailing[1];
  if (first === "new") return { mode: "create" };
  if (first && first !== "dashboard" && second === "edit") return { id: first, mode: "edit" };
  return { mode: "list" };
}
export function filterAndSortFacilities(
  facilities: VirujFacility[],
  query: string,
  filters: FilterState,
  sortKey: SortKey
) {
  const normalizedQuery = query.trim().toLowerCase();
  return facilities
    .filter((facility) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          facility.name,
          facility.category,
          facility.shortDescription,
          facility.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        filters.category === "all" || facility.category === filters.category;
      const matchesStatus =
        filters.status === "all" || facility.status === filters.status;
      const matchesFeatured =
        filters.featured === "all" ||
        (filters.featured === "featured"
          ? facility.isFeatured
          : !facility.isFeatured);
      const matchesQuick =
        filters.quick === "all" ||
        (filters.quick === "twentyfour" && facility.available247) ||
        (filters.quick === "emergency" && facility.emergencyService) ||
        (filters.quick === "online" && facility.onlineBooking) ||
        (filters.quick === "appointment" && facility.appointmentRequired);
      return (
        matchesQuery &&
        matchesCategory &&
        matchesStatus &&
        matchesFeatured &&
        matchesQuick
      );
    })
    .sort((first, second) => {
      switch (sortKey) {
        case "alphabetical":
          return first.name.localeCompare(second.name);
        case "display-order":
          return first.displayOrder - second.displayOrder;
        case "featured":
          return (
            Number(second.isFeatured) - Number(first.isFeatured) ||
            first.displayOrder - second.displayOrder
          );
        case "newest":
          return (
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(first.createdAt).getTime() -
            new Date(second.createdAt).getTime()
          );
        case "updated":
        default:
          return (
            new Date(second.updatedAt).getTime() -
            new Date(first.updatedAt).getTime()
          );
      }
    });
}
export function buildFacilityStats(facilities: VirujFacility[]) {
  return [
    {
      icon: <ClipboardList size={18} />,
      label: "Total Services",
      value: String(facilities.length),
    },
    {
      icon: <CheckCircle2 size={18} />,
      label: "Active",
      value: String(facilities.filter((item) => item.status === "active").length),
    },
    {
      icon: <Star size={18} />,
      label: "Featured",
      value: String(facilities.filter((item) => item.isFeatured).length),
    },
    {
      icon: <Zap size={18} />,
      label: "24x7",
      value: String(facilities.filter((item) => item.available247).length),
    },
  ];
}
export function validateFacilityForm(
  form: VirujFacilityInput,
  existingFacilities: VirujFacility[]
) {
  const errors: string[] = [];
  if (!form.name.trim()) errors.push("Service Name is required.");
  if (!form.category) errors.push("Category is required.");
  if (form.startingPrice !== null && form.startingPrice < 0)
    errors.push("Price cannot be negative.");
  const slug = form.slug || slugify(form.name);
  if (slug && existingFacilities.some((facility) => facility.slug === slug))
    errors.push("Slug must be unique.");
  return errors;
}
export function getFacilityPermissions(
  role?: string | null
): Record<FacilityAction, boolean> {
  const normalized = role?.toUpperCase();
  const all = {
    archive: true,
    create: true,
    delete: true,
    publish: true,
    read: true,
    update: true,
  };
  if (
    !normalized ||
    ["OWNER", "ADMIN", "ORG_ADMIN", "CLINIC_OWNER", "CLINIC_ADMIN"].includes(
      normalized
    )
  )
    return all;
  if (["MANAGER"].includes(normalized)) return { ...all, delete: false };
  if (["RECEPTIONIST", "APPOINTMENT_HANDLER"].includes(normalized))
    return {
      archive: false,
      create: false,
      delete: false,
      publish: false,
      read: true,
      update: true,
    };
  return {
    archive: false,
    create: false,
    delete: false,
    publish: false,
    read: true,
    update: false,
  };
}
export function toFacilityInput(facility: VirujFacility): VirujFacilityInput {
  return {
    appointmentRequired: facility.appointmentRequired,
    available247: facility.available247,
    bannerImage: facility.bannerImage,
    category: facility.category,
    currency: facility.currency,
    description: facility.description,
    displayOrder: facility.displayOrder,
    emergencyService: facility.emergencyService,
    galleryImages: facility.galleryImages,
    isAvailable: facility.isAvailable,
    isFeatured: facility.isFeatured,
    keywords: facility.keywords,
    name: facility.name,
    onlineBooking: facility.onlineBooking,
    priceText: facility.priceText,
    seoDescription: facility.seoDescription,
    seoTitle: facility.seoTitle,
    shortDescription: facility.shortDescription,
    slug: facility.slug,
    startingPrice: facility.startingPrice,
    status: facility.status,
    visibility: facility.visibility,
  };
}
export function formatPrice(facility: VirujFacility) {
  if (facility.priceText) return facility.priceText;
  if (facility.startingPrice !== null)
    return `${facility.currency === "INR" ? "Rs" : facility.currency} ${facility.startingPrice.toLocaleString("en-IN")}`;
  return "Optional";
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
export function splitComma(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
export function readImage(file: File, onImage: (value: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onImage(reader.result);
  };
  reader.readAsDataURL(file);
}
export async function readImages(event: ChangeEvent<HTMLInputElement>) {
  const files = Array.from(event.target.files ?? []);
  const images = await Promise.all(
    files.map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(typeof reader.result === "string" ? reader.result : "");
          reader.readAsDataURL(file);
        })
    )
  );
  return images.filter(Boolean);
}
