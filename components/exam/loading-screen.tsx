"use client";

export default function LoadingScreen({
  message,
}: {
  message: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm">
      <div className="rounded-2xl border bg-card px-10 py-8 shadow-xl flex flex-col items-center gap-5">
        <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />

        <p className="text-sm text-muted-foreground font-medium">
          {message}
        </p>
      </div>
    </div>
  );
}