import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, HeartHandshake, Map, Sparkles, 
  ChevronRight, Calendar, User, Clock, FileHeart
} from 'lucide-react';
import { Cafe, Equipamento, PlanoAssinatura } from '../types';
import { coffeesData } from '../data/coffees';
import { equipmentsData } from '../data/equipments';
import { blogData } from '../data/blog';

interface HomePageProps {
  onPageChange: (page: string, extra?: any) => void;
}

export default function HomePage({ onPageChange }: HomePageProps) {
  const [heroBgSrc, setHeroBgSrc] = useState('https://lh3.googleusercontent.com/d/14G2NCFRRd7xh-wrLeBJhXj7SqlalmPG4');
  const [traditionalBgSrc, setTraditionalBgSrc] = useState('https://lh3.googleusercontent.com/d/1_gCWTC_MfIMwhzknxAKwDzcngsWn0tTW');

  // Get first 4 products for showcase (2 traditional, 2 special)
  const featuredCoffees = [
    coffeesData[0], // Traditional
    coffeesData[3], // Special
    coffeesData[1], // Traditional
    coffeesData[4]  // Special
  ];

  // Get first 3 equipments for showcase
  const featuredEquipments = equipmentsData.slice(0, 3);

  // Three club plans
  const subscriptionPlans: PlanoAssinatura[] = [
    {
      id: 'plano-basico',
      name: 'Plano Básico',
      tagline: 'Para quem deseja começar',
      description: 'Receba uma seleção mensal de café equilibrado, perfeito para dar sabor e constância ao seu consumo diário.',
      price: 39.90,
      benefits: [
        '1 pacote de café selecionado por mês (250g)',
        'Perfil sensorial equilibrado de fácil paladar',
        'Ficha explicativa técnica simplificada',
        'Desconto de 5% em acessórios do site',
        'Cancelamento imediato sem cobrança de taxas'
      ],
      level: 'basico'
    },
    {
      id: 'plano-essencial',
      name: 'Plano Essencial',
      tagline: 'Nossa melhor recomendação',
      description: 'Explore a variedade. Uma combinação magnífica entre cafés tradicionais superiores e cafés de experiência especial.',
      price: 69.90,
      benefits: [
        '2 pacotes de café selecionados por mês (250g cada)',
        'Combinação rica de tradicionais e especiais',
        'Roteiro explicativo completo de origens e torras',
        'Desconto de 10% em acessórios do site',
        'Frete grátis nacional incluso no plano'
      ],
      level: 'essencial'
    },
    {
      id: 'plano-completo',
      name: 'Experiência Completa',
      tagline: 'Para verdadeiros entendedores',
      description: 'Uma imersão sensorial profunda. Cafés de refino especialíssimo, microlotes raros de colecionador e mimos de baristas.',
      price: 99.90,
      benefits: [
        '3 pacotes de café selecionados por mês (250g cada)',
        'Acesso prioritário a microlotes raros e sazonais',
        'Ficha de avaliação sensorial de sommelier (SCA)',
        'Brinde exclusivo de barista ou amostra no 3º mês',
        'Desconto de 15% em todas as compras do site',
        'Frete grátis prioritário incluso'
      ],
      level: 'completo'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Folder Section */}
      <section className="relative bg-[#1C0F0B] py-24 md:py-32 lg:py-40 overflow-hidden" id="hero-section">
        {/* Ambient Coffee Background image with overlay grádient */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBgSrc} 
            alt="Brazilian Coffee Beans" 
            className="w-full h-full object-cover object-center opacity-45 select-none scale-110 transition-all duration-300"
            onError={() => {
              if (heroBgSrc.includes('lh3')) {
                setHeroBgSrc('https://drive.google.com/uc?export=view&id=14G2NCFRRd7xh-wrLeBJhXj7SqlalmPG4');
              } else if (heroBgSrc.includes('uc')) {
                setHeroBgSrc('https://drive.google.com/thumbnail?id=14G2NCFRRd7xh-wrLeBJhXj7SqlalmPG4&sz=w1000');
              }
            }}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1C0F0B] via-[#1C0F0B]/90 to-[#1C0F0B]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C0F0B] via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Core Titles */}
            <h1 className="font-serif text-3.5xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-cream-light leading-tight">
              Cafés selecionados para transformar cada xícara em uma experiência.
            </h1>
            
            <p className="mt-6 text-base sm:text-lg lg:text-xl text-brand-cream-deep/85 leading-relaxed font-light max-w-2xl">
              Conectamos você a cafés brasileiros escolhidos com cuidado, valorizando produtores, origens e perfis sensoriais para diferentes momentos do seu dia.
            </p>

            {/* CTA Actions buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onPageChange('tradicionais')}
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-brand-gold hover:bg-brand-gold/90 text-brand-brown-950 font-bold text-sm tracking-wide shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                id="hero-traditional-cta"
              >
                Conheça nossos cafés tradicionais
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              
              <button
                onClick={() => onPageChange('especiais')}
                className="inline-flex items-center justify-center px-6 py-4 rounded-xl bg-brand-brown-800 hover:bg-brand-brown-700/80 border border-brand-beige/20 text-brand-cream-light font-medium text-sm tracking-wide transition-all transform hover:-translate-y-0.5 cursor-pointer"
                id="hero-specialty-cta"
              >
                Conheça nossos cafés especiais
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* A) Apresentação da Empresa (Institutional Segment) */}
      <section className="bg-brand-cream-light py-20" id="empresa">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Visual crop */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-48 h-48 bg-brand-gold/20 rounded-xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-brand-green-600/10 rounded-xl -z-10" />
              <img 
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600" 
                alt="Moedor e Xícara com Grãos" 
                className="rounded-2xl shadow-xl w-full h-[450px] object-cover border border-brand-beige/50"
              />
              
              {/* Overlay Quality Badge */}
              <div className="absolute bottom-6 left-6 bg-brand-brown-900 border border-brand-gold/30 text-brand-cream-light p-4 rounded-xl shadow-lg max-w-xs flex gap-3">
                <FileHeart className="w-10 h-10 text-brand-gold shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-brand-gold uppercase tracking-wider">Garantia de Origem</p>
                  <p className="text-[11px] text-brand-cream-deep/80 mt-1">
                    Cada possui um QR Code que apresenta informações sobre a procedência, região, safra, lote e história do seu café.
                  </p>
                </div>
              </div>
            </div>

            {/* Content description */}
            <div className="space-y-6">
              <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest">Nossa Essência</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-brown-950 tracking-tight leading-tight">
                Mais que cafés selecionados, histórias brasileiras que chegam à sua xícara.
              </h2>
              
              <div className="space-y-4 text-sm text-brand-brown-850 font-light leading-relaxed">
                <p>
                  A Grão & Origem nasceu da vontade de aproximar quem aprecia café de quem dedica a vida a produzi-lo. Antes de chegar à xícara, cada café passa por terras, mãos, tempos e histórias que muitas vezes não são vistas pelo consumidor.
                </p>
                <p>
                  Selecionamos cafés brasileiros com procedência, qualidade e propósito, valorizando produtores, regiões, safras e formas de cultivo que dão identidade a cada grão. Cada escolha da nossa curadoria carrega mais do que sabor: carrega território, memória, cuidado e pertencimento.
                </p>
                <p>
                  Para nós, café é plural. Existe o café que acompanha a rotina, o café que reúne pessoas à mesa e o café que convida a uma experiência mais sensorial. Por isso, reunimos opções para diferentes momentos: dos cafés equilibrados e reconfortantes aos lotes especiais que revelam aromas, sabores e histórias únicas.
                </p>
                <p>
                  Acreditamos que café bom não precisa ser complicado. Precisa ter qualidade, origem e respeito por quem produz.
                </p>
                <p>
                  Porque cada xícara começa muito antes do primeiro gole; começa na origem.
                </p>
              </div>


            </div>

          </div>
        </div>
      </section>

      {/* B) Seção “Escolha sua experiência” - Estilo Marrom Escuro Espresso Premium */}
      <section className="bg-[#1C0F0B] py-24 transition-colors text-center" id="experiencia">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold text-[#C7A15A] uppercase tracking-widest font-mono">Sensorial & Momento</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FFFDF9] mt-2 tracking-tight">Escolha o café que combina com o seu momento.</h2>
          <p className="text-sm font-light text-[#E9DECF]/80 max-w-2xl mx-auto mt-4 leading-relaxed">
            Cada rotina pede uma experiência diferente. Por isso, nossa curadoria reúne cafés pensados para diversos paladares, preparos e ocasiões: do café acolhedor do dia a dia às seleções especiais para quem deseja descobrir novos aromas, sabores e origens.
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
            
            {/* Tradicionais */}
            <div className="bg-[#2A1712] rounded-2xl border border-[#C7A15A]/15 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group text-left">
              <div className="h-56 relative overflow-hidden">
                <img 
                  src={traditionalBgSrc} 
                  alt="Café Coado Tradicional" 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  onError={() => {
                    if (traditionalBgSrc.includes('lh3')) {
                      setTraditionalBgSrc('https://drive.google.com/uc?export=view&id=1_gCWTC_MfIMwhzknxAKwDzcngsWn0tTW');
                    } else if (traditionalBgSrc.includes('uc')) {
                      setTraditionalBgSrc('https://drive.google.com/thumbnail?id=1_gCWTC_MfIMwhzknxAKwDzcngsWn0tTW&sz=w1000');
                    }
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif text-xl font-bold text-[#FFFDF9]">Seleção Tradicional</h3>
                  <p className="text-xs font-light text-[#E9DECF]/80 leading-relaxed font-sans">
                    Cafés escolhidos para acompanhar a rotina com qualidade, equilíbrio e sabor. São opções reconfortantes, aromáticas e versáteis, ideais para quem busca um café marcante para o dia a dia, sem abrir mão de procedência e cuidado na seleção.
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => onPageChange('tradicionais')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#C7A15A] hover:text-[#FFFDF9] transition-colors cursor-pointer uppercase tracking-wider"
                    id="choose-path-traditional-btn"
                  >
                    Ver cafés tradicionais
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

            {/* Especiais */}
            <div className="bg-[#2A1712] rounded-2xl border border-[#C7A15A]/15 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col group text-left">
              <div className="h-56 relative overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600" 
                  alt="Espresso e Notas Aromáticas" 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>

              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="font-serif text-xl font-bold text-[#FFFDF9]">Seleção Especial</h3>
                  <p className="text-xs font-light text-[#E9DECF]/80 leading-relaxed font-sans">
                    Cafés de origem selecionados para quem deseja viver uma experiência mais sensorial. São lotes com perfis únicos, aromas mais delicados e sabores que revelam a identidade da região, da safra e do produtor.
                  </p>
                </div>

                <div>
                  <button
                    onClick={() => onPageChange('especiais')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#C7A15A] hover:text-[#FFFDF9] transition-colors cursor-pointer uppercase tracking-wider"
                    id="choose-path-specialty-btn"
                  >
                    Ver cafés especiais
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* E) Seção “Equipamentos para um apreciador de café” - Estilo Branco Quente / Marfim */}
      <section className="bg-brand-cream-light py-24 text-center border-b border-[#6E4B3A]/5" id="equipamentos">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header info */}
          <div className="max-w-2xl mx-auto space-y-4 mb-10">
            <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono">A Extração Perfeita</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-brown-950 tracking-tight">Equipamentos para quem aprecia um bom café</h2>
            <p className="text-sm font-light text-brand-brown-750 leading-relaxed max-w-2xl mx-auto font-sans">
              A experiência também está no preparo. Reunimos acessórios selecionados para valorizar o aroma, o sabor e o ritual de cada xícara.
            </p>
          </div>

          <div>
            <button
              onClick={() => onPageChange('equipamentos')}
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full border border-brand-brown-900 bg-brand-brown-900 hover:bg-brand-brown-800 hover:border-brand-brown-850 text-xs font-bold text-brand-cream-light transition-all cursor-pointer shadow-md transform hover:-translate-y-0.5"
            >
              Conhecer linha completa de equipamentos
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* F) Seção “Clube de Assinatura” - Estilo Marrom Escuro Espresso Premium */}
      <section className="bg-[#1C0F0B] py-24 transition-colors" id="clube">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="space-y-4 mb-10">
            <span className="text-xs font-bold text-[#C7A15A] uppercase tracking-widest font-mono">Assinatura Mensal</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FFFDF9] tracking-tight">
              Todo mês, uma nova origem para descobrir na sua xícara.
            </h2>
            <div className="space-y-4 text-sm font-light text-[#E9DECF]/80 leading-relaxed max-w-2xl mx-auto font-sans">
              <p>
                Receba em casa cafés brasileiros selecionados pela Grão & Origem e descubra novos sabores, regiões, produtores e histórias a cada entrega.
              </p>
              <p>
                Uma assinatura pensada para quem ama café e deseja transformar o hábito diário em uma experiência mais especial, prática e cheia de significado.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => onPageChange('clube')}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-brown-950 bg-brand-gold hover:bg-brand-gold/90 transition-all cursor-pointer px-8 py-3.5 rounded-full shadow-lg transform hover:-translate-y-0.5 font-sans"
              id="goto-clube-btn"
            >
              Conheça o clube de assinatura →
            </button>
          </div>
        </div>
      </section>

      {/* G) Blog (Latest Article Showcase) - Estilo Branco Quente / Marfim */}
      <section className="bg-brand-cream-light py-24 transition-colors" id="blog">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row items-baseline justify-between mb-12">
            <div className="space-y-1">
              <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono">Papo de Barista</span>
              <h2 className="font-serif text-3xl font-bold text-brand-brown-950 tracking-tight">Conteúdos, dicas e a cultura do café</h2>
            </div>
            <button
              onClick={() => onPageChange('blog')}
              className="text-xs font-semibold text-brand-brown-800 hover:text-brand-gold transition-colors underline cursor-pointer mt-2 sm:mt-0"
            >
              Ver todo o blog
            </button>
          </div>

          {/* Cards display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogData.slice(0, 3).map((artigo) => (
              <article 
                key={artigo.id}
                onClick={() => onPageChange('blog')}
                className="bg-white rounded-xl border border-brand-beige/60 overflow-hidden shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col h-full group"
              >
                <div className="h-44 relative overflow-hidden bg-brand-cream-deep/40">
                  <img 
                    src={artigo.image} 
                    alt={artigo.title} 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-brand-brown-900 border border-brand-gold/30 text-brand-cream-light text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full">
                    {artigo.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-brand-brown-600/70 font-light">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{artigo.date}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{artigo.readTime}</span>
                    </div>
                    <h3 className="font-serif text-sm font-bold text-brand-brown-950 group-hover:text-brand-amber-500 leading-snug line-clamp-2">
                      {artigo.title}
                    </h3>
                    <p className="text-xs font-light text-brand-brown-750 leading-relaxed line-clamp-2">
                      {artigo.excerpt}
                    </p>
                  </div>

                  <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-brand-gold group-hover:text-brand-brown-900 transition-colors">
                    Ler artigo de café
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
