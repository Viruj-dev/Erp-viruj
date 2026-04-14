import { db } from "@erp_virujhealth/db";
import { projects, projectTasks } from "@erp_virujhealth/db/schema/projects";
import { desc, eq } from "drizzle-orm";
import z from "zod";

import { publicProcedure } from "../middleware/auth";

const prioritySchema = z.enum(["low", "medium", "high"]);

export const projectsRouter = {
  getAll: publicProcedure.handler(async () => {
    const projectRows = await db
      .select()
      .from(projects)
      .orderBy(desc(projects.createdAt));
    const taskRows = await db
      .select()
      .from(projectTasks)
      .orderBy(desc(projectTasks.createdAt));

    const tasksByProjectId = new Map<number, (typeof taskRows)[number][]>();
    for (const task of taskRows) {
      const existingTasks = tasksByProjectId.get(task.projectId) ?? [];
      existingTasks.push(task);
      tasksByProjectId.set(task.projectId, existingTasks);
    }

    return projectRows.map((project) => ({
      ...project,
      tasks: tasksByProjectId.get(project.id) ?? [],
      harshit: true,
    }));
  }),

  createProject: publicProcedure
    .input(
      z.object({ name: z.string().min(1), description: z.string().nullable() })
    )
    .handler(async ({ input }) => {
      const [createdProject] = await db
        .insert(projects)
        .values({
          name: input.name,
          description: input.description,
        })
        .returning();

      if (!createdProject) {
        throw new Error("Failed to create project");
      }

      return createdProject;
    }),

  deleteProject: publicProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),

  createTask: publicProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(1),
        notes: z.string().nullable(),
        priority: prioritySchema,
      })
    )
    .handler(async ({ input }) => {
      const [matchingProject] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.id, input.projectId))
        .limit(1);

      if (!matchingProject) {
        throw new Error("Project not found");
      }

      const [createdTask] = await db
        .insert(projectTasks)
        .values({
          projectId: input.projectId,
          title: input.title,
          notes: input.notes,
          priority: input.priority,
        })
        .returning();

      if (!createdTask) {
        throw new Error("Failed to create task");
      }

      return createdTask;
    }),

  toggleTask: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .handler(async ({ input }) => {
      const [updatedTask] = await db
        .update(projectTasks)
        .set({ completed: input.completed })
        .where(eq(projectTasks.id, input.id))
        .returning();

      if (!updatedTask) {
        throw new Error("Task not found");
      }

      return updatedTask;
    }),

  deleteTask: publicProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      await db.delete(projectTasks).where(eq(projectTasks.id, input.id));
      return { success: true };
    }),
};
