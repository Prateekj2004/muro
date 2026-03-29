import React from "react";
import PolicyPage from "./PolicyPage";

const ShippingPolicy: React.FC = () => {
  return (
    <PolicyPage title="Shipping Policy">
      {/* Maine wapas aapka purana structure 'section' aur 'divs' ke saath use kiya hai.
        Isse 'space-y-8' aur 'space-y-4' se wahi gapping wapas aa jayegi jo aap chahte the.
      */}
      <section className="space-y-8">
        
        {/* Intro Section - Drop Cap 'A' yahan apne aap apply hoga PolicyPage se */}
        <div>
          <p className="text-lg italic font-medium text-[# 1c1c1c] mb-6">
            At MURO POSTER, environment matters and so does delivery.
          </p>
          <p>
            Each piece is produced, packed, and shipped with care because what shapes your space should arrive with the same intention it was designed with.
          </p>
        </div>

        {/* Order Processing */}
        <div className="space-y-4 border-t border-[# 1c1c1c]/10">
          <h1 className="text-2xl font-black pt-4 text-[# 1c1c1c]" style={{ WebkitTextStroke: "0.5px # 1c1c1c" }}>Order Processing</h1>
          <p>All MURO products are prepared after order confirmation.</p>
          <p>Orders are typically processed within 2–4 business days, depending on product type and volume. Processing times are estimates and may vary during peak periods.</p>
          <p>You will receive a dispatch confirmation email once your order has shipped.</p>
        </div>

        {/* Shipping & Delivery */}
        <div className="space-y-4 border-t border-[# 1c1c1c]/10">
          <h1 className="text-2xl font-bold pt-4 text-[# 1c1c1c]" style={{"fontWeight": "1500 !impotent"}}>Shipping & Delivery</h1>
          <p>Estimated delivery time is 5–10 business days after dispatch. Delivery timelines are estimates only and are not guaranteed, as they depend on location, carrier performance, and external conditions. Remote areas or unforeseen logistical factors may result in additional transit time.</p>
          <p>Once an order is dispatched, it is handled by third-party shipping partners. While we work with trusted carriers, MURO POSTER is not responsible for delays caused by courier operations, customs processing, weather conditions, or other events beyond our control. We will, however, assist in tracking and communication wherever possible.</p>
        </div>

        {/* Packaging */}
        <div className="space-y-4 border-t border-[# 1c1c1c]/10">
          <h1 className="text-2xl font-bold pt-4 text-[# 1c1c1c]" style={{"fontWeight": "1500 !impotent"}}>Packaging</h1>
          <p>Products are securely packed using protective materials designed to minimize the risk of bending, scratches, or transit damage.</p>
        </div>

        {/* Tracking */}
        <div className="space-y-4 border-t border-[# 1c1c1c]/10">
          <h1 className="text-2xl font-bold pt-4 text-[# 1c1c1c]" style={{"fontWeight": "1500 !impotent"}}>Tracking</h1>
          <p>A tracking link will be sent via email once your order has been shipped.</p>
        </div>

        {/* Shipping Issues */}
        <div className="space-y-4 border-t border-[# 1c1c1c]/10">
          <h1 className="text-2xl font-bold pt-4 text-[# 1c1c1c]" style={{"fontWeight": "1500 !impotent"}}>Shipping Issues</h1>
          <p>If your order arrives damaged or appears lost, please contact <a href="mailto:helpmuroposter@gmail.com" className="font-bold underline hover:text-[#2F4F4F]">helpmuroposter@gmail.com</a> within 72 hours of delivery (or expected delivery) with your order details and supporting images if applicable.</p>
          <p>We will review the situation and work toward an appropriate resolution.</p>
        </div>

        {/* Force Majeure */}
        <div className="space-y-4 border-t border-[# 1c1c1c]/10 ">
          <h1 className="text-2xl font-bold pt-4 text-[# 1c1c1c]" style={{"fontWeight": "1500 !impotent"}}>Force Majeure</h1>
          <p>MURO POSTER is not liable for shipping delays or delivery failures resulting from circumstances beyond reasonable control, including but not limited to natural events, transportation disruptions, labor actions, or regulatory delays.</p>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 font-bold pt-8 border-t border-[# 1c1c1c]/10" style={{"fontWeight": "1500 !impotent"}}>
          <p className=" opacity-60" style={{"fontWeight": "1500 !impotent"}}>We don’t ship decorations. We ship intention.</p>
          <p className=" opacity-60" style={{"fontWeight": "1500 !impotent"}}>Choose what surrounds you carefully — we’ll handle the rest.</p>
        </div>

      </section>
    </PolicyPage>
  );
};

export default ShippingPolicy;