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
          className="
            object-cover
            object-center         /* mobile: center both axes */
            sm:object-[50%_%-20%] /* small tablets: shift up a bit */
            md:object-[50%_%-80%] /* large tablets: more upward crop */
            lg:object-[50%_-120%] /* desktop: original focus */
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
