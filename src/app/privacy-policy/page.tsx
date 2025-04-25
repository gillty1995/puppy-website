// app/privacy-policy/page.tsx
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-6 md:px-20 py-16 text-black">
      <Link
        href="/#contact"
        className="text-blue-600 hover:underline block mb-8"
      >
        &larr; Back to Contact
      </Link>

      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        Your privacy is important to us. This policy explains how we collect,
        use, and protect your personal information when you use our website.
      </p>

      <h2 className="text-2xl font-semibold mb-2">What We Collect</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Email address when you submit our contact form</li>
        <li>Any message content you choose to share</li>
        <li>
          Any comments you post on our blog (including the display name you
          enter) are publicly visible
        </li>
      </ul>

      <h2 className="text-2xl font-semibold mb-2">How We Use It</h2>
      <p className="mb-4">
        We only use your email and message to reply to your inquiry. We never
        sell or share your data with third parties.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
      <p className="mb-8">
        You can request deletion of your data at any time by submitting a
        request through our{" "}
        <Link href="/#contact" className="text-blue-600 hover:underline">
          Contact Form
        </Link>
        .
      </p>

      {/* New Disclaimer Section */}
      <h2 className="text-2xl font-semibold mb-2">Disclaimer</h2>
      <p className="mb-4">
        All content on this site is provided “as is” and for informational
        purposes only. We make no representations or warranties of any kind,
        express or implied, about the accuracy, completeness, or suitability of
        the information contained here.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Limitation of Liability</h2>
      <p className="mb-4">
        In no event shall Textile Poms, its owners, employees, or affiliates be
        liable for any indirect, incidental, special, consequential, or punitive
        damages arising out of your use of this website or reliance on any
        content herein, even if advised of the possibility of such damages.
      </p>

      <p className="text-sm text-gray-600">
        By using our website, you agree to this Privacy Policy, Disclaimer, and
        Limitation of Liability.
      </p>
    </main>
  );
}
