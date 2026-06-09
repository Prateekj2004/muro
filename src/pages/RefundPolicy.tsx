import React from "react";
import PolicyPage from "./PolicyPage";

const headingClass =
  "pt-4 text-[21px] font-bold leading-none tracking-[-0.03em] text-[#111111] md:text-[26px]";

const RefundPolicy: React.FC = () => {
  return (
    <PolicyPage title="Cancellation & Refund Policy">
      <section className="space-y-8">
        <div className="rounded-[22px] bg-[#F2F2F2] p-6 md:p-8">
          <p className="text-[18px] font-normal italic leading-snug tracking-[-0.03em] text-[#111111] md:text-[22px]">
            We stand behind the quality of every MURO product. If something is not right, we address it with clarity and fairness.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Order Cancellation</h2>
          <p>
            Orders may be cancelled within 24 hours of purchase, provided production or shipping has not begun. Once an order enters printing, packaging, or dispatch, cancellation is no longer possible.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Returns & Replacements</h2>
          <p>
            Requests for return or replacement must be submitted within 7 days of delivery and are reviewed on a case-by-case basis under the following conditions:
          </p>

          <ul className="list-disc space-y-2 pl-5 text-[#555555] marker:text-[#111111]">
            <li>Product arrived damaged</li>
            <li>Incorrect item received</li>
            <li>Confirmed non-delivery</li>
          </ul>

          <p>
            To support your request, clear photos or relevant documentation may be required. Items must remain unused and in original condition.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Non-Refundable Cases</h2>
          <p>Returns or refunds are not accepted for:</p>

          <ul className="list-disc space-y-2 pl-5 text-[#555555] marker:text-[#111111]">
            <li>Change of mind</li>
            <li>Incorrect selection made by the customer</li>
            <li>Minor color variations due to screen or lighting differences</li>
          </ul>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Delivery Responsibility</h2>
          <p>
            Customers are responsible for providing accurate shipping details. Delivery delays caused by courier services, incorrect addresses, or failed delivery attempts may not qualify for refund.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Refund Process</h2>
          <p>
            Approved refunds are issued to the original payment method within 5–7 business days. Actual credit timing may vary depending on banking or payment provider processing.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Shipping Costs</h2>
          <p>
            Unless a product defect or error is confirmed, return shipping costs are the responsibility of the customer.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Inspection & Approval</h2>
          <p>
            All return or replacement requests are subject to verification to ensure eligibility under this policy.
          </p>
          <p>
            To initiate a request, contact:{" "}
            <a href="mailto:helpmuroposter@gmail.com" className="font-bold underline underline-offset-4 hover:text-[#006039]">
              helpmuroposter@gmail.com
            </a>
          </p>
        </div>

        <div className="mt-12 rounded-[22px] bg-[#ECFF66] p-6 font-bold text-[#111111] md:p-8">
          <p>We design with intention, deliver with care, and evaluate every concern responsibly.</p>
        </div>
      </section>
    </PolicyPage>
  );
};

export default RefundPolicy;
