import "./globals.css";
import { ReactNode } from "react";
import { AdminProvider } from "./context/AdminContext";

export const metadata = {
  title: "Pomeranian Puppy Adoption",
  description: "Find your perfect Pomeranian puppy",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
