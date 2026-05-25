"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="flex flex-col items-center justify-center px-4 py-24">
        <div className="text-center max-w-md">
          <div className="text-8xl font-bold bg-linear-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-6">
            500
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Something Went Wrong
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            An unexpected error occurred. We have logged the issue and our team
            will investigate. Please try again or return to the homepage.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" size="lg" onClick={reset}>
              Try Again
            </Button>
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
          {error.digest && (
            <p className="mt-6 text-xs text-gray-600 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
