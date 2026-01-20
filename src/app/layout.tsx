import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Urban Auto | Premium Car Care in Raipur",
  description: "Raipur's premier modern mechanized car care brand. Professional car cleaning, detailing, and auto services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="2a6574d1-1153-47ba-85d3-78eab2c8f780"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "UrbanAuto", "version": "1.0.0"}'
        />
        <AuthProvider>
          {children}
          <BottomNav />
          <Toaster position="top-center" richColors closeButton />
        </AuthProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
