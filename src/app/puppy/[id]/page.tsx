// app/puppy/[id]/page.tsx

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { puppies, Puppy } from "@/utils/PuppyData";

export default async function PuppyPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const puppy: Puppy | undefined = puppies.find((p) => p.id === params.id);
  if (!puppy) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white px-6 md:px-20 py-16">
      <Link href="/#puppies" className="text-blue-600 hover:underline">
        &larr; Back to Puppies
      </Link>

      <div className="mt-8 flex flex-col lg:flex-row items-start gap-12">
        <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={puppy.image}
            alt={puppy.name}
            width={800}
            height={800}
            className="object-cover w-full h-full"
            priority
          />
        </div>

        <div className="w-full lg:w-1/2">
          <h1 className="text-5xl font-extrabold text-gray-900">
            {puppy.name}
          </h1>
          <p className="mt-4 text-2xl text-gray-700">
            ${puppy.price.toLocaleString()} USD
          </p>
          <div className="mt-6 space-y-2 text-lg text-gray-800">
            <p>
              <strong>Date of Birth:</strong> {puppy.age}
            </p>
            <p>
              <strong>Color:</strong> {puppy.color}
            </p>
            <p>
              <strong>Description:</strong> {puppy.description}
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap gap-4 max-w-[600px] max-sm:justify-center">
            <Link
              href="/care"
              className="px-6 py-3 w-52 h-12 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition text-xl flex items-center justify-center"
            >
              Care
            </Link>
            <Link
              href="/#contact"
              className="px-6 py-3 w-52 h-12 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition text-xl flex items-center justify-center"
            >
              Adopt
            </Link>
            <Link
              href="/blog"
              className="px-6 py-3 w-52 h-12 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition text-xl flex items-center justify-center"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className="px-6 py-3 w-52 h-12 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition text-xl flex items-center justify-center"
            >
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
