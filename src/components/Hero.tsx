"use client";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="hero"
      className="
        relative w-full overflow-hidden 
        h-[60vh]       /* mobile: shorter hero */
        sm:h-[75vh]    /* small tablets */
        md:h-[85vh]    /* large tablets */
        lg:h-screen    /* desktop */
      "
    >
      {/* Background image of both dogs */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/both4.jpg"
          alt="Mother and Father Pomeranian"
          fill
          priority
          className="object-cover object-top pt-50 max-md:pt-0 max-sm:object-[30%_30%] [@media(min-width:768px)_and_(max-width:768px)]:pt-0
          "
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Here you can put any overlay content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        {/* e.g. a headline + button */}
      </div>
    </section>
  );
}
