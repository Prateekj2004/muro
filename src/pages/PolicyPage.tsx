import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MessageCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

interface PolicyProps {
  title: string;
  children: React.ReactNode;
}

const COLORS = {
  page: "#FFFFFF",
  paper: "#F2F2F2",
  ink: "#111111",
  muted: "#777777",
  line: "#E6E6E6",
  accent: "#ECFF66",
  green: "#006039",
};

const serifFont = "Georgia, 'Times New Roman', serif";

const PolicyPage: React.FC<PolicyProps> = ({ title, children }) => {
  return (
    <main
      className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#111111] selection:text-white"
      style={{ backgroundColor: COLORS.page, color: COLORS.ink }}
    >
      <section className="border-b border-[#E6E6E6] bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-[1180px]"
          >
            <Link
              to="/"
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#F2F2F2] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#777777] transition-colors hover:bg-[#ECFF66] hover:text-[#111111]"
            >
              <ArrowLeft size={14} strokeWidth={1.8} />
              Back to home
            </Link>

            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#8B8B8B]">
              MURO Poster Policy
            </p>

            <h1
              className="text-[32px] font-normal leading-none tracking-[-0.05em] text-[#111111] md:text-[44px] lg:text-[52px]"
              style={{ fontFamily: serifFont }}
            >
              {title}
            </h1>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:gap-12">
          <motion.article
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5 }}
            className="rounded-[24px] border border-[#E6E6E6] bg-white p-6 md:p-9 lg:p-11"
          >
            <div
              className="policy-content prose prose-neutral max-w-none
                prose-headings:font-bold prose-headings:text-[#111111]
                prose-p:text-[#555555] prose-p:leading-8 prose-p:text-[15px] md:prose-p:text-[16px]
                prose-li:text-[#555555] prose-strong:text-[#111111]
                prose-a:text-[#111111] prose-a:decoration-[#111111]/35 hover:prose-a:text-[#006039]"
            >
              {children}
            </div>
          </motion.article>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="space-y-5 lg:sticky lg:top-28 lg:self-start"
          >
            <div className="overflow-hidden rounded-[24px] border border-[#E6E6E6] bg-white">
              <div className="bg-[#ECFF66] px-7 py-5">
                <h3 className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#111111]">
                  Quick navigation
                </h3>
              </div>

              <nav className="flex flex-col p-3">
                <PolicyLink to="/shipping-policy" label="Shipping Policy" />
                <PolicyLink to="/cancellation-refund" label="Cancellation & Refund" />
                <PolicyLink to="/privacy" label="Privacy Policy" />
                <PolicyLink to="/terms" label="Terms & Conditions" />
              </nav>
            </div>

            <div className="rounded-[24px] bg-[#111111] p-7 text-white">
              <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.18em] text-[#ECFF66]">
                Need help?
              </p>

              <h3
                className="text-[24px] font-normal leading-none tracking-[-0.04em]"
                style={{ fontFamily: serifFont }}
              >
                Contact support
              </h3>

              <p className="mt-4 text-[14px] leading-relaxed text-white/70">
                If you have questions about this policy, our support team is available to assist you.
              </p>

              <div className="mt-7 space-y-4">
                <a
                  href="mailto:helpmuroposter@gmail.com"
                  className="flex items-center gap-3 text-[14px] font-semibold text-white transition-colors hover:text-[#ECFF66]"
                >
                  <Mail size={17} strokeWidth={1.7} />
                  helpmuroposter@gmail.com
                </a>

                <a
                  href="https://wa.me/918059700876"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-[14px] font-semibold text-white transition-colors hover:text-[#ECFF66]"
                >
                  <MessageCircle size={17} strokeWidth={1.7} />
                  +91 80597 00876
                </a>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#F2F2F2] p-7">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#777777]">
                MURO promise
              </p>
              <p
                className="mt-4 text-[22px] font-normal leading-[1.08] tracking-[-0.04em] text-[#111111]"
                style={{ fontFamily: serifFont }}
              >
                Designed with intention. Delivered with care.
              </p>
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
};

const PolicyLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="group flex items-center justify-between gap-4 rounded-[16px] px-4 py-4 text-[13px] font-bold uppercase tracking-[0.12em] text-[#111111] transition-colors hover:bg-[#F2F2F2] hover:text-[#006039]"
  >
    <span>{label}</span>
    <ChevronRight
      size={15}
      strokeWidth={2}
      className="text-[#999999] transition-transform group-hover:translate-x-1 group-hover:text-[#006039]"
    />
  </Link>
);

export default PolicyPage;
