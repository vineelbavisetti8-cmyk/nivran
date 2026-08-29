import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SplashScreen } from "@/components/SplashScreen";

export const viewport: Viewport = {
  themeColor: "#0d5f48",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Nivaran | Every complaint gets an answer — automatically.",
  description:
    "Autonomous civic grievance redressal with scheduled SLA watchdog auto-escalations and mandatory citizen confirmation gates.",
  keywords: [
    "Nivaran",
    "Civic Redressal",
    "Grievance Portal",
    "OpenAI Hackathon",
    "Autonomous Escalation",
    "Andhra Pradesh",
    "Citizen Verification Gate"
  ],
  authors: [{ name: "Nivaran Team" }],
  openGraph: {
    title: "Nivaran — Every complaint gets an answer, automatically.",
    description: "Autonomous citizen grievance redressal with scheduled SLA auto-escalation.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
