import React, { useState } from 'react';
import { Coffee, Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onPageChange: (page: string) => void;
  onOpenPolicy: (policyName: string) => void;
}

export default function Footer({ onPageChange, onOpenPolicy }: FooterProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [logoSrc, setLogoSrc] = useState('https://lh3.googleusercontent.com/d/1DRx8-BnhpjMFwyiMkgnscLS1qQdvnXEr');

  const handleCopyWpp = () => {
    navigator.clipboard.writeText('+55 (11) 99876-5432');
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <footer className="bg-[#1C0F0B] text-[#E9DECF]/90 pt-16 pb-8 border-t border-[#C7A15A]/15" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
         {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Institutional / Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="cursor-pointer inline-block" onClick={() => onPageChange('home')}>
              <img 
                src={logoSrc} 
                alt="Grão & Origem Curadoria de Cafés" 
                className="h-24 sm:h-28 md:h-32 xl:h-36 w-auto object-contain transition-all duration-300 hover:scale-105"
                onError={() => {
                  if (logoSrc.includes('lh3')) {
                    setLogoSrc('https://drive.google.com/uc?export=view&id=1DRx8-BnhpjMFwyiMkgnscLS1qQdvnXEr');
                  } else if (logoSrc.includes('uc')) {
                    setLogoSrc('https://drive.google.com/thumbnail?id=1DRx8-BnhpjMFwyiMkgnscLS1qQdvnXEr&sz=w1000');
                  }
                }}
                referrerPolicy="no-referrer"
              />
            </div>
            
            <p className="text-sm text-[#E9DECF]/75 leading-relaxed font-light pr-4 font-sans">
              Selecionamos cafés brasileiros excepcionais, com rastreabilidade total de origem. Conectamos consumidores que valorizam a excelência sensorial à sabedoria ancestral de pequenos cafeicultores e produtores rurais de nossas nobres montanhas.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="p-2.5 rounded-full bg-[#2A1712] border border-[#C7A15A]/15 hover:bg-[#C7A15A] hover:text-[#1C0F0B] hover:border-[#C7A15A] text-[#E9DECF]/80 transition-all shadow-xs" aria-label="Acessar Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-[#2A1712] border border-[#C7A15A]/15 hover:bg-[#C7A15A] hover:text-[#1C0F0B] hover:border-[#C7A15A] text-[#E9DECF]/80 transition-all shadow-xs" aria-label="Acessar Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2.5 rounded-full bg-[#2A1712] border border-[#C7A15A]/15 hover:bg-[#C7A15A] hover:text-[#1C0F0B] hover:border-[#C7A15A] text-[#E9DECF]/80 transition-all shadow-xs" aria-label="Acessar Twitter">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#C7A15A] uppercase tracking-wider">Explorar</h3>
            <ul className="space-y-2.5 text-sm font-light text-[#E9DECF]/75 font-sans">
              <li>
                <button onClick={() => onPageChange('home')} className="hover:text-[#C7A15A] hover:underline transition-colors cursor-pointer text-left">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('tradicionais')} className="hover:text-[#C7A15A] hover:underline transition-colors cursor-pointer text-left">
                  Cafés Tradicionais
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('especiais')} className="hover:text-[#C7A15A] hover:underline transition-colors cursor-pointer text-left">
                  Cafés Especiais
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('equipamentos')} className="hover:text-[#C7A15A] hover:underline transition-colors cursor-pointer text-left">
                  Equipamentos de Preparo
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('kits')} className="hover:text-[#C7A15A] hover:underline transition-colors cursor-pointer text-left">
                  Kits de experiência
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('clube')} className="hover:text-[#C7A15A] hover:underline transition-colors cursor-pointer text-left">
                  Clube Assinatura
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('blog')} className="hover:text-[#C7A15A] hover:underline transition-colors cursor-pointer text-left">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => onPageChange('contact')} className="hover:text-[#C7A15A] hover:underline transition-colors cursor-pointer text-left" id="footer-contact-link">
                  Fale Conosco
                </button>
              </li>
            </ul>
          </div>

          {/* Contacts Column */}
          <div className="space-y-4">
            <h3 className="font-serif text-sm font-bold text-[#C7A15A] uppercase tracking-wider">Canais de Contato</h3>
            <ul className="space-y-3 text-sm font-light text-[#E9DECF]/75 font-sans">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-[#C7A15A] shrink-0 mt-0.5" />
                <div>
                  <button 
                    onClick={handleCopyWpp}
                    className="hover:text-[#C7A15A] font-medium transition-colors text-left"
                    id="footer-wpp-link"
                  >
                    +55 (11) 99876-5432
                  </button>
                  <p className="text-[10px] text-[#E9DECF]/50">WhatsApp de Vendas</p>
                  {copiedText && (
                    <span className="text-[10px] text-emerald-450 font-semibold block animate-pulse">Copiado!</span>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-[#C7A15A] shrink-0 mt-0.5" />
                <div>
                  <a href="mailto:contato@graoeorigem.com" className="hover:text-[#C7A15A] transition-colors block">
                    contato@graoeorigem.com
                  </a>
                  <p className="text-[10px] text-[#E9DECF]/50 font-light">Atendimento Comercial</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Policies & Copyright Footer bar */}
        <div className="mt-16 pt-8 border-t border-[#C7A15A]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-[#E9DECF]/60 text-center sm:text-left font-sans">
          
          <div className="flex flex-flow flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2">
            <button onClick={() => onOpenPolicy('Termos de Uso')} className="hover:text-[#C7A15A] cursor-pointer">
              Termos de Uso
            </button>
            <span className="text-[#C7A15A]/30">•</span>
            <button onClick={() => onOpenPolicy('Política de Privacidade')} className="hover:text-[#C7A15A] cursor-pointer">
              Política de Privacidade
            </button>
            <span className="text-[#C7A15A]/30">•</span>
            <button onClick={() => onOpenPolicy('Política de Entrega')} className="hover:text-[#C7A15A] cursor-pointer">
              Política de Entrega
            </button>
            <span className="text-[#C7A15A]/30">•</span>
            <button onClick={() => onOpenPolicy('Trocas e Devoluções')} className="hover:text-[#C7A15A] cursor-pointer">
              Trocas & Devoluções
            </button>
          </div>

          <div>
            <p className="text-[#E9DECF]/50">© {new Date().getFullYear()} Grão & Origem. Conectando o Brasil pelos melhores cafés selecionados. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
