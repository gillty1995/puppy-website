import "./globals.css";
import { ReactNode } from "react";
import { AdminProvider } from "./context/AdminContext";
import StructuredData from "@/components/StructuredData";

export const metadata = {
  title: "Textile Poms • AKC Pomeranian Puppies in St. Louis",
  description:
    "Textile Poms offers healthy, AKC-registered Pomeranian puppies born and raised in St. Louis. Inquire today!",
  keywords: [
    "Pomeranian",
    "Pomeranians",
    "Pomeranian puppies",
    "AKC Pomeranian",
    "Pomeranian breeder",
    "St. Louis puppies",
    "Textile Poms",
  ].join(", "),
  openGraph: {
    title: "Textile Poms • AKC Pomeranian Puppies in St. Louis",
    description:
      "Healthy, AKC-registered Pomeranian puppies born and raised in St. Louis. Litter due soon!",
    url: "https://textilepoms.com",
    siteName: "Textile Poms",
    images: [
      {
        url: "https://textilepoms.com/images/both2.JPG",
        width: 1200,
        height: 630,
        alt: "Two Pomeranian dogs in grass",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
