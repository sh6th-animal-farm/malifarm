import { useState } from 'react';

export default function ImageCarousel({ images }: { images: string[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const moveSlide = (step: number) => {
    const total = images.length;
    setCurrentIdx((prev) => (prev + step + total) % total);
  };

  if (!images || images.length === 0) {
    return <div className="w-full aspect-[16/9] bg-gray-50 rounded-none md:rounded-lg" />;
  }

  return (
    <div className="relative overflow-hidden">
      <div className="w-full aspect-[16/9] rounded-none md:rounded-lg overflow-hidden bg-gray-50 relative">
        <div 
          className="flex h-full transition-transform duration-500 ease-in-out" 
          style={{ transform: `translateX(-${currentIdx * 100}%)` }}
        >
          {images.map((img, i) => (
            <div key={i} className="min-w-full h-full flex items-center justify-center">
              <img src={img} className="w-full h-full object-cover" alt="project" />
            </div>
          ))}
        </div>
      </div>
      {/* 슬라이드 컨트롤 */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-[12px] mt-[24px]">
          <button onClick={() => moveSlide(-1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 shadow-sm">❮</button>
          <div className="flex gap-2">
            {images.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentIdx(i)}
                className={`h-2 rounded-full transition-all duration-300 ${currentIdx === i ? 'w-6 bg-green-600' : 'w-2 bg-gray-200'}`} 
              />
            ))}
          </div>
          <button onClick={() => moveSlide(1)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-50 shadow-sm">❯</button>
        </div>
    )}
    </div>
  );
}
