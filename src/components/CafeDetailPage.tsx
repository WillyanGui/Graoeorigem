import React, { useState, useMemo } from 'react';
import { Cafe, CartItem } from '../types';
import { useCoffeesData } from '../lib/apiCatalog';
import { 
  Check, ArrowLeft, Heart, Award, ShieldCheck, ShoppingCart, 
  Tv, MessageSquareQuote, Flame, Eye, Sparkles, Scale, Compass 
} from 'lucide-react';

interface CafeDetailPageProps {
  cafeId: number;
  onPageChange: (page: string, extra?: any) => void;
  onAddToCartAndCheckout: (item: Omit<CartItem, 'id' | 'priceTotal'>) => void;
}

export default function CafeDetailPage({ cafeId, onPageChange, onAddToCartAndCheckout }: CafeDetailPageProps) {
  const coffeesData = useCoffeesData();
  // Find coffee details
  const cafe = useMemo(() => {
    return coffeesData.find(c => c.id === cafeId) || coffeesData[0];
  }, [cafeId, coffeesData]);

  // Styling theme check
  const isSpecial = cafe.category === 'especial';

  // Purchase state customization
  const [purchaseType, setPurchaseType] = useState<'Grão' | 'Torrado'>('Grão');
  const [selectedRoast, setSelectedRoast] = useState<'Clara' | 'Média' | 'Escura'>('Média');
  const [selectedWeight, setSelectedWeight] = useState<250 | 500 | 1000>(250);

  // Dynamic price calculation
  const calculatedPrice = useMemo(() => {
    let multiplier = 1;
    if (selectedWeight === 500) {
      multiplier = 1.85; // 15% bulk discount
    } else if (selectedWeight === 1000) {
      multiplier = 3.40; // 30% bulk discount
    }
    
    let base = cafe.priceBase * multiplier;
    // Pre-ground is same price (customer oriented), but grão gets a very subtle organic packaging focus
    return base;
  }, [cafe.priceBase, selectedWeight]);

  // Handle immediate checkout
  const handleFinalizePurchase = () => {
    onAddToCartAndCheckout({
      productType: 'cafe',
      quantity: 1,
      priceUnit: calculatedPrice,
      cafeDetails: {
        id: cafe.id,
        productId: cafe.productId,
        name: cafe.name,
        image: cafe.image,
        weight: selectedWeight,
        type: purchaseType,
        roast: purchaseType === 'Torrado' ? selectedRoast : undefined
      }
    });
  };

  const cropSteps = [
    { title: 'Plantação', desc: 'Sementes selecionadas cultivadas em solos nobres e ricos do Brasil.', img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=400' },
    { title: 'Crescimento', desc: 'Climas perfeitos e monitoramento diário do processo biológico.', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400' },
    { title: 'Colheita/Safra', desc: 'No pico correto da maturação, realizada inteiramente de forma seletiva.', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400' },
    { title: 'Secagem Lenta', desc: 'Terreiros de tijolo e camas suspensas para reter dulçor natural.', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400' },
    { title: 'Torração de Precisão', desc: 'Processos térmicos que extraem compostos aromáticos divinos.', img: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?q=80&w=400' },
    { title: 'Análise de Grãos', desc: 'Dez níveis de catagem eliminando qualquer impureza residual.', img: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=400' },
    { title: 'Embalagem Barreira', desc: 'Válvula de silicone que impede oxigênio de estragar o lote.', img: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400' },
    { title: 'Preparo Supremo', desc: 'Pronto para liberar notas sensoriais inesquecíveis na sua mesa.', img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=400' }
  ];

  return (
    <div className="bg-brand-cream-light min-h-screen py-10 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link button */}
        <button
          onClick={() => onPageChange(isSpecial ? 'especiais' : 'tradicionais')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-brown-800 hover:text-brand-gold uppercase tracking-wider mb-8 cursor-pointer"
          id="cafe-back-button"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Catálogo
        </button>

        {/* 1. Main visual & Purchase details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start pb-16 border-b border-brand-beige/35">
          
          {/* LFT: Coffee Showcase image */}
          <div className="space-y-4">
            <div className="relative border border-brand-beige/50 rounded-2xl overflow-hidden shadow-sm bg-brand-cream-deep/60">
              <img
                src={cafe.image}
                alt={cafe.name}
                className="w-full h-[500px] object-cover"
              />
              
              {/* Overlay badges */}
              <div className="absolute top-4 left-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border shadow-sm ${
                  isSpecial
                    ? 'bg-brand-gold text-brand-brown-950 border-brand-gold/45'
                    : 'bg-brand-brown-800 text-brand-cream-light border-brand-brown-800/20'
                }`}>
                  {isSpecial ? 'Microlote Especial' : 'Tradicional Superior'}
                </span>
              </div>

              {isSpecial && cafe.pontuacao && (
                <div className="absolute bottom-4 right-4 bg-brand-brown-900 border border-brand-gold/35 p-3 rounded-xl flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-gold" />
                  <div className="text-left font-mono">
                    <p className="text-[9px] uppercase tracking-wider text-brand-cream-deep/50 leading-none">Pontuação Técnica</p>
                    <p className="text-sm font-bold text-brand-gold leading-none mt-1">{cafe.pontuacao} Pontos SCA</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick highlight certifications */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-brand-cream-deep/50 rounded-xl border border-brand-beige/30 flex flex-col items-center">
                <ShieldCheck className="w-4 h-4 text-brand-gold mb-1" />
                <span className="text-[10px] font-bold text-brand-brown-900">Curadoria 100%</span>
                <span className="text-[9px] text-brand-brown-600/70 font-light mt-0.5">Rastreável</span>
              </div>
              <div className="p-3 bg-brand-cream-deep/50 rounded-xl border border-brand-beige/30 flex flex-col items-center">
                <Compass className="w-4 h-4 text-brand-gold mb-1" />
                <span className="text-[10px] font-bold text-brand-brown-900">Origem Nobre</span>
                <span className="text-[9px] text-brand-brown-600/70 font-light mt-0.5">{cafe.localizacao.split(',')[0]}</span>
              </div>
              <div className="p-3 bg-brand-cream-deep/50 rounded-xl border border-brand-beige/30 flex flex-col items-center">
                <Scale className="w-4 h-4 text-brand-gold mb-1" />
                <span className="text-[10px] font-bold text-brand-brown-900">Sem Açúcar</span>
                <span className="text-[9px] text-brand-brown-600/70 font-light mt-0.5">Frutos puros</span>
              </div>
            </div>
          </div>

          {/* RGT: purchase selections & summaries */}
          <div className="space-y-6 text-left">
            
            {/* Header info */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-brand-gold uppercase tracking-widest">{cafe.localizacao}</span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-brown-950 tracking-tight">{cafe.name}</h1>
              <p className="text-sm font-light text-brand-brown-850 leading-relaxed">{cafe.descriptionLong}</p>
            </div>

            {/* Micro Specs Sensory Matrix (aroma, sabor, acidez, corpo) */}
            <div className="p-5 bg-brand-cream-deep/50 border border-brand-beige rounded-xl space-y-3.5">
              <h3 className="text-xs font-bold text-brand-brown-950 uppercase tracking-wider font-sans">Análise Técnica do Sommelier</h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-light">
                <div>
                  <span className="font-medium text-brand-brown-900">Aroma:</span>
                  <p className="text-[11px] text-brand-brown-700 leading-snug mt-0.5">{cafe.aroma}</p>
                </div>
                <div>
                  <span className="font-medium text-brand-brown-900">Sabor:</span>
                  <p className="text-[11px] text-brand-brown-700 leading-snug mt-0.5">{cafe.sabor}</p>
                </div>
                <div>
                  <span className="font-medium text-brand-brown-900">Acidez:</span>
                  <p className="text-[11px] text-brand-brown-700 leading-snug mt-0.5">{cafe.acidez}</p>
                </div>
                <div>
                  <span className="font-medium text-brand-brown-900">Corpo:</span>
                  <p className="text-[11px] text-brand-brown-700 leading-snug mt-0.5">{cafe.corpo}</p>
                </div>
              </div>

              {/* Unique markers */}
              <div className="pt-3 border-t border-brand-beige/50 flex flex-flow flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-brand-brown-800 mr-1 uppercase">Notas Principais:</span>
                {cafe.notasMarcantes.map(nm => (
                  <span key={nm} className="text-[9px] px-2.5 py-1 rounded-full bg-brand-gold/15 text-brand-brown-900 font-semibold uppercase">{nm}</span>
                ))}
              </div>
            </div>

            {/* Purchase Form options */}
            <div className="space-y-5 pt-4 border-t border-brand-beige/40">
              
              {/* Option 1: Format Bean vs roasted */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Escolha a Moagem / Tipo</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPurchaseType('Grão')}
                    className={`py-3 rounded-lg border text-xs font-semibold uppercase transition-colors text-center cursor-pointer ${
                      purchaseType === 'Grão'
                        ? 'bg-brand-brown-850 border-brand-brown-850 text-brand-cream-light shadow-2xs'
                        : 'bg-white border-brand-beige text-brand-brown-700 hover:bg-brand-cream-deep'
                    }`}
                  >
                    Café em Grão
                  </button>
                  <button
                    onClick={() => setPurchaseType('Torrado')}
                    className={`py-3 rounded-lg border text-xs font-semibold uppercase transition-colors text-center cursor-pointer ${
                      purchaseType === 'Torrado'
                        ? 'bg-brand-brown-850 border-brand-brown-850 text-brand-cream-light shadow-2xs'
                        : 'bg-white border-brand-beige text-brand-brown-700 hover:bg-brand-cream-deep'
                    }`}
                  >
                    Moído para Preparo
                  </button>
                </div>
              </div>

              {/* Sub option 1.2: Roast Clara Média Escura only if Moído selected */}
              {purchaseType === 'Torrado' && (
                <div className="space-y-2 pt-1 animate-fade-in" id="roast-selector-wrapper">
                  <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Selecione o Grau de Torra desejado</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Clara', 'Média', 'Escura'].map((ro) => (
                      <button
                        key={ro}
                        onClick={() => setSelectedRoast(ro as any)}
                        className={`py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                          selectedRoast === ro
                            ? 'bg-brand-gold/15 border-brand-gold text-brand-brown-900 font-bold'
                            : 'bg-white border-brand-beige text-brand-brown-650 hover:bg-brand-cream-deep'
                        }`}
                      >
                        Torra {ro}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Option 2: Weight selection */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Selecione o Peso (Embalagem)</label>
                  <span className="text-[10px] text-brand-green-700 font-medium font-sans">Compensa mais em embalagens de 1kg!</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 1000].map((w) => {
                    const priceLabel = cafe.priceBase * (w === 250 ? 1 : w === 500 ? 1.85 : 3.40);
                    return (
                      <button
                        key={w}
                        onClick={() => setSelectedWeight(w as any)}
                        className={`p-3.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          selectedWeight === w
                            ? 'bg-brand-brown-850 border-brand-brown-850 text-brand-cream-light scale-102 shadow-2xs'
                            : 'bg-white border-brand-beige text-brand-brown-900 hover:bg-brand-cream-deep'
                        }`}
                      >
                        <span className="text-xs font-bold font-serif">{w >= 1000 ? '1 kg' : `${w}g`}</span>
                        <span className="text-[9px] font-mono opacity-80 mt-1 font-semibold leading-none">R$ {priceLabel.toFixed(2)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Price Display and Finalize Button */}
              <div className="bg-brand-gold-light/40 border border-brand-beige rounded-xl p-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <p className="text-[9px] text-brand-brown-600 font-bold uppercase tracking-widest leading-none">Total Calculado</p>
                  <span className="font-serif text-2xl font-bold text-brand-brown-950 font-mono mt-1 block">R$ {calculatedPrice.toFixed(2)}</span>
                  <p className="text-[9px] text-brand-brown-650 mt-1">Estimado no cartão em até 3x sem acréscimos</p>
                </div>

                <button
                  onClick={handleFinalizePurchase}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-brand-brown-850 hover:bg-brand-brown-700 transition-colors text-brand-cream-light font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  id="cafe-finalize-buy-btn"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Finalizar Compra
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Sommelier Quote Card */}
        <div className="py-12 text-left bg-brand-cream-deep/60 rounded-2xl p-8 border border-brand-beige my-12 flex gap-4 items-start max-w-4xl mx-auto">
          <MessageSquareQuote className="w-12 h-12 text-brand-gold shrink-0 scale-x-[-1]" />
          <div>
            <span className="text-[10px] tracking-wider uppercase font-bold text-brand-amber-500">Comentário Sensorial do Sommelier</span>
            <p className="font-serif text-base italic text-brand-brown-900 font-light leading-relaxed mt-2">
              "{cafe.sommelierComment}"
            </p>
            <p className="text-xs font-semibold text-brand-brown-950 uppercase tracking-wider mt-4">Sommelier de Café da Casa — Grão & Origem</p>
          </div>
        </div>

        {/* Educational Content section "Escolha sua torra" */}
        <section className="py-12 border-b border-brand-beige/25" id="educacional-torra">
          <div className="max-w-4xl mx-auto space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest font-mono">Dica do Especialista</span>
              <h2 className="font-serif text-xl font-bold text-brand-brown-950 tracking-tight flex items-center gap-1.5">
                <Flame className="w-5 h-5 text-brand-amber-500" />
                Como escolher a sua torra ideal?
              </h2>
            </div>
            
            <p className="text-xs leading-relaxed text-brand-brown-750 font-light">
              O grau de torrefação dita a velocidade e temperatura com que os gases nobres e caramelos evaporam do interior dos grãos. Confira os perfis e escolha de acordo com seu paladar:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 bg-amber-50/50 rounded-xl border border-brand-beige/50">
                <h4 className="text-xs font-bold text-brand-brown-900 uppercase">Torra Clara (Light Roast)</h4>
                <p className="text-[11px] text-brand-brown-700/90 font-light mt-1.5 leading-relaxed">
                  Preserva acentuadamente a acidez cítrica ou málica nativa, realçando aromas florais, frutados e delicados. Recomendamos para microlotes especiais extraídos no coador V60.
                </p>
              </div>

              <div className="p-4 bg-brand-gold-light/10 rounded-xl border border-brand-gold/20">
                <h4 className="text-xs font-bold text-brand-brown-900 uppercase">Torra Média (Medium Roast)</h4>
                <p className="text-[11px] text-brand-brown-700/90 font-light mt-1.5 leading-relaxed">
                  Consolida o equilíbrio supremo de sabor. Carameliza de forma primorosa a polpa natural, gerando deliciosas notas de caramelo trufado, chocolate ao leite, avelã e doçura açucarada.
                </p>
              </div>

              <div className="p-4 bg-brand-brown-900/5 rounded-xl border border-brand-beige/50">
                <h4 className="text-xs font-bold text-brand-brown-900 uppercase">Torra Escura (Dark Roast)</h4>
                <p className="text-[11px] text-brand-brown-700/90 font-light mt-1.5 leading-relaxed">
                  Destaca notas encorpadas, intensas e amargas confortáveis. Os óleos essenciais pesados afloram, gerando corpo denso, notas de cacau amargo e baixíssima acidez cítrica.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Farmer Video story area */}
        <section className="py-16 text-center border-b border-brand-beige/25" id="video-rural">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-2">
              <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono uppercase">Vozes da Lavouras</span>
              <h2 className="font-serif text-2.5xl font-bold text-brand-brown-950 tracking-tight">Conheça quem produz este café</h2>
              <p className="text-xs font-light text-brand-brown-750 max-w-xl mx-auto leading-relaxed">
                As mãos, a terra e o coração por trás de cada semente. Reserve um momento para ouvir um breve documentário fictício acolhedor conduzido diretamente na fazenda onde este lote suntuoso foi cultivado.
              </p>
            </div>

            {/* Faux elegant video player block */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md border border-brand-beige bg-brand-brown-900 group">
              <img
                src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=800"
                alt="Farmer video preview"
                className="w-full h-full object-cover opacity-60 scale-102 group-hover:scale-100 transition-transform duration-700"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-brand-brown-950 via-brand-brown-950/40 to-transparent" />

              {/* Visual Play / Info Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-cream-light p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-gold text-brand-brown-950 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-500 cursor-pointer">
                  <Tv className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-brand-cream-light">{cafe.produtor} em sua Lide Diária</h4>
                  <p className="text-[11px] text-brand-cream-deep/70 font-mono tracking-wide mt-1 uppercase">Sítio {cafe.fazenda} • {cafe.localizacao}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Da lavoura à sua xícara Gallery */}
        <section className="py-16" id="galeria-lavoura">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">A jornada biológica do grão</span>
            <h2 className="font-serif text-2.5xl font-bold text-brand-brown-950 tracking-tight">Da lavoura à sua xícara</h2>
            <p className="text-xs text-brand-brown-700 font-light">
              Acompanhe a trilha mágica que cada grão curado percorre das encostas ensolaradas até a infusão perfeita em sua casa.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {cropSteps.map((step, i) => (
              <div 
                key={i}
                className="bg-brand-cream-light border border-brand-beige/40 rounded-xl overflow-hidden shadow-2xs text-left group"
              >
                <div className="h-32 overflow-hidden relative bg-brand-cream-deep">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  <span className="absolute bottom-2 left-2 bg-brand-brown-950 text-brand-gold text-[9px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center leading-none">
                    {i + 1}
                  </span>
                </div>
                <div className="p-3.5 space-y-1">
                  <h4 className="text-xs font-bold text-brand-brown-950">{step.title}</h4>
                  <p className="text-[10px] text-brand-brown-600/80 font-light leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
