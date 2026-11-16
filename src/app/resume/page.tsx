import type { Metadata } from "next";
import { ResumeViewer } from "@/components/ResumeViewer";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `Resume | ${site.logoName}`,
  description: `View or download the resume of ${site.logoName}, AI/ML Engineer.`,
};

export default function ResumePage() {
  return <ResumeViewer />;
}
