// components/StructuredData.tsx
import Head from "next/head";

export default function StructuredData() {
  const {
    NEXT_PUBLIC_ADDRESS,
    NEXT_PUBLIC_CITY,
    NEXT_PUBLIC_STATE,
    NEXT_PUBLIC_POSTAL,
    NEXT_PUBLIC_PHONE,
    NEXT_PUBLIC_LAT,
    NEXT_PUBLIC_LNG,
  } = process.env;

  const data = {
    "@context": "https://schema.org",
    "@type": "PetStore",
    name: "Textile Poms",
    image: "https://textilepoms.com/images/both2.JPG",
    url: "https://textilepoms.com",
    telephone: NEXT_PUBLIC_PHONE,
    priceRange: "$$$",
    description:
      "Licensed AKC Pomeranian breeder in St. Louis. Puppies available soon!",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "17:00",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: NEXT_PUBLIC_ADDRESS,
      addressLocality: NEXT_PUBLIC_CITY,
      addressRegion: NEXT_PUBLIC_STATE,
      postalCode: NEXT_PUBLIC_POSTAL,
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: parseFloat(NEXT_PUBLIC_LAT!),
      longitude: parseFloat(NEXT_PUBLIC_LNG!),
    },
  };

  return (
    <Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    </Head>
  );
}
