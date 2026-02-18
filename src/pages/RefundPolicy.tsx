import React from "react";
import PolicyPage from "./PolicyPage";

const RefundPolicy = () => {
  return (
    <PolicyPage title="Cancellation & Refund Policy">
      <section className="space-y-8">
        
        {/* Intro - Drop Cap 'W' automatically handled by PolicyPage */}
        <div>
          <p className="text-lg italic font-medium text-[#222222] mb-6">
            We stand behind the quality of every MURO product. If something is not right, we address it with clarity and fairness.
          </p>
        </div>

        {/* Order Cancellation */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Order Cancellation</h2>
          <p>
            Orders may be cancelled within 24 hours of purchase, provided production or shipping has not begun. Once an order enters printing, packaging, or dispatch, cancellation is no longer possible.
          </p>
        </div>

        {/* Returns & Replacements */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Returns & Replacements</h2>
          <p>
            Requests for return or replacement must be submitted within 7 days of delivery and are reviewed on a case-by-case basis under the following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#222222]/80 marker:text-[#222222]">
            <li>Product arrived damaged</li>
            <li>Incorrect item received</li>
            <li>Confirmed non-delivery</li>
          </ul>
          <p>
            To support your request, clear photos or relevant documentation may be required. Items must remain unused and in original condition.
          </p>
        </div>

        {/* Non-Refundable Cases */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Non-Refundable Cases</h2>
          <p>Returns or refunds are not accepted for:</p>
          <ul className="list-disc pl-5 space-y-2 text-[#222222]/80 marker:text-[#222222]">
            <li>Change of mind</li>
            <li>Incorrect selection made by the customer</li>
            <li>Minor color variations due to screen or lighting differences</li>
          </ul>
        </div>

        {/* Delivery Responsibility */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Delivery Responsibility</h2>
          <p>
            Customers are responsible for providing accurate shipping details. Delivery delays caused by courier services, incorrect addresses, or failed delivery attempts may not qualify for refund.
          </p>
        </div>

        {/* Refund Process */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Refund Process</h2>
          <p>
            Approved refunds are issued to the original payment method within 5–7 business days. Actual credit timing may vary depending on banking or payment provider processing.
          </p>
        </div>

        {/* Shipping Costs */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Shipping Costs</h2>
          <p>
            Unless a product defect or error is confirmed, return shipping costs are the responsibility of the customer.
          </p>
        </div>

        {/* Inspection & Approval */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold pt-4 text-[#222222]">Inspection & Approval</h2>
          <p>
            All return or replacement requests are subject to verification to ensure eligibility under this policy.
          </p>
          <p>
            To initiate a request, contact: <br />
            <a href="mailto:helpmuroposter@gmail.com" className="font-bold underline hover:text-[#2F4F4F]">
              helpmuroposter@gmail.com
            </a>
          </p>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 pt-8 border-t border-[#222222]/10 italic opacity-60">
          <p>We design with intention, deliver with care, and evaluate every concern responsibly.</p>
        </div>

      </section>
    </PolicyPage>
  );
};

export default RefundPolicy;