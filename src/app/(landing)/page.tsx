import Navbar from "@/components/sections/landing/navbar";
import Hero from "@/components/sections/landing/hero";
import About from "@/components/sections/landing/about";
import Services from "@/components/sections/landing/cara-kerja";
import Testimonial from "@/components/sections/landing/testimonial"; 
import Pricing from "@/components/sections/landing/pricing";
import CTA from "@/components/sections/landing/cta";
import Faq from "@/components/sections/landing/faq";
import Footer from "@/components/sections/landing/footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Testimonial />
      <Pricing />
      <Faq />
      <CTA />
      <Footer />
    </div>
  );
}