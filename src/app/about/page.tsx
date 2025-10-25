"use client";

import { CMSAboutSection } from "@/components/cms/AboutSection";
import { useAboutContent } from "@/hooks/useCMS";

export default function AboutPage() {
  const { content, loading, error } = useAboutContent();

  return (
    <CMSAboutSection
      hero={content?.hero}
      challenges={content?.challenges}
      solutions={content?.solutions}
      vision={content?.vision}
      mentor={content?.mentor}
      team={[
        { name: "Kevin A. Llanes", role: "Project Manager" },
        { name: "Irheil Mae S. Antang", role: "Software Engineer" },
        { name: "Ma. Catherine H. Bae", role: "Front-end Developer" },
        { name: "Jin Harold A. Failana", role: "Hardware Programmer" },
        { name: "Jhon Keneth Ryan B. Namias", role: "Back-end Developer" },
        { name: "Emannuel L. Pabua", role: "Database Administrator" },
        { name: "Ronan Renz T. Valencia", role: "Full Stack Developer" },
      ]}
      loading={loading}
      error={error}
    />
  );
}
