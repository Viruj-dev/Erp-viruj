import { permissionedErpProcedure, requireErpActor } from "../middleware/auth";

const moduleStatus = (module: string, actor: ReturnType<typeof requireErpActor>) => ({
  module,
  organizationId: actor.organizationId,
  organizationType: actor.organizationType,
  ready: true,
});

export const patientsRouter = {
  summary: permissionedErpProcedure({
    patient: ["read"],
  }).handler(async ({ context }) => {
    const actor = requireErpActor(context);

    return moduleStatus("patients", actor);
  }),
};

export const billingRouter = {
  summary: permissionedErpProcedure({
    billing: ["read"],
  }).handler(async ({ context }) => {
    const actor = requireErpActor(context);

    return moduleStatus("billing", actor);
  }),
};

export const communityRouter = {
  summary: permissionedErpProcedure({
    community: ["read"],
  }).handler(async ({ context }) => {
    const actor = requireErpActor(context);

    return moduleStatus("community", actor);
  }),
};

export const schedulesRouter = {
  summary: permissionedErpProcedure({
    schedule: ["read"],
  }).handler(async ({ context }) => {
    const actor = requireErpActor(context);

    return moduleStatus("schedules", actor);
  }),
};
