import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "StudyMon",
  description: "A UT Austin study tracker with focus sessions, study spots, and collectible creatures."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
