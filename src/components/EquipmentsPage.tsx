import React from 'react';
import { useEquipmentsData } from '../lib/apiCatalog';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

interface EquipmentsPageProps {
  onPageChange: (page: string, extra?: any) => void;
}

export default function EquipmentsPage({ onPageChange }: EquipmentsPageProps) {
  const equipments = useEquipmentsData();

  return (
    <div className="bg-brand-cream-light min-h-screen py-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title & Introduction */}
        <div className="max-w-full mb-12">
          <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono block mb-5">
            Utensílios de Barismo para Extração Superior
          </span>
          <h1 className="font-serif text-3.5xl sm:text-4.5xl font-bold text-brand-brown-950 tracking-tight leading-tight mb-4">
            Equipamentos para um apreciador de café
          </h1>
          <div className="text-sm sm:text-base font-light text-brand-brown-750 leading-relaxed space-y-1.5 text-justify">
            <p>
              A verdadeira suntuosidade de um café tradicional superior ou microlote especial necessita do ritual de preparo adequado para florescer. Fatores essenciais como a moagem uniforme dos grãos na hora, o fluxo aerodinâmico da água quente pela chaleira pescoço de cisne, a exatidão das proporções medidas na balança digital e o acondicionamento hermético pós-abertura ditam a textura, acidez, amargura e intensidade da sua xícara. Encontre as ferramentas ideais.
            </p>
          </div>
        </div>

        {/* Product Cards Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {equipments.map((eq) => (
            <div 
              key={eq.id}
              className="bg-brand-cream-light rounded-xl border border-brand-beige/50 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Image panel */}
                <div className="h-52 relative overflow-hidden bg-brand-cream-deep">
                  <img 
                    src={eq.image} 
                    alt={eq.name} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-brand-brown-900 text-brand-gold text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full shadow-xs border border-brand-gold/15">
                    Acessório Recomendado
                  </div>
                </div>

                {/* Body Text */}
                <div className="p-6 space-y-3">
                  <h3 className="font-serif text-base font-bold text-brand-brown-950 group-hover:text-brand-amber-500 transition-colors leading-snug line-clamp-1">{eq.name}</h3>
                  <p className="text-xs font-light text-brand-brown-750 leading-relaxed line-clamp-3">{eq.description}</p>
                  
                  {/* Miniature specs bullet highlights */}
                  <div className="pt-3 flex flex-col gap-1.5 text-[10px] text-brand-brown-700/80 font-light">
                    <div className="flex gap-1.5 items-center">
                      <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      <span>Material e durabilidade certificados</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <Check className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                      <span>Testados e aprovados por nossa equipe</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom price action buy panel */}
              <div className="p-6 pt-3 border-t border-brand-beige/35 flex justify-between items-center bg-brand-cream-deep/15">
                <div className="flex flex-col">
                  <span className="text-[8px] text-brand-brown-600 font-light uppercase tracking-wider">Investimento</span>
                  <span className="text-sm font-bold font-mono text-brand-brown-900">R$ {eq.price.toFixed(2)}</span>
                </div>
                
                <button
                  onClick={() => onPageChange('equipamento', { id: eq.id })}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-brand-brown-850 hover:bg-brand-gold hover:text-brand-brown-950 text-brand-cream-light text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer"
                  id={`saiba-mais-equip-${eq.id}`}
                >
                  Saiba mais
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
