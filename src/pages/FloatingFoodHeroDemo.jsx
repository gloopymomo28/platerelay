import React from 'react';
import { FloatingFoodHero } from '../components/ui/hero-section-7'; // Adjust the import path

export default function FloatingFoodHeroDemo() {
  const heroImages = [
    {
      src: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', // Burger
      alt: 'A delicious cheeseburger',
      className: 'w-40 sm:w-56 md:w-64 lg:w-72 top-10 left-4 sm:left-10 md:top-20 md:left-20 animate-float rounded-full shadow-lg',
    },
    {
      src: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=400&auto=format&fit=crop', // Dumplings
      alt: 'Dumplings',
      className: 'w-28 sm:w-36 md:w-48 top-10 right-4 sm:right-10 md:top-16 md:right-16 animate-float rounded-full shadow-lg',
    },
    {
      src: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop', // Pizza
      alt: 'A slice of pizza',
      className: 'w-32 sm:w-40 md:w-56 bottom-8 right-5 sm:right-10 md:bottom-16 md:right-20 animate-float rounded-full shadow-lg',
    },
     {
      src: 'https://images.unsplash.com/photo-1628775438848-f865f1e8e2b0?q=80&w=200&auto=format&fit=crop', // Basil leaf (approximate)
      alt: 'A basil leaf',
      className: 'w-16 sm:w-24 top-1/4 left-1/3 animate-float rounded-full shadow-md',
    },
    {
      src: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=200&auto=format&fit=crop', // Tomato
      alt: 'A slice of tomato',
      className: 'w-16 sm:w-20 top-1/2 right-1/4 animate-float rounded-full shadow-md',
    },
    {
      src: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=200&auto=format&fit=crop', // Tomato
      alt: 'A slice of tomato',
      className: 'w-16 sm:w-20 top-3/4 left-1/4 animate-float rounded-full shadow-md',
    },
  ];

  return (
    <div className="w-full">
      <FloatingFoodHero
        title="Better food for more people"
        description="For over a decade, we've enabled our customers to discover new tastes, delivered right to their doorstep."
        images={heroImages}
      />
    </div>
  );
}
