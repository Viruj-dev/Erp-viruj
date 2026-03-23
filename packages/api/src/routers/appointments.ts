import { db } from "@erp_virujhealth/db";
import { appointments } from "@erp_virujhealth/db/schema/appointments";
import { desc, eq } from "drizzle-orm";
import z from "zod";

import { erpProcedure } from "../index";

const appointmentStatusSchema = z.enum([
  "pending_approval",
  "approved",
  "rejected",
  "completed",
  "cancelled",
  "no_show",
]);

export const appointmentsRouter = {
  getAll: erpProcedure.handler(async () => {
    return db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.createdAt), desc(appointments.appointmentDate));
  }),

  updateStatus: erpProcedure
    .input(
      z.object({
        id: z.string().min(1),
        status: appointmentStatusSchema,
        approvalNotes: z.string().trim().optional().nullable(),
      }),
    )
    .handler(async ({ input, context }) => {
      const now = new Date();
      const approver =
        context.session?.user?.name || context.session?.user?.email || "ERP";

      const updatePayload: Record<string, unknown> = {
        status: input.status,
        approvalNotes: input.approvalNotes || null,
        updatedAt: now,
      };

      if (input.status === "approved" || input.status === "rejected") {
        updatePayload.approvedAt = now;
        updatePayload.approvedBy = approver;
      }

      if (input.status === "completed") {
        updatePayload.completedAt = now;
      }

      if (input.status === "cancelled" || input.status === "rejected") {
        updatePayload.cancelledAt = now;
      }

      const [updated] = await db
        .update(appointments)
        .set(updatePayload)
        .where(eq(appointments.id, input.id))
        .returning();

      if (!updated) {
        throw new Error("Appointment not found");
      }

      return updated;
    }),
};
