import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
