import React, { useMemo } from 'react';
import { Equipamento, CartItem } from '../types';
import { useEquipmentsData } from '../lib/apiCatalog';
import { 
  ArrowLeft, CheckCircle, Truck, RefreshCw, ShoppingCart, 
  HelpCircle, Sparkles, BookOpen 
} from 'lucide-react';

interface EquipmentDetailPageProps {
  equipId: number;
  onPageChange: (page: string, extra?: any) => void;
  onAddToCartAndCheckout: (item: Omit<CartItem, 'id' | 'priceTotal'>) => void;
}

export default function EquipmentDetailPage({ equipId, onPageChange, onAddToCartAndCheckout }: EquipmentDetailPageProps) {
  const equipmentsData = useEquipmentsData();
  const eq = useMemo(() => {
    return equipmentsData.find(item => item.id === equipId) || equipmentsData[0];
  }, [equipId, equipmentsData]);

  const handleComprarAgora = () => {
    onAddToCartAndCheckout({
      productType: 'equipamento',
      quantity: 1,
      priceUnit: eq.price,
      equipamentoDetails: {
        id: eq.id,
        productId: eq.productId,
        name: eq.name,
        image: eq.image
      }
    });
  };

  return (
    <div className="bg-brand-cream-light min-h-screen py-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        {/* Back Link Button */}
        <button
          onClick={() => onPageChange('equipamentos')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-brown-800 hover:text-brand-gold uppercase tracking-wider mb-8 cursor-pointer"
          id="eq-back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Acessórios
        </button>

        {/* Core details segment split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start pb-16 border-b border-brand-beige/35">
          
          {/* LFT: Visual and delivery details */}
          <div className="space-y-6">
            <div className="border border-brand-beige/50 rounded-2xl overflow-hidden shadow-xs bg-brand-cream-deep/60 relative">
              <img
                src={eq.image}
                alt={eq.name}
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute top-4 left-4 bg-brand-brown-900 text-brand-gold text-[9px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full shadow-xs">
                Acessório de Barista
              </div>
            </div>

            {/* Courier shipping estimations */}
            <div className="p-5 bg-brand-cream-deep/60 border border-brand-beige rounded-xl space-y-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-brown-700 block">Opções e prazos de entrega</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light text-brand-brown-800">
                <div className="flex gap-2 p-2.5 bg-white/70 rounded-lg border border-brand-beige/30 sm:col-span-2">
                  <Truck className="w-4.5 h-4.5 text-brand-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-brand-brown-950">Cotação no checkout</span>
                    <span>Preço e prazo são calculados pelo CEP e pela origem do item.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RGT: specs and textual details */}
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono">Alta Durabilidade Garantida</span>
              <h1 className="font-serif text-2.5xl sm:text-3xl font-bold text-brand-brown-950 tracking-tight">{eq.name}</h1>
              <p className="text-sm font-light text-brand-brown-800 leading-relaxed">{eq.descriptionLong}</p>
            </div>

            {/* Price display & secure checkout prompt */}
            <div className="p-6 bg-brand-gold-light/20 border border-brand-beige rounded-xl flex items-center justify-between gap-6">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-brand-brown-600 block">Preço de aquisição</span>
                <span className="font-serif text-2.5xl font-bold text-brand-brown-950 font-mono block mt-0.5">R$ {eq.price.toFixed(2)}</span>
                <span className="text-[9px] text-brand-brown-650 font-light block mt-1">Disponibilidade: Pronta Entrega</span>
              </div>

              <button
                onClick={handleComprarAgora}
                className="py-3.5 px-6 rounded-xl bg-brand-brown-850 hover:bg-brand-brown-700 text-brand-cream-light font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                id="eq-comprar-agora-btn"
              >
                <ShoppingCart className="w-4 h-4" />
                Comprar agora
              </button>
            </div>

            {/* Specifications Details List */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-brand-brown-950 uppercase tracking-wider font-sans">Especificações Técnicas</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-light">
                {eq.specs.map((item, i) => (
                  <div key={i} className="flex gap-2 items-center p-2.5 bg-brand-cream-deep/40 rounded-lg border border-brand-beige/25">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span className="text-brand-brown-850 leading-none">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Utility Details Section B */}
        <section className="py-16 grid grid-cols-1 md:grid-cols-2 gap-12" id="eq-utility-guide">
          
          {/* Section 1: What is it for (Para que serve) */}
          <div className="space-y-4 bg-brand-cream-deep/40 p-8 rounded-2xl border border-brand-beige/50">
            <span className="w-10 h-10 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold shrink-0 mb-2">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-brand-brown-950 flex items-center gap-1.5">
                Para que serve este utensílio?
              </h3>
              <p className="text-xs font-light text-brand-brown-750 leading-relaxed">
                {eq.objective}
              </p>
            </div>
          </div>

          {/* Section 2: How to prepare/use (Como usar) */}
          <div className="space-y-4 bg-brand-cream-deep/40 p-8 rounded-2xl border border-brand-beige/50">
            <span className="w-10 h-10 rounded-full bg-brand-green-600/10 flex items-center justify-center text-brand-green-700 shrink-0 mb-2">
              <BookOpen className="w-5 h-5" />
            </span>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-brand-brown-950 flex items-center gap-1.5">
                Como usar de forma correta?
              </h3>
              <p className="text-xs font-light text-brand-brown-750 leading-relaxed">
                {eq.howToUse}
              </p>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
