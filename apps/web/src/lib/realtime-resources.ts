export const privateResources = [
  "appointments",
  "patients",
  "doctors",
  "diagnostics.orders",
  "diagnostics.services",
  "diagnostics.bookings",
  "facilities",
  "catalogue",
  "staff",
] as const;
export type PrivateResource = (typeof privateResources)[number];
export function isPrivateResource(value: unknown): value is PrivateResource {
  return (
    typeof value === "string" &&
    (privateResources as readonly string[]).includes(value)
  );
}
