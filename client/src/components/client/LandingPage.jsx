import { useState } from 'react';
import balaiBg from "../../assets/balaibg.jpg";
import BookingForm from './BookingForm'; // Import the new form

const LandingPage = () => {
  // State to track if the booking form should be visible
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="w-full scroll-smooth">
 
      {/* --- HERO: full-screen background, clipped on its own --- */}
      <div
        className="relative h-screen w-full bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${balaiBg})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
 
        <div className="relative z-10 flex flex-col h-full px-6 py-10 overflow-y-auto">
 
          {/* Top Navigation Bar */}
          <header className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
            <img
              src="./src/assets/BalaiLogo.svg"
              alt="Balai 88 Logo"
              className="w-12 h-auto object-contain"
            />
 
            <a
              href="#about"
              className="text-white text-sm font-poppins underline decoration-white/70 underline-offset-4 hover:text-gray-200 transition-colors"
            >
              About Us
            </a>
          </header>
 
          <main className="flex-1 flex flex-col justify-center mt-12 max-w-lg relative">
            <h1 className="text-white text-5xl font-serif leading-tight">
              Your private <br />
              retreat for <br />
              <span className="italic font-serif">rest and <br /> relaxation.</span>
            </h1>
 
            <hr className="w-full max-w-70 border-white my-6 border-t-2" />
 
            <p className="text-white text-sm font-semibold tracking-widest uppercase leading-relaxed">
              A tranquil and secluded villa <br />
              where you can truly unwind.
            </p>
 
            {/* Conditional Rendering: Show Button OR Form */}
            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="mt-8 bg-[#E6BA7A] text-white px-8 py-3 rounded-full font-medium text-lg w-fit shadow-lg hover:bg-[#d4a96b] transition-colors"
              >
                Book Now
              </button>
            ) : (
              <div className="mt-8">
                <BookingForm onClose={() => setShowForm(false)} />
              </div>
            )}
          </main>
        </div>
      </div>
 
      {/* --- ABOUT US SECTION (outside the hero, so the page scrolls) --- */}
      <section id="about" className="relative z-10 text-neutral-900 font-['Poppins',sans-serif]">
 
        {/* Story: overlapping photos + text */}
        <div className="bg-white px-6 py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-16">
 
            {/* Overlapping photos */}
            <div className="relative pb-10 md:pb-12">
              <img
                src="/src/assets/balaiaboutpic1.jpg"
                alt="Balai88 courtyard and swimming pool"
                className="aspect-[16/11] w-[88%] object-cover"
              />
              <img
                src="/src/assets/balaiaboutpic2.jpg"
                alt="Pool seen from the garden path"
                className="absolute bottom-0 right-0 aspect-[5/4] w-[46%] border-[10px] border-white object-cover"
              />
            </div>
 
            {/* Text */}
            <div>
              <p className="text-sm text-neutral-700">Discover</p>
              <h2 className="mt-1 font-['Playfair_Display',serif] text-3xl font-normal leading-tight text-neutral-900 [font-variant:small-caps] md:text-4xl">
                About Balai88
              </h2>
 
              <div className="mt-3 space-y-4 text-sm leading-snug text-neutral-800">
                <p>
                  Welcome to <strong className="font-semibold">Balai88</strong>, a serene sanctuary designed
                  for guests seeking peace, modern comfort, and an authentic private escape.
                </p>
                <p>
                  Nestled away from the bustle of everyday life, our private villa combines minimalist luxury
                  with warm hospitality. Whether you're planning a quiet weekend getaway, a family retreat,
                  or a memorable celebration, Balai88 offers the space and privacy to create lasting memories.
                </p>
              </div>
 
              <a
                href="#rooms"
                className="mt-8 inline-block bg-[#D9D9D9] px-7 py-3 text-sm uppercase text-neutral-900 transition-colors hover:bg-neutral-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
              >
                View Rooms
              </a>
            </div>
          </div>
        </div>
 
        {/* What we offer: grey band with three white cards */}
        <div className="bg-[#D9D9D9] px-6 py-14 md:py-16">
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3 md:gap-16">
            {[
              {
                title: "Exclusive Private Villa",
                text: "The whole villa is yours alone. No shared spaces, no strangers, just your group.",
              },
              {
                title: "Lounges & Outdoor Relaxation",
                text: "Spacious indoor lounges open onto the garden and pool, made for slow afternoons.",
              },
              {
                title: "Easy Booking & Personal Care",
                text: "Book online with flexible dates, and our team looks after you before and during your stay.",
              },
            ].map((item) => (
              <article key={item.title} className="flex min-h-[200px] flex-col justify-center bg-white p-8">
                <h3 className="font-['Playfair_Display',serif] text-xl text-neutral-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-snug text-neutral-700">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;