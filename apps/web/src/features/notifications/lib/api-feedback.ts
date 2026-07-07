import type { ApiFeedbackPayload } from "./notification-types";

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function shouldShowApiSuccess(method?: string) {
  return mutatingMethods.has((method ?? "GET").toUpperCase());
}

export function successTitleForApi({ method, path, title }: ApiFeedbackPayload) {
  if (title) return title;

  const normalizedPath = path?.toLowerCase() ?? "";
  const normalizedMethod = (method ?? "GET").toUpperCase();

  if (normalizedPath.includes("appointment") && normalizedPath.includes("status")) {
    return "Appointment updated";
  }
  if (normalizedPath.includes("staff/invitations") && normalizedMethod === "POST") {
    return "Staff invitation sent";
  }
  if (normalizedPath.includes("staff/members") && normalizedMethod === "DELETE") {
    return "Staff member removed";
  }
  if (normalizedPath.includes("staff/members") && normalizedPath.includes("role")) {
    return "Staff role updated";
  }
  if (normalizedPath.includes("doctors") && normalizedPath.includes("publish")) {
    return "Doctor profile published";
  }
  if (normalizedPath.includes("doctors") && normalizedMethod === "POST") {
    return "Doctor created";
  }
  if (normalizedPath.includes("doctors") && normalizedMethod === "PATCH") {
    return "Doctor profile updated";
  }
  if (normalizedPath.includes("facilities") && normalizedMethod === "POST") {
    return "Service added";
  }
  if (normalizedPath.includes("facilities") && normalizedPath.includes("status")) {
    return "Service status updated";
  }
  if (normalizedPath.includes("facilities") && normalizedPath.includes("reorder")) {
    return "Display order updated";
  }
  if (normalizedPath.includes("facilities") && normalizedMethod === "PATCH") {
    return "Service updated";
  }
  if (normalizedPath.includes("facilities") && normalizedMethod === "DELETE") {
    return "Service deleted";
  }
  if (normalizedPath.includes("gallery") && normalizedMethod === "POST") {
    return "Gallery item added";
  }
  if (normalizedPath.includes("gallery") && normalizedMethod === "PATCH") {
    return "Gallery item updated";
  }
  if (normalizedPath.includes("gallery") && normalizedMethod === "DELETE") {
    return "Gallery item removed";
  }
  if (normalizedPath.includes("patients") && normalizedMethod === "DELETE") {
    return "Patient records removed";
  }

  if (normalizedMethod === "POST") return "Created successfully";
  if (normalizedMethod === "PATCH" || normalizedMethod === "PUT") return "Updated successfully";
  if (normalizedMethod === "DELETE") return "Deleted successfully";
  return "Request completed";
}

export function errorTitleForApi({ status, title }: ApiFeedbackPayload) {
  if (title) return title;
  if (status === 401) return "Session expired";
  if (status === 403) return "Permission denied";
  if (status === 422) return "Validation failed";
  if (status && status >= 500) return "Server error";
  return "Request failed";
}

export function errorDescriptionForApi(payload: ApiFeedbackPayload) {
  if (payload.description) return payload.description;
  if (payload.status === 401) return "Please sign in again to continue.";
  if (payload.status === 403) return "Your current role cannot perform this action.";
  if (payload.status === 422) return "Please review the highlighted fields and try again.";
  if (payload.status && payload.status >= 500) return "The ERP service could not complete the request.";
  return "Something went wrong. Please try again.";
}
