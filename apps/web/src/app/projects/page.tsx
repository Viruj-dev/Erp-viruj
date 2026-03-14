import type { Metadata } from "next";
import { ProjectsPlayground } from "@/components/projects/projects-playground";

export const metadata: Metadata = {
  title: "Projects Playground",
  description: "Standalone testing area for creating projects and tasks.",
};

export default function ProjectsPage() {
  return <ProjectsPlayground />;
}
