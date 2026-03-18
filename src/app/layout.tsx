import "./globals.css";
import { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import StructuredData from "@/components/StructuredData";

export const metadata = {
  title: "Textile Poms • Purebred Pomeranian Puppies in St. Louis",
  description:
    "Textile Poms offers healthy, purebred Pomeranian puppies born and raised in St. Louis. Inquire today!",
  keywords: [
    "Pomeranian",
    "Pomeranians",
    "Pomeranian puppies",
    "Purebred Pomeranian",
    "Pomeranian breeder",
    "St. Louis puppies",
    "Textile Poms",
    "St. Louis",
  ].join(", "),
  openGraph: {
    title: "Textile Poms • Purebred Pomeranian Puppies in St. Louis",
    description:
      "Healthy, purebred Pomeranian puppies born and raised in St. Louis. Litter due soon!",
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
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
