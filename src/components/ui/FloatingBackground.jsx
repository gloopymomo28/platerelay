import React from 'react';

const defaultImages = [
  { src: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400&auto=format&fit=crop', className: 'w-24 md:w-32 top-[10%] left-[2%] md:left-[5%] animate-float rounded-full object-cover aspect-square', style: { border: '2px solid #FF9800', boxShadow: '0 0 20px rgba(255,152,0,0.3)', animationDelay: '0s' } },
  { src: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=400&auto=format&fit=crop', className: 'w-28 md:w-40 top-[25%] right-[2%] md:right-[5%] animate-float rounded-full object-cover aspect-square', style: { border: '2px solid #00E5FF', boxShadow: '0 0 20px rgba(0,229,255,0.3)', animationDelay: '1s' } },
  { src: 'https://images.unsplash.com/photo-1621996311210-2a132c3cc6c5?q=80&w=400&auto=format&fit=crop', className: 'w-20 md:w-28 bottom-[20%] left-[5%] md:left-[8%] animate-float rounded-full object-cover aspect-square', style: { border: '2px solid #FF5722', boxShadow: '0 0 20px rgba(255,87,34,0.3)', animationDelay: '2s' } },
  { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400&auto=format&fit=crop', className: 'w-24 md:w-32 bottom-[10%] right-[10%] md:right-[15%] animate-float rounded-full object-cover aspect-square', style: { border: '2px solid #00BFA5', boxShadow: '0 0 20px rgba(0,191,165,0.3)', animationDelay: '1.5s' } },
  { src: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=400&auto=format&fit=crop', className: 'w-16 md:w-24 top-[60%] left-[15%] md:left-[20%] animate-float rounded-full object-cover aspect-square', style: { border: '2px solid #EAB308', boxShadow: '0 0 20px rgba(234,179,8,0.3)', animationDelay: '0.8s' } },
];

export function FloatingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {defaultImages.map((img, i) => (
        <img key={i} src={img.src} className={`absolute opacity-20 md:opacity-30 ${img.className}`} style={img.style} alt="" />
      ))}
    </div>
  );
}
