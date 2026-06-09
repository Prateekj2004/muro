import React from "react";
import PolicyPage from "./PolicyPage";

const headingClass =
  "pt-4 text-[21px] font-bold leading-none tracking-[-0.03em] text-[#111111] md:text-[26px]";

const ShippingPolicy: React.FC = () => {
  return (
    <PolicyPage title="Shipping Policy">
      <section className="space-y-8">
        <div className="rounded-[22px] bg-[#F2F2F2] p-6 md:p-8">
          <p className="text-[18px] font-normal italic leading-snug tracking-[-0.03em] text-[#111111] md:text-[22px]">
            At MURO POSTER, environment matters and so does delivery.
          </p>

          <p className="mt-5 text-[#555555]">
            Each piece is produced, packed, and shipped with care because what shapes your space should arrive with the same intention it was designed with.
          </p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Order Processing</h2>
          <p>All MURO products are prepared after order confirmation.</p>
          <p>Orders are typically processed within 2–4 business days, depending on product type and volume. Processing times are estimates and may vary during peak periods.</p>
          <p>You will receive a dispatch confirmation email once your order has shipped.</p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Shipping & Delivery</h2>
          <p>Estimated delivery time is 5–10 business days after dispatch. Delivery timelines are estimates only and are not guaranteed, as they depend on location, carrier performance, and external conditions. Remote areas or unforeseen logistical factors may result in additional transit time.</p>
          <p>Once an order is dispatched, it is handled by third-party shipping partners. While we work with trusted carriers, MURO POSTER is not responsible for delays caused by courier operations, customs processing, weather conditions, or other events beyond our control. We will, however, assist in tracking and communication wherever possible.</p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Packaging</h2>
          <p>Products are securely packed using protective materials designed to minimize the risk of bending, scratches, or transit damage.</p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Tracking</h2>
          <p>A tracking link will be sent via email once your order has been shipped.</p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Shipping Issues</h2>
          <p>
            If your order arrives damaged or appears lost, please contact{" "}
            <a href="mailto:helpmuroposter@gmail.com" className="font-bold underline underline-offset-4 hover:text-[#006039]">
              helpmuroposter@gmail.com
            </a>{" "}
            within 72 hours of delivery or expected delivery with your order details and supporting images if applicable.
          </p>
          <p>We will review the situation and work toward an appropriate resolution.</p>
        </div>

        <div className="space-y-4 border-t border-[#E6E6E6]">
          <h2 className={headingClass}>Force Majeure</h2>
          <p>MURO POSTER is not liable for shipping delays or delivery failures resulting from circumstances beyond reasonable control, including but not limited to natural events, transportation disruptions, labor actions, or regulatory delays.</p>
        </div>

        <div className="mt-12 rounded-[22px] bg-[#ECFF66] p-6 font-bold text-[#111111] md:p-8">
          <p>We don’t ship decorations. We ship intention.</p>
          <p className="mt-2 opacity-75">Choose what surrounds you carefully — we’ll handle the rest.</p>
        </div>
      </section>
    </PolicyPage>
  );
};

export default ShippingPolicy;
