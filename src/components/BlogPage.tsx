import React, { useState } from 'react';
import { blogData } from '../data/blog';
import { ArtigoBlog } from '../types';
import { ArrowLeft, Clock, Calendar, User, BookOpen, Share2 } from 'lucide-react';

export default function BlogPage() {
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);

  const activeArticle = activeArticleId !== null 
    ? blogData.find(a => a.id === activeArticleId) 
    : null;

  const handleShare = () => {
    alert('Link do artigo copiado para a área de transferência! Compartilhe com outros apreciadores de café.');
  };

  if (activeArticle) {
    return (
      <div className="bg-brand-cream-light min-h-screen py-16 animate-fade-in text-left">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back button */}
          <button
            onClick={() => setActiveArticleId(null)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-brown-800 hover:text-brand-gold uppercase tracking-wider mb-8 cursor-pointer"
            id="blog-read-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Coleção de Artigos
          </button>

          {/* Article Editorial */}
          <article className="space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold text-brand-gold uppercase tracking-widest font-mono">
                {activeArticle.category}
              </span>
              
              <h1 className="font-serif text-3.5xl sm:text-4.5xl font-bold text-brand-brown-950 tracking-tight leading-tight">
                {activeArticle.title}
              </h1>

              {/* Authoring metadata */}
              <div className="flex flex-flow flex-wrap items-center gap-4 text-xs font-light text-brand-brown-700 pb-4 border-b border-brand-beige/50">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand-gold" />
                  <span>{activeArticle.date}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-gold" />
                  <span>{activeArticle.readTime}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-gold" />
                  <span>Sommelier da Casa</span>
                </div>
              </div>
            </div>

            {/* Imprimatur / Image */}
            <div className="border border-brand-beige/50 rounded-2xl overflow-hidden shadow-xs h-72 md:h-96 relative bg-brand-cream-deep/60">
              <img
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Content text */}
            <div className="prose prose-amber max-w-none text-brand-brown-850 font-light text-sm sm:text-base leading-relaxed space-y-6">
              {activeArticle.content.split('\n\n').map((paragraph, i) => (
                <p key={i} className="whitespace-pre-line first-letter:text-2xl first-letter:font-serif first-letter:font-bold first-letter:text-brand-gold first-letter:mr-1">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Share action bar */}
            <div className="pt-8 border-t border-brand-beige/40 flex items-center justify-between">
              <span className="text-xs font-light text-brand-brown-650">Gostou da leitura? Propague este conhecimento com amigos.</span>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-brand-beige text-brand-brown-800 hover:bg-brand-cream-deep/40 cursor-pointer"
                id="blog-share-btn"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartilhar Café
              </button>
            </div>

          </article>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream-light min-h-screen py-16 animate-fade-in text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Intro */}
        <div className="max-w-full mb-12">
          <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono block mb-5">
            Papo de Sommelier — Nossa Enciclopédia
          </span>
          <h1 className="font-serif text-3.5xl sm:text-4.5xl font-bold text-brand-brown-950 tracking-tight leading-tight mb-4">
            Conteúdos e a Cultura do Café
          </h1>
          <div className="text-sm sm:text-base font-light text-brand-brown-750 leading-relaxed space-y-1.5 text-justify">
            <p>
              Abra dezenas de insights valiosos de degustação, barismo doméstico e as ricas histórias por trás das grandes safras brasileiras. Criamos guias práticos, análises da ciência do processamento biológico sob terreiros, explicações de graus de torração e recomendações de utensílios, para guiar você rumo à maestria em cada infusão.
            </p>
          </div>
        </div>

        {/* Collection grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogData.map((artigo) => (
            <article
              key={artigo.id}
              onClick={() => setActiveArticleId(artigo.id)}
              className="bg-brand-cream-light rounded-xl border border-brand-beige/50 overflow-hidden shadow-xs hover:shadow-md cursor-pointer transition-all flex flex-col h-full group"
            >
              <div className="h-48 relative overflow-hidden bg-brand-cream-deep">
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
                  Ler artigo completo
                  <ArrowLeft className="w-3 h-3 ml-0.5 rotate-180" />
                </span>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
