import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
