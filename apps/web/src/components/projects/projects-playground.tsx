"use client";

import { orpc } from "@/lib/orpc";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useMemo, useState } from "react";

type TaskPriority = "low" | "medium" | "high";

type BackendTask = {
  id: number;
  projectId: number;
  title: string;
  notes: string | null;
  priority: string;
  completed: boolean;
  createdAt: Date;
};

type BackendProject = {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  tasks: BackendTask[];
};

const priorityClass: Record<TaskPriority, string> = {
  low: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10",
  medium: "text-amber-200 border-amber-400/40 bg-amber-500/10",
  high: "text-rose-200 border-rose-400/40 bg-rose-500/10",
};

const toPriority = (priority: string): TaskPriority => {
  if (priority === "low" || priority === "high") {
    return priority;
  }

  return "medium";
};

export const ProjectsPlayground = () => {
  // this is just a dummy file the is not related to the code and just use as a refernce file
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNotes, setTaskNotes] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("medium");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: projects = [],
    isLoading,
    isFetching,
    error,
  } = useQuery(orpc.projects.getAll.queryOptions());

  const createProjectMutation = useMutation(
    orpc.projects.createProject.mutationOptions({
      onSuccess: async (createdProject) => {
        await queryClient.invalidateQueries({
          queryKey: orpc.projects.getAll.key(),
        });
        setSelectedProjectId(createdProject.id);
        setProjectName("");
        setProjectDescription("");
      },
    })
  );

  const deleteProjectMutation = useMutation(
    orpc.projects.deleteProject.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.projects.getAll.key(),
        });
      },
    })
  );

  const createTaskMutation = useMutation(
    orpc.projects.createTask.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.projects.getAll.key(),
        });
        setTaskTitle("");
        setTaskNotes("");
        setTaskPriority("medium");
      },
    })
  );

  const toggleTaskMutation = useMutation(
    orpc.projects.toggleTask.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.projects.getAll.key(),
        });
      },
    })
  );

  const deleteTaskMutation = useMutation(
    orpc.projects.deleteTask.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: orpc.projects.getAll.key(),
        });
      },
    })
  );

  useEffect(() => {
    if (!error) {
      return;
    }

    if (error instanceof Error) {
      setErrorMessage(error.message);
      return;
    }

    setErrorMessage("Failed to load projects");
  }, [error]);

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId(null);
      return;
    }

    if (
      selectedProjectId !== null &&
      projects.some((project) => project.id === selectedProjectId)
    ) {
      return;
    }

    setSelectedProjectId(projects[0]?.id ?? null);
  }, [projects, selectedProjectId]);

  const isSaving =
    createProjectMutation.isPending ||
    deleteProjectMutation.isPending ||
    createTaskMutation.isPending ||
    toggleTaskMutation.isPending ||
    deleteTaskMutation.isPending;

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) {
      return null;
    }

    return projects.find((project) => project.id === selectedProjectId) ?? null;
  }, [projects, selectedProjectId]);

  const completedTaskCount = useMemo(() => {
    let totalCompletedTasks = 0;
    for (const project of projects) {
      for (const task of project.tasks) {
        if (task.completed) {
          totalCompletedTasks += 1;
        }
      }
    }
    return totalCompletedTasks;
  }, [projects]);

  const totalTaskCount = useMemo(() => {
    let totalTasks = 0;
    for (const project of projects) {
      totalTasks += project.tasks.length;
    }
    return totalTasks;
  }, [projects]);

  const addProject = async () => {
    const trimmedName = projectName.trim();
    const trimmedDescription = projectDescription.trim();

    if (!trimmedName) {
      return;
    }

    setErrorMessage(null);
    try {
      await createProjectMutation.mutateAsync({
        name: trimmedName,
        description: trimmedDescription.length > 0 ? trimmedDescription : null,
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to create project";
      setErrorMessage(message);
    }
  };

  const deleteProject = async (projectId: number) => {
    setErrorMessage(null);
    try {
      await deleteProjectMutation.mutateAsync({ id: projectId });
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete project";
      setErrorMessage(message);
    }
  };

  const addTask = async () => {
    const trimmedTitle = taskTitle.trim();
    const trimmedNotes = taskNotes.trim();

    if (!selectedProjectId || !trimmedTitle) {
      return;
    }

    setErrorMessage(null);
    try {
      await createTaskMutation.mutateAsync({
        projectId: selectedProjectId,
        title: trimmedTitle,
        notes: trimmedNotes.length > 0 ? trimmedNotes : null,
        priority: taskPriority,
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to create task";
      setErrorMessage(message);
    }
  };

  const toggleTaskStatus = async (taskId: number, completed: boolean) => {
    setErrorMessage(null);
    try {
      await toggleTaskMutation.mutateAsync({
        id: taskId,
        completed: !completed,
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to update task";
      setErrorMessage(message);
    }
  };

  const deleteTask = async (taskId: number) => {
    setErrorMessage(null);
    try {
      await deleteTaskMutation.mutateAsync({ id: taskId });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to delete task";
      setErrorMessage(message);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#172554,_#020617_70%)] px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="rounded-2xl border border-slate-400/20 bg-slate-900/70 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              Projects Lab
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Standalone test area. Create any projects and tasks here.
            </p>

            {errorMessage ? (
              <p className="mt-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-6 space-y-3">
              <input
                className="w-full rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/80"
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Project name"
                value={projectName}
              />
              <textarea
                className="h-20 w-full resize-none rounded-lg border border-slate-600/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/80"
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder="Short description (optional)"
                value={projectDescription}
              />
              <button
                className="w-full rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving || projectName.trim().length === 0}
                onClick={() => void addProject()}
                type="button"
              >
                {isSaving ? "Saving..." : "Create project"}
              </button>
            </div>

            <div className="mt-7 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Projects
              </h2>
              {isLoading || isFetching ? (
                <p className="rounded-lg border border-dashed border-slate-600/60 p-4 text-sm text-slate-400">
                  Loading projects...
                </p>
              ) : projects.length === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-600/60 p-4 text-sm text-slate-400">
                  No projects yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {projects.map((project) => {
                    const isActive = project.id === selectedProjectId;
                    return (
                      <li key={project.id}>
                        <div
                          className={`rounded-xl border p-3 transition ${
                            isActive
                              ? "border-cyan-400/70 bg-cyan-500/10"
                              : "border-slate-700/70 bg-slate-800/70 hover:border-slate-500/90"
                          }`}
                        >
                          <button
                            className="w-full text-left"
                            onClick={() => setSelectedProjectId(project.id)}
                            type="button"
                          >
                            <p className="text-sm font-medium text-slate-100">
                              {project.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {project.tasks.length} task
                              {project.tasks.length === 1 ? "" : "s"}
                            </p>
                          </button>
                          <button
                            className="mt-2 text-xs text-rose-300 transition hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isSaving}
                            onClick={() => void deleteProject(project.id)}
                            type="button"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-slate-400/20 bg-slate-900/70 p-5 shadow-[0_20px_70px_rgba(2,6,23,0.55)] backdrop-blur-xl">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Total projects
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-50">
                  {projects.length}
                </p>
              </div>
              <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Total tasks
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-50">
                  {totalTaskCount}
                </p>
              </div>
              <div className="rounded-xl border border-slate-700/80 bg-slate-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                  Completed tasks
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-50">
                  {completedTaskCount}
                </p>
              </div>
            </div>

            {!selectedProject ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-600/60 p-6 text-sm text-slate-300">
                {isLoading || isFetching
                  ? "Loading data from backend..."
                  : "Pick a project to start adding tasks."}
              </div>
            ) : (
              <div className="mt-6">
                <div className="rounded-xl border border-slate-700/70 bg-slate-950/55 p-4">
                  <h2 className="text-xl font-semibold text-slate-50">
                    {selectedProject.name}
                  </h2>
                  {selectedProject.description ? (
                    <p className="mt-1 text-sm text-slate-300">
                      {selectedProject.description}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 rounded-xl border border-slate-700/70 bg-slate-950/55 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">
                    Add task
                  </h3>
                  <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px]">
                    <input
                      className="w-full rounded-lg border border-slate-600/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/80"
                      onChange={(event) => setTaskTitle(event.target.value)}
                      placeholder="Task title"
                      value={taskTitle}
                    />
                    <select
                      className="w-full rounded-lg border border-slate-600/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/80"
                      onChange={(event) =>
                        setTaskPriority(event.target.value as TaskPriority)
                      }
                      value={taskPriority}
                    >
                      <option value="low">Low priority</option>
                      <option value="medium">Medium priority</option>
                      <option value="high">High priority</option>
                    </select>
                  </div>
                  <textarea
                    className="mt-3 h-20 w-full resize-none rounded-lg border border-slate-600/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400/80"
                    onChange={(event) => setTaskNotes(event.target.value)}
                    placeholder="Task notes (optional)"
                    value={taskNotes}
                  />
                  <button
                    className="mt-3 rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isSaving || taskTitle.trim().length === 0}
                    onClick={() => void addTask()}
                    type="button"
                  >
                    {isSaving ? "Saving..." : "Add task"}
                  </button>
                </div>

                <div className="mt-5 space-y-3">
                  {selectedProject.tasks.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-600/60 p-4 text-sm text-slate-400">
                      No tasks yet for this project.
                    </p>
                  ) : (
                    selectedProject.tasks.map((task) => {
                      const isDone = task.completed;
                      const priority = toPriority(task.priority);

                      return (
                        <article
                          className="rounded-xl border border-slate-700/70 bg-slate-950/60 p-4"
                          key={task.id}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${priorityClass[priority]}`}
                            >
                              {priority}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4
                            className={`mt-2 text-base font-semibold ${
                              isDone
                                ? "text-slate-400 line-through"
                                : "text-slate-100"
                            }`}
                          >
                            {task.title}
                          </h4>
                          {task.notes ? (
                            <p className="mt-1 text-sm text-slate-300">
                              {task.notes}
                            </p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                                isDone
                                  ? "bg-slate-700 text-slate-100 hover:bg-slate-600"
                                  : "bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                              }`}
                              onClick={() =>
                                void toggleTaskStatus(task.id, task.completed)
                              }
                              type="button"
                            >
                              {isDone ? "Mark as todo" : "Mark as done"}
                            </button>
                            <button
                              className="rounded-md bg-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-200 transition hover:bg-rose-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={isSaving}
                              onClick={() => void deleteTask(task.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      ) : null}
    </>
  );
};
