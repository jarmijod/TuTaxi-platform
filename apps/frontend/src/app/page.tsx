import { Navbar } from '@/components/layout/navbar';
import { Hero } from '@/components/layout/hero';
import { Features } from '@/components/layout/features';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-500">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
    </main>
  );
}
