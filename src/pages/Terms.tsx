import React from "react";
import PolicyPage from "./PolicyPage";

const Terms = () => {
  return (
    <PolicyPage title="Terms & Conditions">
      <section className="space-y-8">
        
        {/* Intro - Drop Cap 'W' automatically handled by PolicyPage */}
        <div>
          <p className="text-lg italic font-medium text-[#222222] mb-6">
            Welcome to MURO POSTER. By accessing or purchasing from muroposter.com, you agree to these Terms & Conditions. Please read them carefully before placing an order.
          </p>
        </div>

        {/* Business Identity */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Business Identity</h2>
          <p>
            These Terms apply to MURO POSTER, operated by Saar Graphics, located in Ambala (Haryana) India. Any disputes are governed by the laws of this jurisdiction.
          </p>
        </div>

        {/* 1. Products */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">1. Products</h2>
          <p>
            MURO POSTER offers physical wall art and related products. Descriptions, images, dimensions, and specifications are presented as accurately as possible. Minor variations in color or finish may occur due to printing processes and display differences.
          </p>
          <p>
            We reserve the right to modify, discontinue, or introduce products at any time without prior notice.
          </p>
        </div>

        {/* 2. Orders & Payments */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">2. Orders & Payments</h2>
          <p>
            Prices are listed in the currency shown at checkout. Payments are processed through secure third-party gateways.
          </p>
          <p>By placing an order, you confirm that:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#222222]/80 marker:text-[#222222]">
            <li>Provided information is accurate</li>
            <li>You are authorized to use the payment method</li>
            <li>You agree to the full checkout amount</li>
          </ul>
          <p>
            We reserve the right to cancel or refuse orders due to pricing errors, availability issues, suspected fraud, or other operational reasons.
          </p>
        </div>

        {/* 3. Shipping & Delivery */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">3. Shipping & Delivery</h2>
          <p>
            Orders are processed according to our Shipping Policy. Delivery timelines depend on carriers and location. MURO POSTER is not responsible for delays caused by shipping providers, customs, or unforeseen events. Customers are responsible for providing accurate shipping information. Risk of loss transfers upon confirmed delivery.
          </p>
        </div>

        {/* 4. Returns, Refunds & Cancellations */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">4. Returns, Refunds & Cancellations</h2>
          <p>
            All returns, replacements, and refunds are governed exclusively by our Cancellation & Refund Policy.
          </p>
        </div>

        {/* 5. Intellectual Property */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">5. Intellectual Property</h2>
          <p>
            All website content — including artwork, branding, text, and graphics — is the property of MURO POSTER and protected by intellectual property laws. Unauthorized reproduction, distribution, or commercial use is prohibited.
          </p>
          <div className="bg-[#222222]/5 p-6 border-l-2 border-[#222222]">
            <p className="font-bold mb-2">You may not:</p>
            <ul className="list-disc pl-5 space-y-1 text-[#222222]/80 marker:text-[#222222]">
              <li>Reproduce or distribute our designs</li>
              <li>Use our content for commercial purposes without written permission</li>
              <li>Copy, modify, or replicate our branding or artwork</li>
            </ul>
          </div>
          <p>Unauthorized use may result in legal action.</p>
        </div>

        {/* 6. Limitation of Liability */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">6. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, MURO POSTER is not liable for indirect, incidental, or consequential damages arising from website or product use.
          </p>
          <p>
            Our products are intended as visual tools for personal environment enhancement and are not substitutes for professional or medical services.
          </p>
        </div>

        {/* 7. Warranty Disclaimer */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">7. Warranty Disclaimer</h2>
          <p>
            Except where required by law, products are provided without additional warranties, express or implied.
          </p>
        </div>

        {/* 8. Website Use */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">8. Website Use</h2>
          <p>
            Users agree not to engage in fraudulent behavior, interfere with website functionality, extract data through automated means, or violate applicable laws.
          </p>
        </div>

        {/* 9. Force Majeure */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">9. Force Majeure</h2>
          <p>
            MURO POSTER is not liable for delays or failure to perform due to events beyond reasonable control, including natural disasters, technical failures, or supply disruptions.
          </p>
        </div>

        {/* 10. Dispute Resolution */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">10. Dispute Resolution</h2>
          <p>
            We encourage resolution through direct communication. Any legal disputes shall be handled under the governing jurisdiction stated above.
          </p>
        </div>

        {/* 11. Changes to Terms */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">11. Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued website use indicates acceptance of revised Terms.
          </p>
        </div>

        {/* 12. Contact */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">12. Contact</h2>
          <p>
            Questions regarding these Terms may be directed to: <br />
            <a href="mailto:helpmuroposter@gmail.com" className="font-bold underline hover:text-[#2F4F4F]">
              helpmuroposter@gmail.com
            </a>
          </p>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 pt-8 border-t border-[#222222]/10 italic opacity-60">
          <p>We aim to address concerns fairly and responsibly should any issue arise.</p>
        </div>

      </section>
    </PolicyPage>
  );
};

export default Terms;