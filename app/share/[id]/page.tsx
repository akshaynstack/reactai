import { notFound } from "next/navigation";
import CodeViewer from "@/components/code-viewer";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: "Shared App - ReactAI Components",
    description: "A React component generated with ReactAI",
  };
}

export default async function Page({ params }: { params: { id: string } }) {
  if (typeof params.id !== "string") {
    notFound();
  }

  // Note: Database persistence has been removed.
  // Shared apps are no longer stored in a database.
  // This page will show a message explaining how to share code.

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Share Feature Unavailable</h1>
      <p className="text-muted-foreground mb-4">
        Database persistence has been removed from this version of ReactAI.
      </p>
      <p className="text-muted-foreground">
        To share your generated components, please copy the code directly from the editor.
      </p>
      <a
        href="/"
        className="mt-6 px-4 py-2 bg-[#9AE65C] text-black rounded hover:bg-[#8ad34f]"
      >
        Generate New Component
      </a>
    </div>
  );
}
