import React from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Quote, Sparkles, Target, Eye } from "lucide-react";

import aboutHero from "@/assets/about-hero.jpg";
import aboutInterior from "@/assets/about-interior.jpg";

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

const About: React.FC = () => {
  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: "easeOut" },
    },
  };

  return (
    <main
      className="min-h-screen bg-white text-[#111111] font-sans selection:bg-[#111111] selection:text-white"
      style={{ backgroundColor: COLORS.page, color: COLORS.ink }}
    >
      <section className="border-b border-[#E6E6E6] bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-10 md:px-8 md:py-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-[1120px]"
          >
            <p className="mb-5 inline-flex rounded-full bg-[#ECFF66] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#111111]">
              About MURO Poster
            </p>

            <h1
              className="text-[34px] font-normal leading-[1.02] tracking-[-0.05em] text-[#111111] md:text-[46px] lg:text-[56px]"
              style={{ fontFamily: serifFont }}
            >
              Environment is not background. It is influence.
            </h1>

            <p className="mt-5 max-w-[680px] text-[15px] leading-relaxed text-[#555555] md:text-[17px]">
              What surrounds you is shaping you — every day.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-12">
        <div className="mx-auto max-w-[1500px] px-5 md:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)] lg:gap-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.75 }}
              viewport={{ once: true }}
              className="relative min-h-[460px] overflow-hidden rounded-[24px] bg-[#F2F2F2] md:min-h-[660px]"
            >
              <img
                src={aboutHero}
                alt="Minimalist wall art"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.035]"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="flex flex-col justify-center rounded-[24px] border border-[#E6E6E6] bg-white p-6 md:p-10 lg:p-12"
            >
              <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8B8B8B]">
                The conviction
              </p>

              <h2
                className="text-[28px] font-normal leading-[1.05] tracking-[-0.04em] text-[#111111] md:text-[38px]"
                style={{ fontFamily: serifFont }}
              >
                MURO POSTER was built on a simple belief: the space around you quietly shapes who you become.
              </h2>

              <p className="mt-7 text-[16px] leading-relaxed text-[#555555]">
                What you see every day doesn’t stay on the surface; it settles into your mind, influencing how you think, feel and move through life.
              </p>

              <p className="mt-5 text-[16px] leading-relaxed text-[#555555]">
                Most people treat walls as something to fill, but we see them differently. To us, they are part of your mental environment — a place where ideas are reinforced and identity takes form.
              </p>

              <div className="mt-8 rounded-[22px] bg-[#ECFF66] p-6">
                <p
                  className="text-[20px] font-normal italic leading-snug tracking-[-0.03em] text-[#111111]"
                  style={{ fontFamily: serifFont }}
                >
                  “When your environment reflects purpose, you naturally begin to live with it.”
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-12 text-white md:py-14">
        <div className="mx-auto max-w-[1500px] px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            className="mx-auto max-w-[1050px] text-center"
          >
            <Quote className="mx-auto mb-7 h-11 w-11 text-[#ECFF66]" strokeWidth={1.5} />

            <h3
              className="text-[30px] font-normal leading-[1.05] tracking-[-0.04em] md:text-[44px]"
              style={{ fontFamily: serifFont }}
            >
              Most spaces are designed to look good, but very few are designed to make you better.
            </h3>

            <p className="mx-auto mt-8 max-w-[860px] text-[16px] leading-relaxed text-white/70 md:text-[18px]">
              MURO exists to change that. Every piece we create is built to reinforce a state of mind — clarity, discipline, calm, focus, strength.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <ValueCard icon={Eye} title="Clarity" text="Visual reminders that keep your direction visible." />
            <ValueCard icon={Target} title="Focus" text="Minimal pieces that support your daily discipline." />
            <ValueCard icon={Sparkles} title="Atmosphere" text="A cleaner environment for stronger intent." />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-14">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-8 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex flex-col justify-center"
          >
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8B8B8B]">
              Our mission
            </p>

            <h2
              className="text-[32px] font-normal leading-[1.02] tracking-[-0.05em] text-[#111111] md:text-[46px]"
              style={{ fontFamily: serifFont }}
            >
              We are not here to fill walls.
            </h2>

            <p className="mt-7 max-w-[680px] text-[17px] leading-relaxed text-[#555555]">
              We are here to shape the atmosphere — to create spaces that support becoming. MURO is for those who understand that growth is a process, and the environment is an active participant in it.
            </p>

            <Link
              to="/products"
              className="mt-9 inline-flex h-13 w-fit items-center gap-3 rounded-full bg-[#111111] px-8 py-4 text-[12px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#006039]"
            >
              Start shaping your space
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75 }}
            viewport={{ once: true }}
            className="relative min-h-[420px] overflow-hidden rounded-[24px] bg-[#F2F2F2] md:min-h-[620px]"
          >
            <img
              src={aboutInterior}
              alt="Atmosphere"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] hover:scale-[1.035]"
            />

            <div className="absolute bottom-6 left-6 rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#111111] shadow-sm">
              Est. 2026
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[#E6E6E6] bg-[#F2F2F2] px-5 py-16 text-center md:px-8 md:py-20">
        <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#777777]">
          Final thought
        </p>

        <h2
          className="mx-auto max-w-[980px] text-[28px] font-normal leading-[1.08] tracking-[-0.04em] text-[#111111] md:text-[40px]"
          style={{ fontFamily: serifFont }}
        >
          Choose what surrounds you with intention. It is already shaping who you are becoming.
        </h2>
      </section>
    </main>
  );
};

const ValueCard = ({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) => (
  <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-7">
    <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFF66] text-[#111111]">
      <Icon size={20} strokeWidth={1.8} />
    </div>

    <h4
      className="text-[24px] font-normal leading-none tracking-[-0.04em] text-white"
      style={{ fontFamily: serifFont }}
    >
      {title}
    </h4>

    <p className="mt-4 text-[14px] leading-relaxed text-white/65">{text}</p>
  </div>
);

export default About;
