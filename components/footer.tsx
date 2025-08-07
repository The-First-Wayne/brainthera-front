import Link from "next/link";
import { Wrench } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6">
      <div className="w-full flex justify-center items-center">
        <p className="text-sm text-muted-foreground text-center">
          © 2025 Brainthera All rights reserved.
        </p>
      </div>
    </footer>
  );
}
