import React from 'react';
import { Mail, Phone, Instagram, Facebook, Twitter, MessageSquare, Clock, Coffee, ArrowRight } from 'lucide-react';

interface ContactPageProps {
  onPageChange: (page: string) => void;
}

export default function ContactPage({ onPageChange }: ContactPageProps) {
  return (
    <div className="bg-brand-cream-light min-h-screen py-16 animate-fade-in" id="contact-page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title and Intro */}
        <div className="max-w-full mb-12">
          <span className="text-xs font-bold text-brand-amber-500 uppercase tracking-widest font-mono block mb-5">
            Canais de atendimento oficiais.
          </span>
          <h1 className="font-serif text-3.5xl sm:text-4.5xl font-bold text-brand-brown-950 tracking-tight leading-tight mb-4">
            Fale Conosco
          </h1>
          <div className="text-sm sm:text-base font-light text-brand-brown-750 leading-relaxed space-y-1.5 text-justify">
            <p>
              Queremos ouvir você. Seja para tirar dúvidas sobre nossos grãos selecionados, saber mais sobre a história dos cafeicultores rurais, acompanhar um lote encomendado, assinar nosso clube exclusivo ou fechar parcerias comerciais, nossa equipe de baristas e curadores está sempre pronta para auxiliar seu ritual.
            </p>
          </div>
        </div>

        {/* Channels Content Layout */}
        <div className="space-y-6">
          
          {/* Top row with 3 cards (WhatsApp, E-mail, Social Media) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* WhatsApp Card */}
            <div className="bg-brand-cream-deep/60 border border-brand-beige rounded-2xl p-6 shadow-xs relative overflow-hidden group flex flex-col justify-between hover:border-[#C7A15A] hover:bg-[#FAF6F0] transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C7A15A]/5 rounded-full blur-xl group-hover:bg-[#C7A15A]/10 transition-colors" />
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-brown-950">Whatsapp Oficial</h3>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-brand-brown-750 font-mono">+55 (11) 99876-5432</p>
                  <p className="text-xs text-brand-brown-750 font-light leading-relaxed font-sans mt-2">
                    Atendimento rápido para tirar dúvidas sobre cafés, moagens ou suporte nas compras.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-brand-beige/30 mt-4 flex justify-end">
                <a 
                  href="https://wa.me/5511998765432" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold uppercase tracking-wider text-brand-amber-500 hover:text-brand-brown-950 flex items-center gap-1 transition-colors"
                  id="wpp-direct-chat-link"
                >
                  Iniciar conversa agora
                  <ArrowRight className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-brand-cream-deep/60 border border-brand-beige rounded-2xl p-6 shadow-xs relative overflow-hidden group flex flex-col justify-between hover:border-[#C7A15A] hover:bg-[#FAF6F0] transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#C7A15A]/5 rounded-full blur-xl group-hover:bg-[#C7A15A]/10 transition-colors" />
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#C7A15A]/15 text-[#C7A15A] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-brown-950">Nosso E-mail</h3>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-brand-brown-750 font-mono break-all">contato@graoeorigem.com</p>
                  <p className="text-xs text-brand-brown-750 font-light leading-relaxed font-sans mt-2">
                    Dúvidas corporativas, propostas de parcerias e cotações especiais de cafés.
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-brand-beige/30 mt-4 flex justify-end">
                <span className="text-[10px] uppercase tracking-wider text-brand-brown-500/80 font-mono">
                  Contato Comercial
                </span>
              </div>
            </div>

            {/* Social Media (Conecte-se) Card */}
            <div className="bg-brand-cream-deep/60 border border-brand-beige rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-[#C7A15A] hover:bg-[#FAF6F0] transition-all duration-300">
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/15 text-brand-amber-500 flex items-center justify-center shrink-0">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-brand-brown-950">Conecte-se</h3>
                </div>
                <p className="text-xs text-brand-brown-750 font-light leading-relaxed font-sans">
                  Acompanhe o dia a dia das colheitas de montanha, processos de torra e rituais no Instagram, Facebook e Twitter.
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-1.5 pt-4 border-t border-brand-beige/30 mt-4">
                <a 
                  href="#" 
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-white border border-brand-beige/60 hover:border-[#C7A15A] hover:bg-[#FAF6F0] text-brand-brown-800 transition-all text-center"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#C7A15A]" />
                  <span className="text-[9px] font-bold font-mono text-brand-brown-750">Instagram</span>
                </a>
                
                <a 
                  href="#" 
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-white border border-brand-beige/60 hover:border-[#C7A15A] hover:bg-[#FAF6F0] text-brand-brown-800 transition-all text-center"
                >
                  <Facebook className="w-3.5 h-3.5 text-[#C7A15A]" />
                  <span className="text-[9px] font-bold font-mono text-brand-brown-750">Facebook</span>
                </a>

                <a 
                  href="#" 
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg bg-white border border-brand-beige/60 hover:border-[#C7A15A] hover:bg-[#FAF6F0] text-brand-brown-800 transition-all text-center"
                >
                  <Twitter className="w-3.5 h-3.5 text-[#C7A15A]" />
                  <span className="text-[9px] font-bold font-mono text-brand-brown-750">Twitter</span>
                </a>
              </div>
            </div>

          </div>

          {/* Service hours Info - Rectangular Bottom Card (No address) */}
          <div className="bg-brand-brown-900 border border-brand-brown-800 rounded-2xl p-6 text-brand-cream-deep shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold text-brand-gold uppercase tracking-wider">Expediente</h4>
                <p className="text-[11px] text-brand-cream-deep/50 font-light font-sans mt-0.5">
                  Grão & Origem — Café no ritmo da constância e do afeto
                </p>
              </div>
            </div>
            <div className="flex-1 max-w-2xl">
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans font-light divide-y sm:divide-y-0 sm:divide-x divide-brand-brown-800/40">
                <div className="flex justify-between sm:flex-col sm:items-start sm:px-4 py-1.5 sm:py-0 first:pl-0 border-t-0">
                  <span className="text-brand-cream-deep/60">Segunda a Sexta</span>
                  <span className="font-mono text-brand-gold font-semibold sm:mt-1">08h às 17h</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-start sm:px-4 py-1.5 sm:py-0">
                  <span className="text-brand-cream-deep/60">Sábado</span>
                  <span className="font-mono text-brand-gold font-semibold sm:mt-1">08h até 13h</span>
                </div>
                <div className="flex justify-between sm:flex-col sm:items-start sm:px-4 py-1.5 sm:py-0">
                  <span className="text-brand-cream-deep/60">Domingos e Feriados</span>
                  <span className="text-brand-cream-deep/40 italic sm:mt-1">Fechados</span>
                </div>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
