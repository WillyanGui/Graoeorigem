import React, { useState } from 'react';
import { PlanoAssinatura } from '../types';
import { Check, Sparkles, Coffee, Calendar, Gift, Heart, ShieldCheck } from 'lucide-react';

interface SubscriptionPageProps {
  onSuccessSubscribe: (planName: string, config: any) => void;
}

export default function SubscriptionPage({ onSuccessSubscribe }: SubscriptionPageProps) {
  // Config state choice
  const [formatChoice, setFormatChoice] = useState<'Grão' | 'Moído'>('Grão');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // checkout modal state for subscribing
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCPF, setClientCPF] = useState('');

  const plansList = [
    {
      id: 'Básico',
      title: 'Plano Básico',
      tagline: 'Ideal para o consumo diário',
      price: 39.90,
      description: 'Para quem deseja começar sua jornada com cafés selecionados sem complicar a cozinha.',
      benefits: [
        '1 café selecionado por mês (250g)',
        'Perfil sensorial equilibrado e fácil de agradar',
        'Consumo mensal regular em porção conveniente',
        'Exclusividades e descontos de 5% no e-commerce'
      ]
    },
    {
      id: 'Essencial',
      title: 'Plano Essencial',
      tagline: 'Recomendação dos Sommeilers',
      price: 69.90,
      description: 'Para quem quer variedade e dinamismo em suas manhãs domésticas.',
      benefits: [
        '2 cafés selecionados por mês (250g cada)',
        'Combinação rica entre cafés tradicionais superiores e cafés especiais',
        'Conteúdo explicativo rico sobre a fazenda, terroir, torra e melhor preparo',
        'Descontos exclusivos de 10% em toda loja'
      ]
    },
    {
      id: 'Experiência Completa',
      title: 'Experiência Completa',
      tagline: 'Jornada sensorial absoluta',
      price: 99.90,
      description: 'Para o verdadeiro apreciador de café que preza por complexidade, microlotes e exclusividade.',
      benefits: [
        '3 cafés especiais de altíssima classificação SCA por mês (250g cada)',
        'Inclusão prioritária de microlotes colheitas limitadas e sazonais',
        'Ficha sensorial técnica completa para treinamento olfativo',
        'Conteúdo exclusivo, bate-papo virtual com agrônomos convidados e mimos de barista'
      ]
    }
  ];

  const handleOpenSubscribeForm = (planId: string) => {
    setSelectedPlan(planId);
    setSuccessMsg('');
    // Scroll to form smoothly
    setTimeout(() => {
      const element = document.getElementById('membership-form-checkout');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSubmitSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientCPF || !selectedPlan) {
      alert('Por favor, preencha todos os campos do formulário de adesão.');
      return;
    }

    setSuccessMsg(`Parabéns! Sua assinatura do "${selectedPlan}" foi realizada com sucesso!`);
    onSuccessSubscribe(selectedPlan, { clientName });

    // Reset fields after some seconds
    setTimeout(() => {
      setSuccessMsg('');
      setSelectedPlan(null);
      setClientName('');
      setClientEmail('');
      setClientCPF('');
    }, 4500);
  };

  return (
    <div className="bg-brand-cream-light min-h-screen animate-fade-in">
      
      {/* 1. Presentation Section (Brown background) */}
      <div className="bg-brand-brown-900 py-16 text-center border-b border-brand-brown-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono block">
              CLUBE DE ASSINATURA GRÃO & ORIGEM
            </span>
            <h1 className="font-serif text-3xl sm:text-4.5xl font-extrabold text-[#F5EFE6] tracking-tight leading-tight">
              Bons cafés, escolhidos para você, todos os meses.
            </h1>
            <div className="text-xs sm:text-sm md:text-base font-light text-brand-cream-deep/85 leading-relaxed space-y-4 max-w-2xl mx-auto text-justify">
              <p>
                Assine o Clube Grão & Origem e receba em casa uma curadoria recorrente de cafés selecionados para acompanhar sua rotina com mais sabor, praticidade e qualidade.
              </p>
              <p>
                Você escolhe o pacote que combina melhor with o seu consumo, e nós cuidamos da seleção para que bons cafés estejam sempre por perto.
              </p>
              <p>
                Uma forma simples de descobrir novos sabores, manter sua casa abastecida e transformar o café do mês em uma experiência mais especial.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plansList.map((p) => {
            const isFeatured = p.id === 'Essencial';
            return (
              <div
                key={p.id}
                className={`bg-brand-cream-light rounded-2xl border flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all ${
                  isFeatured
                    ? 'border-brand-gold border-2 scale-102 lg:scale-103 bg-brand-gold-light/10 ring-4 ring-brand-gold/5'
                    : 'border-brand-beige/60'
                }`}
              >
                {isFeatured && (
                  <span className="absolute top-0 right-4 translate-y-[-50%] bg-brand-gold text-brand-brown-950 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-2xs">
                    Recomendado
                  </span>
                )}

                <div className="p-8 space-y-6">
                  {/* Category Title */}
                  <div>
                    <span className="text-[9px] font-bold tracking-widest uppercase text-brand-gold">{p.tagline}</span>
                    <h3 className="font-serif text-xl font-bold text-brand-brown-950 mt-1">{p.title}</h3>
                    <p className="text-xs font-light text-brand-brown-700/90 mt-2 h-10 overflow-hidden">{p.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-brand-brown-600 font-light">R$</span>
                    <span className="font-serif text-3xl font-bold text-brand-brown-950 font-mono">{p.price.toFixed(2)}</span>
                    <span className="text-xs text-brand-brown-600 font-light">/mês</span>
                  </div>

                  <div className="h-px bg-brand-beige/40 my-4" />

                  {/* Bullet Benefits */}
                  <ul className="space-y-3.5 text-xs">
                    {p.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-brand-brown-850 text-left">
                        <Check className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                        <span className="font-light leading-snug">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-8 pt-0">
                  <button
                    onClick={() => handleOpenSubscribeForm(p.id)}
                    className={`w-full py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      isFeatured
                        ? 'bg-brand-brown-850 hover:bg-brand-brown-700 text-brand-cream-light shadow-sm'
                        : 'bg-brand-cream-deep hover:bg-brand-beige text-brand-brown-800'
                    }`}
                    id={`club-subscribe-btn-${p.id}`}
                  >
                    Adquirir Plano {p.id}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic checkout embedded frame details for instant subbing */}
        {selectedPlan && (
          <section className="mt-16 bg-brand-cream-deep/60 border border-brand-beige rounded-2xl p-8 max-w-xl mx-auto text-left space-y-6 animate-fade-in" id="membership-form-checkout">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gold block font-mono">Formulário de Adesão Segura</span>
              <h3 className="font-serif text-lg font-bold text-brand-brown-950">Adesão ao {selectedPlan}</h3>
              <p className="text-xs font-light text-brand-brown-750">Preencha os dados cadastrais básicos abaixo para formalizar seu acesso.</p>
            </div>

            {successMsg ? (
              <div className="p-4 bg-brand-green-600/10 border border-brand-green-600/35 text-brand-green-700 text-xs font-bold rounded-lg text-center leading-relaxed">
                {successMsg}
              </div>
            ) : (
              <form onSubmit={handleSubmitSubscription} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="cli-name">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Maria Eduarda Santos"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                    id="cli-name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="cli-email">E-mail para Alertas *</label>
                    <input
                      type="email"
                      required
                      placeholder="maria@email.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-white border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="cli-email"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="cli-cpf">CPF do Titular *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={clientCPF}
                      onChange={(e) => setClientCPF(e.target.value)}
                      className="w-full bg-white border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="cli-cpf"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-lg bg-brand-brown-850 hover:bg-brand-brown-700 text-brand-cream-light font-bold text-xs uppercase tracking-wider cursor-pointer"
                  id="membership-confirm-submit-btn"
                >
                  Confirmar Adesão e Seguir para Entrega
                </button>

                <p className="text-[9px] text-center text-brand-brown-600/70 font-light">
                  A cobrança é realizada de forma recorrente em ciclos automáticos de 30 dias. Cancele quando desejar sem taxas.
                </p>
              </form>
            )}
          </section>
        )}

        {/* Benefits banner bottom */}
        <section className="mt-20 border-t border-brand-beige/50 pt-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex gap-3 text-left">
              <span className="w-10 h-10 rounded-full bg-brand-green-600/10 flex items-center justify-center text-brand-green-700 shrink-0">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-brand-brown-950 uppercase">Sem Carência</h4>
                <p className="text-[11px] text-brand-brown-600 font-light mt-1 leading-normal">Adira ou cancele a qualquer dia direto pelo painel, sem taxas residuais.</p>
              </div>
            </div>

            <div className="flex gap-3 text-left">
              <span className="w-10 h-10 rounded-full bg-brand-gold/15 flex items-center justify-center text-brand-gold shrink-0">
                <Gift className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-brand-brown-950 uppercase">Mimos de Barismo</h4>
                <p className="text-[11px] text-brand-brown-600 font-light mt-1 leading-normal">Lotes de cafés raríssimos e brindes surpresa inclusos nos planos nobres.</p>
              </div>
            </div>

            <div className="flex gap-3 text-left">
              <span className="w-10 h-10 rounded-full bg-brand-brown-900/5 flex items-center justify-center text-brand-brown-800 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-brand-brown-950 uppercase">Rastreio e Apoio</h4>
                <p className="text-[11px] text-brand-brown-600 font-light mt-1 leading-normal">Informações de frete rastreáveis em tempo real direto em seu e-mail.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
