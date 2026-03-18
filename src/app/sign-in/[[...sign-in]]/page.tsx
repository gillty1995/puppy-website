import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fafaf9_0%,#f4efe8_100%)] px-4 py-8 sm:px-6 sm:py-12 md:px-12 lg:px-20 lg:py-16">
      <div className="mx-auto grid max-w-5xl gap-5 sm:gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8">
        <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,#1f2937_0%,#111827_55%,#09090b_100%)] px-5 py-6 text-white shadow-lg sm:rounded-[2.5rem] sm:px-8 sm:py-8 md:px-10 md:py-10">
          <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-300 sm:text-sm sm:tracking-[0.35em]">
            Textile Poms Admin
          </p>
          <h1 className="mt-4 max-w-lg text-3xl font-extrabold leading-tight sm:mt-5 sm:text-4xl">
            Secure access for pricing, reservations, and client payments.
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-200 sm:mt-5 sm:text-lg">
            This portal is reserved for approved Textile Poms admins. After
            signing in, you can manage puppy pricing, reservation status, and
            the final Stripe invoice flow from one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.22em] text-zinc-100 sm:px-4">
              Pricing Control
            </span>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.22em] text-zinc-100 sm:px-4">
              Reservation Status
            </span>
            <span className="rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.22em] text-zinc-100 sm:px-4">
              Stripe Invoices
            </span>
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-200/80 bg-white/95 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:rounded-[2.5rem] sm:p-6 md:p-8">
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
                card: "shadow-none border-0 p-0 bg-transparent",
                rootBox: "w-full",
                headerTitle: "text-2xl sm:text-3xl font-bold text-gray-900",
                headerSubtitle: "text-sm sm:text-base text-gray-600",
                footer: "hidden",
                form: "gap-5",
                socialButtonsBlockButton:
                  "min-h-12 rounded-2xl border border-stone-200 shadow-none",
                formButtonPrimary:
                  "min-h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-none",
                formFieldInput:
                  "min-h-12 rounded-2xl border border-stone-200 bg-stone-50 focus:border-emerald-500 focus:ring-emerald-500",
                formFieldLabel: "text-sm font-medium text-gray-700",
                formFieldAction: "text-sm text-emerald-700 hover:text-emerald-600",
                dividerText: "text-xs uppercase tracking-[0.25em] text-stone-400",
                identityPreviewText: "text-sm text-gray-700",
              },
            }}
          />
        </section>
      </div>
    </main>
  );
}
