import Nav from '../components/Nav';
import Hero from '../components/Hero';
import StatsStrip from '../components/StatsStrip';
import Features from '../components/Features';
import MilesAI from '../components/MilesAI';
import Install from '../components/Install';
import CTA from '../components/CTA';
import Compare from '../components/Compare';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <StatsStrip />
      <Features />
      <MilesAI />
      <Install />
      <Compare />
      <CTA />
      <Footer />
    </>
  );
}
