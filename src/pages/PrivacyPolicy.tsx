import React from "react";
import PolicyPage from "./PolicyPage";

const PrivacyPolicy = () => {
  return (
    <PolicyPage title="Privacy Policy">
      <section className="space-y-8">
        
        {/* Intro Section - Drop Cap 'A' yahan apne aap apply hoga */}
        <div>
          <p className="text-lg italic font-medium text-[#222222] mb-6">
            At MURO POSTER, trust is part of the experience.
          </p>
          <p>
            We respect your privacy and are committed to protecting the information you share with us. This Privacy Policy explains what information we collect, how we use it, and the safeguards we apply.
          </p>
          <p className="mt-4">
            This policy applies to MURO POSTER, operated by Saar Graphics, located in India.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Information We Collect</h2>
          <p>
            When you interact with our website or place an order, we may collect information necessary to provide our services, including:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#222222]/80 marker:text-[#222222]">
            <li>Name, email address, shipping and billing address</li>
            <li>Contact number when required for delivery</li>
            <li>Basic website usage data through cookies or analytics tools</li>
          </ul>
          <p>
            We collect only information relevant to fulfilling your request and improving your experience.
          </p>
        </div>

        {/* How We Use Your Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">How We Use Your Information</h2>
          <p>Your information may be used to:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#222222]/80 marker:text-[#222222]">
            <li>Process and deliver orders</li>
            <li>Provide confirmations, shipping updates, and support communication</li>
            <li>Improve website functionality and customer experience</li>
            <li>Send promotional updates when you choose to subscribe</li>
          </ul>
          <p>
            We process information to fulfill contractual obligations, operate our services, and communicate with your consent.
          </p>
        </div>

        {/* Third-Party Services */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Third-Party Services</h2>
          <p>
            To operate effectively, we may share necessary information with trusted service providers such as payment processors, delivery partners, or hosting services. These providers are required to handle information securely and only for authorized purposes.
          </p>
        </div>

        {/* Payment Security */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Payment Security</h2>
          <p>
            We do not store payment card details. Transactions are processed through certified third-party payment providers.
          </p>
        </div>

        {/* Cookies and Tracking */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Cookies and Tracking</h2>
          <p>
            Our website may use cookies or similar technologies to improve performance and usability. You can manage cookie preferences through your browser settings.
          </p>
        </div>

        {/* Data Retention */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Data Retention</h2>
          <p>
            We retain personal information only as long as necessary to fulfill orders, meet legal obligations, or support customer service.
          </p>
        </div>

        {/* Data Protection */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Data Protection</h2>
          <p>
            We implement reasonable technical and organizational safeguards to protect personal information. While no system is completely immune to risk, we continuously work to maintain appropriate protections.
          </p>
        </div>

        {/* Your Rights */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Your Rights</h2>
          <p>
            Depending on your location, you may have the right to request access, correction, or deletion of your personal information, subject to legal requirements.
          </p>
          <p>
            Requests may be directed to: <br />
            <a href="mailto:helpmuroposter@gmail.com" className="font-bold underline hover:text-[#2F4F4F]">
              helpmuroposter@gmail.com
            </a>
          </p>
        </div>

        {/* Policy Updates */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Policy Updates</h2>
          <p>
            We may update this Privacy Policy periodically. Continued use of our website indicates acceptance of the revised terms.
          </p>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 pt-8 border-t border-[#222222]/10 italic opacity-60">
          <p>Your privacy matters. Your information is handled with intention and care.</p>
        </div>

      </section>
    </PolicyPage>
  );
};

export default PrivacyPolicy;