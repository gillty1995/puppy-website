// app/care/page.tsx
import CareDetails from "../../components/CareDetails";

export default function CarePage() {
  return (
    <main className="min-h-screen bg-white px-6 md:px-20 py-16">
      <h1 className="text-5xl font-bold text-gray-900 mb-8 boldonse max-md:text-3xl">
        Puppy Care & Expectations
      </h1>
      <CareDetails />
    </main>
  );
}
