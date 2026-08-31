import React, { useState, useMemo } from 'react';
import { useCoffeesData } from '../lib/apiCatalog';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Star } from 'lucide-react';

interface TraditionalPageProps {
  onPageChange: (page: string, extra?: any) => void;
}

export default function TraditionalPage({ onPageChange }: TraditionalPageProps) {
  const coffees = useCoffeesData();

  // Extract all coffees categorized as traditional
  const traditionalCoffees = useMemo(() => {
    return coffees.filter(c => c.category === 'tradicional');
  }, [coffees]);

  // Filter States - Temp states for User manipulation
  const [tempRegion, setTempRegion] = useState('Todas');
  const [tempSafra, setTempSafra] = useState('Todas');
  const [tempMaxPrice, setTempMaxPrice] = useState(35);

  // Filter States - Applied states for active filtration
  const [appliedRegion, setAppliedRegion] = useState('Todas');
  const [appliedSafra, setAppliedSafra] = useState('Todas');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(35);

  const [sortBy, setSortBy] = useState('padrao'); // padrao, menor-preco, maior-preco

  // Extract unique regions dynamically
  const regions = useMemo(() => {
    return ['Todas', ...Array.from(new Set(traditionalCoffees.map(c => c.localizacao)))];
  }, [traditionalCoffees]);

  // Extract unique safras dynamically
  const safras = useMemo(() => {
    return ['Todas', ...Array.from(new Set(traditionalCoffees.map(c => c.safra)))];
  }, [traditionalCoffees]);

  // Apply filters
  const filteredCoffees = useMemo(() => {
    let result = [...traditionalCoffees];

    if (appliedRegion !== 'Todas') {
      result = result.filter(c => c.localizacao === appliedRegion);
    }

    if (appliedSafra !== 'Todas') {
      result = result.filter(c => c.safra === appliedSafra);
    }

    result = result.filter(c => c.priceBase <= appliedMaxPrice);

    // Sorting
    if (sortBy === 'menor-preco') {
      result.sort((a, b) => a.priceBase - b.priceBase);
    } else if (sortBy === 'maior-preco') {
      result.sort((a, b) => b.priceBase - a.priceBase);
    }

    return result;
  }, [traditionalCoffees, appliedRegion, appliedSafra, appliedMaxPrice, sortBy]);

  const handleApplyFilters = () => {
    setAppliedRegion(tempRegion);
    setAppliedSafra(tempSafra);
    setAppliedMaxPrice(tempMaxPrice);
  };

  const handleClearFilters = () => {
    setTempRegion('Todas');
    setTempSafra('Todas');
    setTempMaxPrice(35);

    setAppliedRegion('Todas');
    setAppliedSafra('Todas');
    setAppliedMaxPrice(35);
    setSortBy('padrao');
  };

  return (
    <div className="bg-brand-cream-light min-h-screen py-16 animate-fade-in" id="traditional-coffees-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Intro */}
        <div className="max-w-full mb-12">
          <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono block mb-5">
            Alta performance no cotidiano: o clássico bem escolhido.
          </span>
          <h1 className="font-serif text-3.5xl sm:text-4.5xl font-bold text-brand-brown-950 tracking-tight leading-tight mb-4">
            Cafés tradicionais selecionados
          </h1>
          <div className="text-sm sm:text-base font-light text-brand-brown-750 leading-relaxed space-y-1.5 text-justify">
            <p>
              Cafés tradicionais com sabor familiar, pensados para a rotina, mas selecionados com mais cuidado para entregar uma bebida equilibrada, agradável e com sabor de café de verdade.
            </p>
            <p>
              Uma alternativa superior aos cafés tradicionais mais comuns encontrados nas prateleiras, com grãos melhor selecionados e sem perder a simplicidade do café brasileiro passado em casa.
            </p>
          </div>
        </div>

        {/* Filters and Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LFT: Filter Sidebar */}
          <div className="bg-brand-cream-deep/60 border border-brand-beige rounded-xl p-6 lg:sticky lg:top-24 h-fit space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-brand-beige/50">
              <span className="flex items-center gap-2 font-serif text-sm font-bold text-brand-brown-950">
                <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
                Filtros de Seleção
              </span>
              <button 
                onClick={handleClearFilters}
                className="text-[10px] text-brand-amber-500 hover:text-brand-brown-950 hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Limpar
              </button>
            </div>

            {/* Region Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Região do Produto</label>
              <select
                value={tempRegion}
                onChange={(e) => setTempRegion(e.target.value)}
                className="w-full bg-white text-xs border border-brand-beige px-3 py-2 rounded-lg text-brand-brown-900 focus:outline-hidden"
              >
                {regions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Safra Field Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Safra (ano)</label>
              <select
                value={tempSafra}
                onChange={(e) => setTempSafra(e.target.value)}
                className="w-full bg-white text-xs border border-brand-beige px-3 py-2 rounded-lg text-brand-brown-900 focus:outline-hidden"
              >
                {safras.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Price Filter Slider */}
            <div className="space-y-2 pb-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-brand-brown-700 uppercase">
                <span>Preço Máximo (250g)</span>
                <span className="font-mono text-brand-brown-950 text-xs">R$ {tempMaxPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="20"
                max="35"
                step="0.5"
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(parseFloat(e.target.value))}
                className="w-full accent-brand-gold bg-brand-cream-light h-1"
              />
              <div className="flex justify-between text-[9px] text-brand-brown-500 font-light font-mono pr-1">
                <span>R$ 20.00</span>
                <span>R$ 35.00</span>
              </div>
            </div>

            {/* Apply filters Button */}
            <button
              onClick={handleApplyFilters}
              className="w-full py-2.5 rounded-lg bg-brand-brown-900 hover:bg-brand-brown-800 text-[#FFFDF9] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
              id="apply-filters-btn"
            >
              Aplicar Filtros
            </button>
          </div>

          {/* RGT: Interactive Product Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sorting top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-brand-cream-deep/40 rounded-xl border border-brand-beige/50">
              <span className="text-xs text-brand-brown-750 font-light">
                Mostrando <strong className="font-semibold text-brand-brown-950">{filteredCoffees.length}</strong> café(s) tradicional(is) de alta qualidade.
              </span>
              
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <ArrowUpDown className="w-3.5 h-3.5 text-brand-brown-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs text-brand-brown-850 font-semibold border-none focus:ring-0 cursor-pointer focus:outline-hidden"
                >
                  <option value="padrao">Organização Padrão</option>
                  <option value="menor-preco">Preço: Menor para Maior</option>
                  <option value="maior-preco">Preço: Maior para Menor</option>
                </select>
              </div>
            </div>

            {/* Grid rendering list */}
            {filteredCoffees.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-brand-beige/60 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <p className="font-serif text-lg font-bold text-brand-brown-900">Nenhum café corresponde aos filtros</p>
                <p className="text-xs text-brand-brown-600/70 max-w-sm font-light leading-relaxed">
                  Tente reajustar seus seletores na barra lateral ou clique em "limpar filtros" para restaurar a lista.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2 rounded-lg bg-brand-brown-850 hover:bg-brand-brown-750 text-brand-cream-light text-xs font-semibold"
                >
                  Restaurar Todos
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCoffees.map((cafe) => (
                  <div 
                    key={cafe.id}
                    className="bg-brand-cream-light rounded-xl border border-brand-beige/50 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo */}
                      <div className="h-44 relative overflow-hidden bg-brand-cream-deep">
                        <img 
                          src={cafe.image} 
                          alt={cafe.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                      </div>

                      {/* Info detail */}
                      <div className="p-5 space-y-3">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-brand-gold uppercase tracking-widest">{cafe.localizacao}</p>
                          <h3 className="font-serif text-sm font-bold text-brand-brown-950 group-hover:text-brand-amber-500 transition-colors line-clamp-1">{cafe.name}</h3>
                          <p className="text-xs font-light text-brand-brown-750 leading-relaxed line-clamp-2">{cafe.description}</p>
                        </div>

                        {/* Producer & origin bullet tags */}
                        <div className="pt-2 text-[10px] text-brand-brown-700 font-light space-y-1 bg-brand-cream-deep/30 p-2.5 rounded-lg border border-brand-beige/20">
                          <div className="flex justify-between">
                            <strong>Produtor:</strong>
                            <span className="truncate">{cafe.produtor}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong>Fazenda:</strong>
                            <span className="truncate">{cafe.fazenda}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong>Safra:</strong>
                            <span className="truncate">{cafe.safra}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Buy bar - Button permanently visible, named "Compre já" */}
                    <div className="px-5 pb-5 pt-3 border-t border-brand-beige/35 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-brand-brown-600 font-light uppercase tracking-wider">A partir de</span>
                        <span className="text-sm font-bold font-mono text-brand-brown-950">R$ {cafe.priceBase.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => onPageChange('cafe', { id: cafe.id })}
                        className="py-1.5 px-3.5 rounded-lg bg-brand-gold text-brand-brown-950 hover:bg-brand-brown-900 hover:text-brand-cream-light text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer block opacity-100 shadow-xs"
                        id={`compre-ja-trad-${cafe.id}`}
                      >
                        Compre já
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
