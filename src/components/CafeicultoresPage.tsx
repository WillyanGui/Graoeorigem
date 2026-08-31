import React from 'react';
import { cafeicultoresData } from '../data/cafeicultores';
import { Sparkles, Trophy, HeartHandshake, MapPin, Landmark } from 'lucide-react';

interface CafeicultoresPageProps {
  onPageChange: (page: string) => void;
}

export default function CafeicultoresPage({ onPageChange }: CafeicultoresPageProps) {
  return (
    <div className="bg-brand-cream-light min-h-screen py-16 animate-fade-in text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Intro */}
        <div className="max-w-full mb-12">
          <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono block mb-5">
            Parcerias Dignas e Comércio Justo
          </span>
          <h1 className="font-serif text-3.5xl sm:text-4.5xl font-bold text-brand-brown-950 tracking-tight leading-tight mb-4">
            Nossos Cafeicultores Associados
          </h1>
          <div className="text-sm sm:text-base font-light text-brand-brown-750 leading-relaxed space-y-1.5 text-justify">
            <p>
              Por trás de cada fragrância profunda e suntuosa xícara servida na sua casa, reside a dedicação incansável, de sol a sol, de pequenos produtores rurais brasileiros. Adotamos o conceito de comércio equitativo ("Direct Trade"), comprando safras inteiras por valores significativamente superiores à tabela de commodities comerciais, garantindo bem-estar social no campo, reflorestamento e agricultura sustentável. Conheça as histórias destas famílias.
            </p>
          </div>
        </div>

        {/* Cafeicultor Cards Display */}
        <div className="space-y-16 max-w-5xl mx-auto">
          {cafeicultoresData.map((prod, index) => {
            const isEven = index % 2 === 0;
            return (
              <div 
                key={prod.id}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-brand-cream-deep/40 rounded-2xl p-6 md:p-8 border border-brand-beige/50 hover:shadow-xs transition-shadow ${
                  isEven ? '' : 'lg:flex-row-reverse'
                }`}
              >
                
                {/* Image */}
                <div className={`lg:col-span-4 ${!isEven && 'lg:order-last'}`}>
                  <div className="relative border border-brand-beige rounded-2xl overflow-hidden aspect-square max-w-xs mx-auto bg-brand-cream-deep shadow-2xs">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-brand-brown-900 border border-brand-gold/30 p-2 rounded-lg text-brand-gold text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Produtor Dedicado</span>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-brand-amber-500 font-bold uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                      <span>{prod.location}</span>
                    </div>
                    
                    <h2 className="font-serif text-2xl font-bold text-brand-brown-950">
                      {prod.name}
                    </h2>
                    
                    <div className="flex items-center gap-1.5 text-xs text-brand-brown-600 font-semibold leading-none">
                      <Landmark className="w-4 h-4 text-brand-gold" />
                      <span>Sítio {prod.farm}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm font-light text-brand-brown-800 leading-relaxed font-sans">
                    {prod.history}
                  </p>

                  {/* Specialty highlight box */}
                  <div className="p-3.5 bg-white border border-brand-beige/65 rounded-xl">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold block font-mono">Especialidade da Família</span>
                    <p className="text-xs font-semibold text-brand-brown-900 leading-relaxed mt-1">{prod.specialty}</p>
                  </div>

                  {/* Buy call to action */}
                  <div className="pt-2">
                    <button
                      onClick={() => onPageChange('tradicionais')}
                      className="inline-flex items-center gap-1.5 px-4 h-9 rounded-lg bg-brand-brown-850 hover:bg-brand-gold text-brand-cream-light hover:text-brand-brown-950 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      id={`conhecer-cafe-produtor-${prod.id}`}
                    >
                      Ver cafés dessa região
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
