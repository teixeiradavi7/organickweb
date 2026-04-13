import Navbar from "@/components/Navbar";
import HeroVideo from "@/components/HeroVideo";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Scroll-driven video hero with CTA buttons */}
        <HeroVideo />
      </main>
    </div>
  );
}
