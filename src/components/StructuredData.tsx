export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Textile Poms",
    image: "https://textilepoms.com/images/both2.JPG",
    url: "https://textilepoms.com",
    openingHours: "Mo,Tu,We,Th,Fr 09:00-17:00",
    priceRange: "$$$",
    description:
      "Licensed AKC Pomeranian breeder in St. Louis. Puppies available soon!",
    address: {
      "@type": "PostalAddress",
      addressLocality: "St. Louis",
      addressRegion: "MO",
      addressCountry: "US",
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
