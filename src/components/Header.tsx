import React, { useState } from 'react';
import { Coffee, Menu, X, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { CartItem } from '../types';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string, extra?: any) => void;
  cart: CartItem[];
  onOpenCart: () => void;
}

export default function Header({ currentPage, onPageChange, cart, onOpenCart }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);
  const [logoSrc, setLogoSrc] = useState('https://lh3.googleusercontent.com/d/1dKnBoL8KmV4Su9r9uy7uoAEabbnGvDDa');

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleNavClick = (pageId: string) => {
    setIsMobileMenuOpen(false);
    onPageChange(pageId);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-cream-light/95 backdrop-blur-md border-b border-brand-beige/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('home')} 
            className="cursor-pointer shrink-0 h-16 w-48 sm:w-56 md:w-60 lg:w-68 flex items-center justify-center overflow-hidden relative"
            id="logo-button"
          >
            <img 
              src={logoSrc} 
              alt="Grão & Origem Curadoria de Cafés" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 sm:h-40 md:h-44 lg:h-48 w-auto max-w-none object-contain transition-all duration-300 hover:scale-[1.05]"
              onError={() => {
                if (logoSrc.includes('lh3')) {
                  setLogoSrc('https://drive.google.com/uc?export=view&id=1dKnBoL8KmV4Su9r9uy7uoAEabbnGvDDa');
                } else if (logoSrc.includes('uc')) {
                  setLogoSrc('https://drive.google.com/thumbnail?id=1dKnBoL8KmV4Su9r9uy7uoAEabbnGvDDa&sz=w1000');
                }
              }}
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            
            {/* Início */}
            <button
              onClick={() => handleNavClick('home')}
              className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors cursor-pointer ${
                currentPage === 'home'
                  ? 'text-brand-brown-900 bg-brand-gold-light'
                  : 'text-brand-brown-700/80 hover:text-brand-brown-900 hover:bg-brand-beige/25'
              }`}
              id="nav-home"
            >
              Início
            </button>

            {/* Produtos Dropdown */}
            <div 
              className="relative py-2" 
              onMouseEnter={() => setIsDropdownHovered(true)} 
              onMouseLeave={() => setIsDropdownHovered(false)}
            >
              <button
                className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors flex items-center gap-1 cursor-pointer ${
                  ['tradicionais', 'especiais', 'equipamentos', 'kits'].includes(currentPage)
                    ? 'text-brand-brown-900 bg-brand-gold-light'
                    : 'text-brand-brown-700/80 hover:text-brand-brown-900 hover:bg-brand-beige/25'
                }`}
                id="nav-produtos-dropdown"
              >
                Produtos
                <svg className={`w-3 h-3 transition-transform ${isDropdownHovered ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownHovered && (
                <div className="absolute left-0 top-full pt-1 w-52 z-50">
                  <div className="bg-brand-cream-light rounded-lg border border-brand-beige shadow-lg py-1.5 animate-fade-in text-left">
                    <button
                      onClick={() => { handleNavClick('tradicionais'); setIsDropdownHovered(false); }}
                      className={`w-full text-left px-4 py-2 text-xs xl:text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === 'tradicionais' ? 'text-brand-gold font-bold bg-brand-cream-deep/50' : 'text-brand-brown-800 hover:bg-brand-gold-light/40'
                      }`}
                    >
                      Cafés Tradicionais
                    </button>
                    <button
                      onClick={() => { handleNavClick('especiais'); setIsDropdownHovered(false); }}
                      className={`w-full text-left px-4 py-2 text-xs xl:text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === 'especiais' ? 'text-brand-gold font-bold bg-brand-cream-deep/50' : 'text-brand-brown-800 hover:bg-brand-gold-light/40'
                      }`}
                    >
                      Cafés Especiais
                    </button>
                    <button
                      onClick={() => { handleNavClick('equipamentos'); setIsDropdownHovered(false); }}
                      className={`w-full text-left px-4 py-2 text-xs xl:text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === 'equipamentos' ? 'text-brand-gold font-bold bg-brand-cream-deep/50' : 'text-brand-brown-800 hover:bg-brand-gold-light/40'
                      }`}
                    >
                      Equipamentos
                    </button>
                    <button
                      onClick={() => { handleNavClick('kits'); setIsDropdownHovered(false); }}
                      className={`w-full text-left px-4 py-2 text-xs xl:text-sm font-bold text-[#C7A15A] hover:bg-brand-gold-light/45 transition-colors cursor-pointer flex items-center justify-between ${
                        currentPage === 'kits' ? 'bg-brand-cream-deep/50' : ''
                      }`}
                    >
                      <span>Kits de Experiência</span>
                      <span className="text-[9px] bg-brand-brown-850 text-brand-gold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-semibold">Novo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Clube de Assinatura */}
            <button
              onClick={() => handleNavClick('clube')}
              className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors cursor-pointer ${
                currentPage === 'clube'
                  ? 'text-brand-brown-900 bg-brand-gold-light'
                  : 'text-brand-brown-700/80 hover:text-brand-brown-900 hover:bg-brand-beige/25'
              }`}
              id="nav-clube"
            >
              Clube de Assinatura
            </button>

            {/* Blog */}
            <button
              onClick={() => handleNavClick('blog')}
              className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors cursor-pointer ${
                currentPage === 'blog'
                  ? 'text-brand-brown-900 bg-brand-gold-light'
                  : 'text-brand-brown-700/80 hover:text-brand-brown-900 hover:bg-brand-beige/25'
              }`}
              id="nav-blog"
            >
              Blog
            </button>

            {/* Fale Conosco */}
            <button
              onClick={() => handleNavClick('contact')}
              className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors cursor-pointer ${
                currentPage === 'contact'
                  ? 'text-brand-brown-900 bg-brand-gold-light'
                  : 'text-brand-brown-700/80 hover:text-brand-brown-900 hover:bg-brand-beige/25'
              }`}
              id="nav-contact"
            >
              Fale Conosco
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                currentPage === 'admin'
                  ? 'text-brand-brown-900 bg-brand-gold-light'
                  : 'text-brand-brown-700/80 hover:text-brand-brown-900 hover:bg-brand-beige/25'
              }`}
              id="nav-login"
            >
              <LayoutDashboard className="w-4 h-4" />
              Login
            </button>

          </nav>

          {/* Actions: Cart Trigger, Mobile Hamburguer Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Shopping Cart Trigger */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-brand-cream-deep hover:bg-brand-beige/30 transition-colors text-brand-brown-800 cursor-pointer"
              aria-label="Ver Carrinho"
              id="cart-trigger-button"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold text-brand-brown-900 flex items-center justify-center rounded-full text-[10px] font-bold border border-brand-cream-light animate-bounce" id="cart-badge-count">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburguer Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex lg:hidden p-2 rounded-md bg-brand-cream-deep text-brand-brown-900 cursor-pointer"
              aria-label="Abrir Menu"
              id="mobile-menu-hamburger"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 w-full bg-brand-cream-light border-b border-brand-beige shadow-lg z-45 max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="px-6 py-6 space-y-5">
            
            {/* Menu Links */}
            <div className="grid grid-cols-1 divide-y divide-brand-beige/30">
              
              <button
                onClick={() => handleNavClick('home')}
                className="py-3.5 text-left font-serif text-base font-semibold text-brand-brown-800 hover:text-brand-gold hover:pl-2 transition-all cursor-pointer"
              >
                Início
              </button>
              
              {/* Products nested view */}
              <div className="py-4 space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-brand-gold font-mono block px-1">Produtos</span>
                <div className="pl-3.5 space-y-3.5 pt-2 flex flex-col items-start border-l border-brand-beige">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); onPageChange('tradicionais'); }}
                    className={`text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === 'tradicionais' ? 'text-[#C7A15A] font-bold' : 'text-brand-brown-750 hover:text-brand-gold'
                    }`}
                  >
                    Cafés Tradicionais
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); onPageChange('especiais'); }}
                    className={`text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === 'especiais' ? 'text-[#C7A15A] font-bold' : 'text-brand-brown-750 hover:text-brand-gold'
                    }`}
                  >
                    Cafés Especiais
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); onPageChange('equipamentos'); }}
                    className={`text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === 'equipamentos' ? 'text-[#C7A15A] font-bold' : 'text-brand-brown-750 hover:text-brand-gold'
                    }`}
                  >
                    Equipamentos
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); onPageChange('kits'); }}
                    className={`text-sm font-bold text-[#C7A15A] hover:text-[#C7A15A]/80 transition-colors cursor-pointer flex items-center gap-1 ${
                      currentPage === 'kits' ? 'underline decoration-2' : ''
                    }`}
                  >
                    Kits de Experiência ✨
                  </button>
                </div>
              </div>

              <button
                onClick={() => handleNavClick('clube')}
                className="py-3.5 text-left font-serif text-base font-semibold text-brand-brown-800 hover:text-brand-gold hover:pl-2 transition-all cursor-pointer"
              >
                Clube de Assinatura
              </button>
              
              <button
                onClick={() => handleNavClick('blog')}
                className="py-3.5 text-left font-serif text-base font-semibold text-brand-brown-800 hover:text-brand-gold hover:pl-2 transition-all cursor-pointer"
              >
                Blog
              </button>

              <button
                onClick={() => handleNavClick('contact')}
                className="py-3.5 text-left font-serif text-base font-semibold text-brand-brown-800 hover:text-brand-gold hover:pl-2 transition-all cursor-pointer"
              >
                Fale Conosco
              </button>

              <button
                onClick={() => handleNavClick('admin')}
                className="py-3.5 text-left font-serif text-base font-semibold text-brand-brown-800 hover:text-brand-gold hover:pl-2 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <LayoutDashboard className="w-5 h-5" />
                Login
              </button>

            </div>

            {/* Highlights CTAs inside mobile drawer */}
            <div className="pt-4 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onPageChange('kits');
                }}
                className="w-full text-center py-3 rounded-lg bg-[#1C0F0B] text-brand-cream-light font-bold text-xs uppercase tracking-wider hover:bg-[#1C0F0B]/90 cursor-pointer"
                id="mobile-drawer-kits-btn"
              >
                Explorar Kits de Experiência
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onPageChange('clube');
                }}
                className="w-full text-center py-3 rounded-lg bg-brand-gold text-brand-brown-900 font-bold text-xs uppercase tracking-wider hover:bg-brand-gold/92 cursor-pointer shadow-xs"
                id="mobile-drawer-clube-btn"
              >
                Conhecer Clube de Assinatura
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
