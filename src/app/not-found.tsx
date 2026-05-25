"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex flex-col items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <div className="text-8xl font-bold bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-6">
            404
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            The page you are looking for does not exist or has been moved. Check
            the URL or return to the homepage.
          </p>
          <Link href="/">
            <Button variant="primary" size="lg">
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
