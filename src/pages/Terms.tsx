import React from "react";
import PolicyPage from "./PolicyPage";

const headingClass =
  "pt-4 text-[21px] font-bold leading-none tracking-[-0.03em] text-[#111111] md:text-[26px]";

const Terms: React.FC = () => {
  return (
    <PolicyPage title="Terms & Conditions">
      <section className="space-y-8">
        <div className="rounded-[22px] bg-[#F2F2F2] p-6 md:p-8">
          <p className="text-[18px] font-normal italic leading-snug tracking-[-0.03em] text-[#111111] md:text-[22px]">
            Welcome to MURO POSTER. By accessing or purchasing from muroposter.com, you agree to these Terms & Conditions. Please read them carefully before placing an order.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Business Identity</h2>
          <p>
            These Terms apply to MURO POSTER, operated by Saar Graphics, located in Ambala (Haryana) India. Any disputes are governed by the laws of this jurisdiction.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Products</h2>
          <p>
            MURO POSTER offers physical wall art and related products. Descriptions, images, dimensions, and specifications are presented as accurately as possible. Minor variations in color or finish may occur due to printing processes and display differences.
          </p>
          <p>
            We reserve the right to modify, discontinue, or introduce products at any time without prior notice.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Orders & Payments</h2>
          <p>
            Prices are listed in the currency shown at checkout. Payments are processed through secure third-party gateways.
          </p>
          <p>By placing an order, you confirm that:</p>
          <ul className="list-disc space-y-2 pl-5 text-[#555555] marker:text-[#111111]">
            <li>Provided information is accurate</li>
            <li>You are authorized to use the payment method</li>
            <li>You agree to the full checkout amount</li>
          </ul>
          <p>
            We reserve the right to cancel or refuse orders due to pricing errors, availability issues, suspected fraud, or other operational reasons.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Shipping & Delivery</h2>
          <p>
            Orders are processed according to our Shipping Policy. Delivery timelines depend on carriers and location. MURO POSTER is not responsible for delays caused by shipping providers, customs, or unforeseen events. Customers are responsible for providing accurate shipping information. Risk of loss transfers upon confirmed delivery.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Returns, Refunds & Cancellations</h2>
          <p>
            All returns, replacements, and refunds are governed exclusively by our Cancellation & Refund Policy.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Intellectual Property</h2>
          <p>
            All website content — including artwork, branding, text, and graphics — is the property of MURO POSTER and protected by intellectual property laws. Unauthorized reproduction, distribution, or commercial use is prohibited.
          </p>

          <div className="rounded-[18px] border-l-4 border-[#ECFF66] bg-[#F2F2F2] p-6">
            <p className="mb-2 font-bold text-[#111111]">You may not:</p>
            <ul className="list-disc space-y-1 pl-5 text-[#555555] marker:text-[#111111]">
              <li>Reproduce or distribute our designs</li>
              <li>Use our content for commercial purposes without written permission</li>
              <li>Copy, modify, or replicate our branding or artwork</li>
            </ul>
          </div>

          <p>Unauthorized use may result in legal action.</p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, MURO POSTER is not liable for indirect, incidental, or consequential damages arising from website or product use.
          </p>
          <p>
            Our products are intended as visual tools for personal environment enhancement and are not substitutes for professional or medical services.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Warranty Disclaimer</h2>
          <p>
            Except where required by law, products are provided without additional warranties, express or implied.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Website Use</h2>
          <p>
            Users agree not to engage in fraudulent behavior, interfere with website functionality, extract data through automated means, or violate applicable laws.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Force Majeure</h2>
          <p>
            MURO POSTER is not liable for delays or failure to perform due to events beyond reasonable control, including natural disasters, technical failures, or supply disruptions.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Dispute Resolution</h2>
          <p>
            We encourage resolution through direct communication. Any legal disputes shall be handled under the governing jurisdiction stated above.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Changes to Terms</h2>
          <p>
            We may update these Terms at any time. Continued website use indicates acceptance of revised Terms.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Contact</h2>
          <p>
            Questions regarding these Terms may be directed to:{" "}
            <a href="mailto:helpmuroposter@gmail.com" className="font-bold underline underline-offset-4 hover:text-[#006039]">
              helpmuroposter@gmail.com
            </a>
          </p>
        </div>

        <div className="mt-12 rounded-[22px] bg-[#ECFF66] p-6 font-bold text-[#111111] md:p-8">
          <p>We aim to address concerns fairly and responsibly should any issue arise.</p>
        </div>
      </section>
    </PolicyPage>
  );
};

export default Terms;
