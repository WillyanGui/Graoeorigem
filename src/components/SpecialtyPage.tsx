import React, { useState, useMemo } from 'react';
import { useCoffeesData } from '../lib/apiCatalog';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Award, Sparkles } from 'lucide-react';

interface SpecialtyPageProps {
  onPageChange: (page: string, extra?: any) => void;
}

export default function SpecialtyPage({ onPageChange }: SpecialtyPageProps) {
  const coffees = useCoffeesData();

  // Extract all specialty coffees (category: especial)
  const specialtyCoffees = useMemo(() => {
    return coffees.filter(c => c.category === 'especial');
  }, [coffees]);

  // Filter States - Temp states for User manipulation
  const [tempNoteOlfactory, setTempNoteOlfactory] = useState('Todas');
  const [tempNoteGustatory, setTempNoteGustatory] = useState('Todas');
  const [tempRegion, setTempRegion] = useState('Todas');
  const [tempSafra, setTempSafra] = useState('Todas');
  const [tempScaScore, setTempScaScore] = useState('Todas');
  const [tempProcess, setTempProcess] = useState('Todos');
  const [tempMaxPrice, setTempMaxPrice] = useState(55);

  // Filter States - Applied states for active filtration
  const [appliedNoteOlfactory, setAppliedNoteOlfactory] = useState('Todas');
  const [appliedNoteGustatory, setAppliedNoteGustatory] = useState('Todas');
  const [appliedRegion, setAppliedRegion] = useState('Todas');
  const [appliedSafra, setAppliedSafra] = useState('Todas');
  const [appliedScaScore, setAppliedScaScore] = useState('Todas');
  const [appliedProcess, setAppliedProcess] = useState('Todos');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(55);

  const [sortBy, setSortBy] = useState('padrao');

  // Specific aesthetic & gourmet options
  const olfactoryNotesOptions = [
    'Todas',
    'Frutas Vermelhas / Morango',
    'Cítricos / Laranja / Tangerina',
    'Florais / Jasmim / Flor de Laranjeira',
    'Especiarias / Erva-doce',
    'Chocolate / Cacau',
    'Uvas / Jabuticaba'
  ];

  const gustatoryNotesOptions = [
    'Todas',
    'Frutas / Morango / Damasco / Pêssego',
    'Acidez Cítrica / Tangerina / Limão',
    'Doçura de Mel / Cana de Açúcar',
    'Chocolate / Cacau / Trufado',
    'Florais / Hibisco',
    'Nozes / Castanhas / Pecã',
    'Notas de Vinho'
  ];

  const regions = useMemo(() => {
    return ['Todas', ...Array.from(new Set(specialtyCoffees.map(c => c.localizacao)))];
  }, [specialtyCoffees]);

  const safras = useMemo(() => {
    return ['Todas', ...Array.from(new Set(specialtyCoffees.map(c => c.safra)))];
  }, [specialtyCoffees]);

  const processes = useMemo(() => {
    return ['Todos', ...Array.from(new Set(specialtyCoffees.map(c => c.processo)))];
  }, [specialtyCoffees]);

  // Apply filters
  const filteredCoffees = useMemo(() => {
    let result = [...specialtyCoffees];

    // Olfactory Option Matching
    if (appliedNoteOlfactory !== 'Todas') {
      if (appliedNoteOlfactory === 'Frutas Vermelhas / Morango') {
        result = result.filter(c => c.aroma.toLowerCase().includes('morango') || c.aroma.toLowerCase().includes('fruta') || c.aroma.toLowerCase().includes('pêssego'));
      } else if (appliedNoteOlfactory === 'Cítricos / Laranja / Tangerina') {
        result = result.filter(c => c.aroma.toLowerCase().includes('laranja') || c.aroma.toLowerCase().includes('tangerina') || c.aroma.toLowerCase().includes('raspas'));
      } else if (appliedNoteOlfactory === 'Florais / Jasmim / Flor de Laranjeira') {
        result = result.filter(c => c.aroma.toLowerCase().includes('jasmim') || c.aroma.toLowerCase().includes('flor') || c.aroma.toLowerCase().includes('néctar'));
      } else if (appliedNoteOlfactory === 'Especiarias / Erva-doce') {
        result = result.filter(c => c.aroma.toLowerCase().includes('erva') || c.aroma.toLowerCase().includes('especiar') || c.aroma.toLowerCase().includes('cravo') || c.aroma.toLowerCase().includes('canela'));
      } else if (appliedNoteOlfactory === 'Chocolate / Cacau') {
        result = result.filter(c => c.aroma.toLowerCase().includes('chocolate') || c.aroma.toLowerCase().includes('cacau') || c.aroma.toLowerCase().includes('trufado'));
      } else if (appliedNoteOlfactory === 'Uvas / Jabuticaba') {
        result = result.filter(c => c.aroma.toLowerCase().includes('uva') || c.aroma.toLowerCase().includes('jabuticaba'));
      }
    }

    // Gustatory Option Matching
    if (appliedNoteGustatory !== 'Todas') {
      if (appliedNoteGustatory === 'Frutas / Morango / Damasco / Pêssego') {
        result = result.filter(c => c.sabor.toLowerCase().includes('morango') || c.sabor.toLowerCase().includes('damasco') || c.sabor.toLowerCase().includes('pêssego') || c.sabor.toLowerCase().includes('fruta'));
      } else if (appliedNoteGustatory === 'Acidez Cítrica / Tangerina / Limão') {
        result = result.filter(c => c.sabor.toLowerCase().includes('tangerina') || c.sabor.toLowerCase().includes('limão') || c.sabor.toLowerCase().includes('cítric'));
      } else if (appliedNoteGustatory === 'Doçura de Mel / Cana de Açúcar') {
        result = result.filter(c => c.sabor.toLowerCase().includes('mel') || c.sabor.toLowerCase().includes('cana') || c.sabor.toLowerCase().includes('açúcar') || c.sabor.toLowerCase().includes('melaço'));
      } else if (appliedNoteGustatory === 'Chocolate / Cacau / Trufado') {
        result = result.filter(c => c.sabor.toLowerCase().includes('chocolate') || c.sabor.toLowerCase().includes('cacau') || c.sabor.toLowerCase().includes('trufado') || c.sabor.toLowerCase().includes('fondue'));
      } else if (appliedNoteGustatory === 'Florais / Hibisco') {
        result = result.filter(c => c.sabor.toLowerCase().includes('hibisco') || c.sabor.toLowerCase().includes('flor'));
      } else if (appliedNoteGustatory === 'Nozes / Castanhas / Pecã') {
        result = result.filter(c => c.sabor.toLowerCase().includes('noz') || c.sabor.toLowerCase().includes('castanha') || c.sabor.toLowerCase().includes('pecã') || c.sabor.toLowerCase().includes('macadâmia') || c.sabor.toLowerCase().includes('avelã'));
      } else if (appliedNoteGustatory === 'Notas de Vinho') {
        result = result.filter(c => c.sabor.toLowerCase().includes('vinho') || c.sabor.toLowerCase().includes('ferment'));
      }
    }

    if (appliedRegion !== 'Todas') {
      result = result.filter(c => c.localizacao === appliedRegion);
    }

    if (appliedSafra !== 'Todas') {
      result = result.filter(c => c.safra === appliedSafra);
    }

    if (appliedProcess !== 'Todos') {
      result = result.filter(c => c.processo === appliedProcess);
    }

    if (appliedScaScore !== 'Todas') {
      const minScore = parseFloat(appliedScaScore);
      result = result.filter(c => c.pontuacao && c.pontuacao >= minScore);
    }

    result = result.filter(c => c.priceBase <= appliedMaxPrice);

    // Sorting
    if (sortBy === 'menor-preco') {
      result.sort((a, b) => a.priceBase - b.priceBase);
    } else if (sortBy === 'maior-preco') {
      result.sort((a, b) => b.priceBase - a.priceBase);
    } else if (sortBy === 'pontuacao') {
      result.sort((a, b) => (b.pontuacao || 0) - (a.pontuacao || 0));
    }

    return result;
  }, [specialtyCoffees, appliedNoteOlfactory, appliedNoteGustatory, appliedRegion, appliedSafra, appliedProcess, appliedScaScore, appliedMaxPrice, sortBy]);

  const handleApplyFilters = () => {
    setAppliedNoteOlfactory(tempNoteOlfactory);
    setAppliedNoteGustatory(tempNoteGustatory);
    setAppliedRegion(tempRegion);
    setAppliedSafra(tempSafra);
    setAppliedScaScore(tempScaScore);
    setAppliedProcess(tempProcess);
    setAppliedMaxPrice(tempMaxPrice);
  };

  const handleClearFilters = () => {
    setTempNoteOlfactory('Todas');
    setTempNoteGustatory('Todas');
    setTempRegion('Todas');
    setTempSafra('Todas');
    setTempScaScore('Todas');
    setTempProcess('Todos');
    setTempMaxPrice(55);

    setAppliedNoteOlfactory('Todas');
    setAppliedNoteGustatory('Todas');
    setAppliedRegion('Todas');
    setAppliedSafra('Todas');
    setAppliedScaScore('Todas');
    setAppliedProcess('Todos');
    setAppliedMaxPrice(55);
    setSortBy('padrao');
  };

  return (
    <div className="bg-brand-cream-light min-h-screen py-16 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Intro */}
        <div className="max-w-full mb-12">
          <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono block mb-5">
            Uma camada a mais de aroma, sabor e origem.
          </span>
          <h1 className="font-serif text-3.5xl sm:text-4.5xl font-bold text-brand-brown-950 tracking-tight leading-tight mb-4">
            Cafés Especiais
          </h1>
          <div className="text-sm sm:text-base font-light text-brand-brown-750 leading-relaxed space-y-1.5 text-justify">
            <p>
              Os cafés especiais da Grão & Origem são para quem já aprecia o café do dia a dia, mas deseja descobrir novas experiências na xícara.
            </p>
            <p>
              Diferente dos cafés tradicionais, que entregam um sabor familiar, equilibrado e constante para a rotina, os cafés especiais revelam características mais marcantes do grão, da região, da safra e do produtor.
            </p>
            <p>
              São cafés com maior expressão sensorial, podendo apresentar notas mais evidentes, doçura natural, acidez equilibrada e aromas que tornam cada xícara uma descoberta.
            </p>
          </div>
        </div>

        {/* Filters and Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LFT: Filter Sidebar - Styled exactly like traditional page filters */}
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
              <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Região Produtora</label>
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

            {/* Price Filter Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-brand-brown-700 uppercase">
                <span>Preço Máximo (250g)</span>
                <span className="font-mono text-brand-brown-950 text-xs">R$ {tempMaxPrice.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="35"
                max="55"
                step="1"
                value={tempMaxPrice}
                onChange={(e) => setTempMaxPrice(parseFloat(e.target.value))}
                className="w-full accent-brand-gold bg-brand-cream-light h-1"
              />
              <div className="flex justify-between text-[9px] text-brand-brown-500 font-light font-mono pr-1">
                <span>R$ 35.00</span>
                <span>R$ 55.00</span>
              </div>
            </div>

            {/* Safra (ano) Filter */}
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

            {/* Pontuação Filter */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Pontuação (SCA)</label>
              <select
                value={tempScaScore}
                onChange={(e) => setTempScaScore(e.target.value)}
                className="w-full bg-white text-xs border border-brand-beige px-3 py-2 rounded-lg text-brand-brown-900 focus:outline-hidden"
              >
                <option value="Todas">Todas as notas SCA</option>
                <option value="85">+85 Pontos SCA</option>
                <option value="86">+86 Pontos SCA</option>
                <option value="87">+87 Pontos SCA</option>
                <option value="88">+88 Pontos SCA</option>
              </select>
            </div>

            {/* Notas Olfativas */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Notas Olfativas</label>
              <select
                value={tempNoteOlfactory}
                onChange={(e) => setTempNoteOlfactory(e.target.value)}
                className="w-full bg-white text-xs border border-brand-beige px-3 py-2 rounded-lg text-brand-brown-900 focus:outline-hidden"
              >
                {olfactoryNotesOptions.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Notas Gustativas */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Notas Gustativas</label>
              <select
                value={tempNoteGustatory}
                onChange={(e) => setTempNoteGustatory(e.target.value)}
                className="w-full bg-white text-xs border border-brand-beige px-3 py-2 rounded-lg text-brand-brown-900 focus:outline-hidden"
              >
                {gustatoryNotesOptions.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Método de Secagem */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-brand-brown-700 uppercase">Método de Secagem</label>
              <select
                value={tempProcess}
                onChange={(e) => setTempProcess(e.target.value)}
                className="w-full bg-white text-xs border border-brand-beige px-3 py-2 rounded-lg text-brand-brown-900 focus:outline-hidden"
              >
                {processes.map(p => (
                  <option key={p} value={p}>{p === 'Todos' ? 'Todos os métodos' : p}</option>
                ))}
              </select>
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

          {/* RGT: Product Grid */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sorting bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-brand-cream-deep/40 rounded-xl border border-brand-beige/50">
              <span className="text-xs text-brand-brown-750 font-light">
                Descobrimos <strong className="font-semibold text-brand-brown-950">{filteredCoffees.length}</strong> microlote(s) sensorial(is) especial(is) para o seu paladar.
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
                  <option value="pontuacao">Pontuação da Avaliação (SCA)</option>
                </select>
              </div>
            </div>

            {/* Specialty grid layout */}
            {filteredCoffees.length === 0 ? (
              <div className="py-24 text-center border-2 border-dashed border-brand-beige/60 rounded-2xl flex flex-col items-center justify-center space-y-3">
                <Award className="w-10 h-10 text-brand-gold/60 mx-auto" />
                <p className="font-serif text-lg font-bold text-brand-brown-900">Nenhum microlote de exceção encontrado</p>
                <p className="text-xs text-brand-brown-600/70 max-w-sm font-light leading-relaxed">
                  Não temos cafés com esse filtro exato na safra atual. Tente redefinir a pontuação técnica ou notas requisitadas na barra lateral.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2 rounded-lg bg-brand-brown-850 hover:bg-brand-brown-750 text-brand-cream-light text-xs font-semibold"
                >
                  Limpar Todos os Filtros
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
                      {/* Image header with score overlay */}
                      <div className="h-44 relative overflow-hidden bg-brand-cream-deep">
                        <img 
                          src={cafe.image} 
                          alt={cafe.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-brand-gold text-brand-brown-950 py-1 px-2.5 rounded-full text-[9px] uppercase tracking-widest font-extrabold shadow-sm">
                          {cafe.pontuacao} Pontos SCA
                        </div>
                      </div>

                      {/* Content descriptions */}
                      <div className="p-5 space-y-3">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-brand-amber-500 uppercase tracking-widest font-mono">{cafe.localizacao}</p>
                          <h3 className="font-serif text-sm font-bold text-brand-brown-950 group-hover:text-brand-amber-500 transition-colors line-clamp-1">{cafe.name}</h3>
                          <p className="text-xs font-light text-brand-brown-750 leading-relaxed line-clamp-2">{cafe.description}</p>
                        </div>

                        {/* Sensory Notes badges */}
                        <div className="flex flex-flow flex-wrap gap-1 pt-1">
                          {cafe.notasMarcantes.map(note => (
                            <span 
                              key={note}
                              className="text-[9px] px-2 py-0.5 rounded-md bg-brand-gold-light/40 border border-brand-gold/15 text-brand-brown-850 font-medium font-sans"
                            >
                              {note}
                            </span>
                          ))}
                        </div>

                        {/* Extended specs table */}
                        <div className="pt-2 text-[10px] text-brand-brown-700 font-light space-y-1 bg-brand-cream-deep/40 p-2.5 rounded-lg border border-brand-beige/25">
                          <div className="flex justify-between">
                            <strong>Fazenda:</strong>
                            <span className="truncate">{cafe.fazenda}</span>
                          </div>
                          <div className="flex justify-between">
                            <strong>Processo:</strong>
                            <span className="truncate">{cafe.processo.split(' (')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer price & trigger */}
                    <div className="px-5 pb-5 pt-3 border-t border-brand-beige/35 flex justify-between items-baseline">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-brand-brown-600 font-light uppercase tracking-wider">A partir de</span>
                        <span className="text-sm font-bold font-mono text-brand-brown-950">R$ {cafe.priceBase.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => onPageChange('cafe', { id: cafe.id })}
                        className="py-1.5 px-3.5 rounded-lg bg-brand-gold text-brand-brown-950 hover:bg-brand-brown-900 hover:text-brand-cream-light text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer block opacity-100 shadow-xs"
                        id={`compre-ja-spec-${cafe.id}`}
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
