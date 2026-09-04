import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";

export default function Engagement() {
  const testimonials = [
    {
      quote: "TODELLAA gives us accuracy, visibility and control over our finances like never before.",
      author: "Michael Dei",
      role: "Finance Director, Bright Future Schools",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    {
      quote: "Our month-end payment reconciliation went from taking 5 days down to under 20 minutes.",
      author: "Sarah Kwakye",
      role: "Head of Operations, Apex Health Clinics",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    },
    {
      quote: "Matching bank transfers and Mobile Money deposits across our 3 campuses is now 100% automated.",
      author: "Emmanuel Mensah",
      role: "Bursar, Heritage International College",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="py-16 sm:py-24 bg-white text-[#010101] font-sans border-t border-[#e6e4dc]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white/70 border border-[#e6e4dc] rounded-3xl p-8 sm:p-12 shadow-xs relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            
            {/* Quote Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-[#010101] text-white flex items-center justify-center shrink-0 shadow-md">
              <Quote className="w-8 h-8 fill-current" />
            </div>

            {/* Content & Carousel */}
            <div className="grow text-center md:text-left">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <blockquote className="font-sans font-extrabold text-2xl sm:text-3xl md:text-[32px] text-[#010101] leading-snug tracking-tight mb-8">
                    "{current.quote}"
                  </blockquote>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#fcdcc5] pt-6">
                    <div className="flex items-center gap-4 text-left">
                      <img
                        src={current.avatar}
                        alt={current.author}
                        className="w-12 h-12 rounded-full object-cover border-2 border-[#e8562a]"
                      />
                      <div>
                        <h4 className="font-bold text-base text-[#010101]">{current.author}</h4>
                        <p className="text-xs text-[#737373] font-medium">{current.role}</p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                      {/* Pagination Dots */}
                      <div className="flex items-center gap-1.5">
                        {testimonials.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              i === currentIndex ? "w-6 bg-[#e8562a]" : "w-2 bg-[#d4d4d4]"
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                          />
                        ))}
                      </div>

                      {/* Arrows */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handlePrev}
                          className="w-9 h-9 rounded-full bg-white border border-[#d4d4d4] hover:bg-neutral-50 text-[#010101] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          aria-label="Previous Testimonial"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleNext}
                          className="w-9 h-9 rounded-full bg-white border border-[#d4d4d4] hover:bg-neutral-50 text-[#010101] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          aria-label="Next Testimonial"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
