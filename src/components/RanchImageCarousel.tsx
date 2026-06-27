import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, X, Image as ImageIcon } from "lucide-react";

interface RanchImageCarouselProps {
  images?: string[];
  title: string;
  subtitle: string;
}

export default function RanchImageCarousel({ images = [], title, subtitle }: RanchImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1: left, 1: right
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback to a default image if no images are provided
  const carouselImages = images.length > 0 
    ? images 
    : ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80"];

  // Auto-play interval
  useEffect(() => {
    if (isLightboxOpen || isHovered || carouselImages.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isLightboxOpen, isHovered, carouselImages.length]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Variants for sliding animation
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    }),
  };

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-2xl group border border-slate-900 aspect-video select-none bg-slate-950"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="ranch-carousel-container"
    >
      {/* Slides */}
      <div className="absolute inset-0 overflow-hidden w-full h-full">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={currentIndex}
            src={carouselImages[currentIndex]}
            alt={`${title} - Foto ${currentIndex + 1}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full object-cover absolute inset-0"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      </div>

      {/* Persistent Swiss layout style visual overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-6 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
          Galeria de Fotos
        </span>
        <h1 className="font-sans font-bold text-2xl tracking-tight text-white mb-1 shadow-sm">
          {title}
        </h1>
        <p className="text-xs text-slate-300 font-sans font-light leading-snug drop-shadow-md">
          {subtitle}
        </p>
      </div>

      {/* Floating Controls (visible on hover/active or if multi-image) */}
      {carouselImages.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 hover:bg-amber-500 hover:text-slate-950 text-white transition-all shadow-lg border border-slate-800 backdrop-blur-sm opacity-0 group-hover:opacity-100 active:scale-95 cursor-pointer"
            id="ranch-carousel-prev"
            title="Foto Anterior"
          >
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 hover:bg-amber-500 hover:text-slate-950 text-white transition-all shadow-lg border border-slate-800 backdrop-blur-sm opacity-0 group-hover:opacity-100 active:scale-95 cursor-pointer"
            id="ranch-carousel-next"
            title="Próxima Foto"
          >
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Top right buttons (Fullscreen light box & Counter) */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        {carouselImages.length > 1 && (
          <span className="bg-slate-950/60 backdrop-blur-sm border border-slate-800 text-[10px] font-mono text-slate-300 px-2 py-1 rounded-full font-bold">
            {currentIndex + 1} / {carouselImages.length}
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="p-2 rounded-xl bg-slate-950/60 hover:bg-amber-500 hover:text-slate-950 text-white transition-all border border-slate-800 backdrop-blur-sm active:scale-95 cursor-pointer"
          id="ranch-carousel-lightbox-open"
          title="Ver em tela cheia"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Progress Dots Indicators at bottom center */}
      {carouselImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                index === currentIndex 
                  ? "w-4 bg-amber-500" 
                  : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
              title={`Ir para foto ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Lightbox Modal (Full Screen View) */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/98 z-50 flex flex-col justify-between p-4 md:p-8"
            id="ranch-carousel-lightbox"
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between w-full max-w-5xl mx-auto text-white">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-amber-500" />
                <h3 className="font-sans font-bold text-sm md:text-base">{title}</h3>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-400">
                  Foto {currentIndex + 1} de {carouselImages.length}
                </span>
                <button
                  onClick={() => setIsLightboxOpen(false)}
                  className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                  id="ranch-carousel-lightbox-close"
                  title="Fechar"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Image Container */}
            <div className="flex-1 flex items-center justify-center relative w-full max-w-5xl mx-auto my-4 overflow-hidden">
              {carouselImages.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 md:left-4 z-10 p-3 rounded-xl bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white transition-all shadow-2xl border border-slate-800 active:scale-95 cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
              )}

              <motion.img
                key={`lightbox-${currentIndex}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                src={carouselImages[currentIndex]}
                alt={`${title} - Foto ${currentIndex + 1} em tela cheia`}
                className="max-w-full max-h-[75vh] md:max-h-[80vh] rounded-2xl object-contain shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {carouselImages.length > 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 md:right-4 z-10 p-3 rounded-xl bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white transition-all shadow-2xl border border-slate-800 active:scale-95 cursor-pointer"
                  title="Próxima"
                >
                  <ChevronRight size={24} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Lightbox Thumbnails Navigator */}
            {carouselImages.length > 1 && (
              <div className="w-full max-w-4xl mx-auto overflow-x-auto py-3 px-1 flex gap-2 justify-center no-scrollbar">
                {carouselImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      index === currentIndex 
                        ? "border-amber-500 scale-105 shadow-md shadow-amber-500/20" 
                        : "border-slate-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
