import React, { useState } from 'react';
import { Kit } from '../data/kits';
import { useKitsData } from '../lib/apiCatalog';
import { Sparkles, Check, ShoppingBag, Eye, X, ArrowRight } from 'lucide-react';

interface KitsPageProps {
  onPageChange: (page: string, extra?: any) => void;
  onAddToCartAndCheckout: (item: any) => void;
  onOpenCart: () => void;
}

export default function KitsPage({ onPageChange, onAddToCartAndCheckout, onOpenCart }: KitsPageProps) {
  const kits = useKitsData();
  const [selectedKitForModal, setSelectedKitForModal] = useState<Kit | null>(null);
  const [successAddId, setSuccessAddId] = useState<number | null>(null);

  const handleAddToCart = (kit: Kit) => {
    const cartItem = {
      productType: 'equipamento',
      quantity: 1,
      priceUnit: kit.price,
      equipamentoDetails: {
        id: kit.id,
        productId: kit.productId,
        name: kit.name,
        image: kit.image
      }
    };
    onAddToCartAndCheckout(cartItem);
    
    // Smooth adding feedback
    setSuccessAddId(kit.id);
    setTimeout(() => {
      setSuccessAddId(null);
      onOpenCart(); // Automatically open cart drawer to show customer the kit resides inside
    }, 1000);
  };

  return (
    <div className="bg-brand-cream-light min-h-screen py-16 animate-fade-in" id="kits-experience-root">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Introduction */}
        <div className="max-w-full mb-12">
          <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono block mb-5">
            Curadorias Sensoriais Completas
          </span>
          <h1 className="font-serif text-3.5xl sm:text-4.5xl font-bold text-brand-brown-950 tracking-tight leading-tight mb-4">
            Kits de Experiência
          </h1>
          <div className="text-sm sm:text-base font-light text-brand-brown-750 leading-relaxed space-y-1.5 text-justify">
            <p>
              Criados para os verdadeiros apaixonados e curiosos do universo cafeeiro. Nossos Kits de Experiência reúnem cafés espetaculares de origens selecionadas, chocolates finos para harmonizações provocativas, ferramentas de barismo profissional e manuais didáticos ilustrados. Escolha sua jornada e transforme cada xícara em um ritual de pura transcendência.
            </p>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {kits.map((kit) => {
            const isAdded = successAddId === kit.id;
            return (
              <div 
                key={kit.id}
                className="bg-brand-cream-light rounded-xl border border-brand-beige/50 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                id={`kit-card-${kit.id}`}
              >
                <div>
                  {/* Photo with Badge */}
                  <div className="h-56 relative overflow-hidden bg-brand-cream-deep">
                    <img 
                      src={kit.image} 
                      alt={kit.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-[#1C0F0B] text-[#C7A15A] text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-xs border border-[#C7A15A]/25">
                      Edição Limitada de Curadoria
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg font-bold text-brand-brown-950 group-hover:text-brand-amber-500 transition-colors leading-snug line-clamp-1">{kit.name}</h3>
                      <p className="text-xs font-light text-brand-brown-750 leading-relaxed line-clamp-3">{kit.description}</p>
                    </div>

                    {/* Miniature lists highlights */}
                    <div className="space-y-2 pt-2 border-t border-brand-beige/30">
                      <p className="text-[10px] font-bold text-brand-brown-600 uppercase tracking-wider">Itens inclusos:</p>
                      <ul className="space-y-1 text-xs font-light text-brand-brown-750">
                        {kit.itemsIncluded.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 truncate">
                            <Check className="w-3.5 h-3.5 text-[#C7A15A] shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                        {kit.itemsIncluded.length > 3 && (
                          <li className="text-[10px] text-brand-gold font-medium pl-5 italic">
                            + {kit.itemsIncluded.length - 3} item complementar listado no guia
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Bottom Order Panel */}
                <div className="px-6 pb-6 pt-4 border-t border-brand-beige/35 flex flex-col gap-3">
                  <div className="flex justify-between items-baseline">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-brand-brown-600 font-light uppercase tracking-wider">Preço do Kit Completo</span>
                      <span className="text-xl font-bold font-mono text-brand-brown-950">R$ {kit.price.toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">Faturamento Imediato</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => setSelectedKitForModal(kit)}
                      className="py-2.5 rounded-lg border border-brand-beige text-brand-brown-850 hover:bg-brand-cream-deep text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      id={`saiba-mais-kit-${kit.id}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Detalhes
                    </button>
                    <button
                      onClick={() => handleAddToCart(kit)}
                      disabled={isAdded}
                      className={`py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isAdded 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-[#1C0F0B] hover:bg-[#1C0F0B]/90 text-white'
                      }`}
                      id={`comprar-kit-${kit.id}`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {isAdded ? 'No Carrinho!' : 'Comprar'}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Informational banner */}
        <div className="mt-16 bg-[#1C0F0B] rounded-2xl p-8 sm:p-12 text-white border border-[#C7A15A]/15 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-3">
            <span className="text-[10px] font-bold text-[#C7A15A] uppercase tracking-widest font-mono">Presenteie com Experiência</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">Deseja enviar um Kit como um belo presente?</h2>
            <p className="text-xs sm:text-sm font-light text-[#E9DECF]/80 leading-relaxed max-w-2xl">
              Nossos kits são embalados em caixas cartonadas elegantes de altíssimo acabamento sensorial, livres de preços expostos nas etiquetas físicas. Durante a finalização do seu pedido no checkout, marque a opção de presente para enviar um cartão com mensagem personalizada escrita à mão!
            </p>
          </div>
          <div className="flex justify-start lg:justify-end">
            <button 
              onClick={() => {
                const element = document.getElementById('logo-button');
                if (element) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="py-3 px-6 rounded-lg bg-[#C7A15A] hover:bg-[#C7A15A]/90 text-[#1C0F0B] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Escolher para Presente
            </button>
          </div>
        </div>

      </div>

      {/* Detail Modal Component */}
      {selectedKitForModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedKitForModal(null)} />
          
          <div className="bg-white border border-brand-beige p-6 sm:p-8 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative z-10 text-left space-y-6 shadow-2xl animate-fade-in" id="kit-modal-container">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-brand-beige/50 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#C7A15A] uppercase tracking-widest font-mono">Curadoria Grão & Origem</span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-brown-950 leading-tight">{selectedKitForModal.name}</h2>
              </div>
              <button
                onClick={() => setSelectedKitForModal(null)}
                className="p-1 px-2 rounded-md hover:bg-brand-cream-deep/65 text-brand-brown-700 hover:text-brand-brown-950 transition-colors"
                id="close-kit-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Grid (Left Column Photo / Right Column Data) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Photo */}
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-brand-beige aspect-square">
                  <img 
                    src={selectedKitForModal.image} 
                    alt={selectedKitForModal.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-brand-cream-deep/40 p-4 rounded-xl space-y-1 border border-brand-beige/30">
                  <strong className="text-[10px] font-bold text-brand-brown-850 uppercase tracking-wider block">Estética de Envio:</strong>
                  <p className="text-xs text-brand-brown-700 font-light leading-relaxed">
                    Acondicionado em caixas ecológicas robustas com palha protetora, papel seda perfumado e lacre de cera oficial. Perfeito para presente.
                  </p>
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-brand-brown-855 uppercase tracking-wider">Descrição Detalhada:</h4>
                  <p className="text-xs font-light text-brand-brown-750 leading-relaxed text-justify">{selectedKitForModal.descriptionLong}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-brand-brown-855 uppercase tracking-wider">Propósito Sensorial:</h4>
                  <p className="text-xs font-light text-brand-brown-750 leading-relaxed text-justify">{selectedKitForModal.objective}</p>
                </div>

                <div className="space-y-2 bg-[#FCFAF7] p-4 rounded-xl border border-brand-beige/40">
                  <h4 className="text-xs font-bold text-[#C7A15A] uppercase tracking-wider">Incluso na Caixa:</h4>
                  <ul className="space-y-1.5 text-xs font-light text-brand-brown-750 pt-1">
                    {selectedKitForModal.itemsIncluded.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-brand-brown-855 uppercase tracking-wider">Sugestão de Preparo e Consumo:</h4>
                  <p className="text-xs font-light text-brand-brown-755 leading-relaxed text-justify">{selectedKitForModal.howToUse}</p>
                </div>
              </div>

            </div>

            {/* Modal Bottom Buy Bar */}
            <div className="pt-5 border-t border-brand-beige/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-[10px] text-brand-brown-600 font-light uppercase tracking-wider">Preço Exclusivo da Edição</span>
                <span className="text-2xl font-bold font-mono text-brand-brown-950">R$ {selectedKitForModal.price.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedKitForModal(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-brand-beige hover:bg-brand-cream-deep/50 text-brand-brown-750 font-semibold text-xs uppercase"
                >
                  Voltar à Lista
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedKitForModal);
                    setSelectedKitForModal(null);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#1C0F0B] hover:bg-[#1C0F0B]/90 text-[#FFFDF9] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Garantir Meu Kit
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
