import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 md:px-20">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2.5rem] bg-zinc-900 px-8 py-10 text-white shadow-lg md:px-10">
          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
            Textile Poms Admin
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight">
            Secure access for pricing, reservations, and client payments.
          </h1>
          <p className="mt-5 text-lg text-zinc-200">
            This portal is reserved for approved Textile Poms admins. After
            signing in, you can manage puppy pricing, reservation status, and
            the final Stripe invoice flow from one place.
          </p>
        </section>

        <section className="rounded-[2.5rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <SignIn
            path="/sign-in"
            routing="path"
            forceRedirectUrl="/admin/puppies"
            appearance={{
              variables: {
                colorPrimary: "#059669",
                colorBackground: "#ffffff",
                colorInputBackground: "#fafaf9",
                colorInputText: "#111827",
                colorText: "#111827",
                colorTextSecondary: "#4b5563",
                borderRadius: "1rem",
              },
              elements: {
                card: "shadow-none border-0 p-0",
                rootBox: "w-full",
                footer: "hidden",
                socialButtonsBlockButton:
                  "rounded-2xl border border-stone-200 shadow-none",
                formButtonPrimary:
                  "rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-none",
                formFieldInput:
                  "rounded-2xl border border-stone-200 focus:border-emerald-500 focus:ring-emerald-500",
              },
            }}
          />
        </section>
      </div>
    </main>
  );
}
