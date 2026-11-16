import type { Metadata } from "next";
import { JourneyView } from "@/components/JourneyView";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `My Journey | ${site.logoName}`,
  description: `How ${site.logoName} went from learning algorithms to building intelligent systems.`,
};

export default function JourneyPage() {
  return <JourneyView />;
}
