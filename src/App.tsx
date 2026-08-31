import React, { useState, useEffect } from 'react';
import { CartItem } from './types';

// Importing custom modular components
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Pages
import HomePage from './components/HomePage';
import TraditionalPage from './components/TraditionalPage';
import SpecialtyPage from './components/SpecialtyPage';
import EquipmentsPage from './components/EquipmentsPage';
import SubscriptionPage from './components/SubscriptionPage';
import CafeDetailPage from './components/CafeDetailPage';
import EquipmentDetailPage from './components/EquipmentDetailPage';
import CheckoutPage from './components/CheckoutPage';
import CafeicultoresPage from './components/CafeicultoresPage';
import BlogPage from './components/BlogPage';
import KitsPage from './components/KitsPage';
import ContactPage from './components/ContactPage';
import AdminPage from './components/AdminPage';

import { X, Lock, CheckCircle, Scale, Truck, RotateCcw } from 'lucide-react';

export default function App() {
  // Navigation Routing States
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [activeCafeId, setActiveCafeId] = useState<number | null>(null);
  const [activeEquipmentId, setActiveEquipmentId] = useState<number | null>(null);

  // Cart Drawer open/close state
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Policies Modal State
  const [activePolicy, setActivePolicy] = useState<string | null>(null);

  // Load cart from localStorage on init
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('grao_origem_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save cart to local storage whenever it undergoes update
  useEffect(() => {
    localStorage.setItem('grao_origem_cart', JSON.stringify(cart));
  }, [cart]);

  // Scroll to top on page switches to mimic navigation standard
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentPage, activeCafeId, activeEquipmentId]);

  // Navigation callbacks
  const handlePageChange = (page: string, extra?: any) => {
    setCurrentPage(page);
    setActiveCafeId(null);
    setActiveEquipmentId(null);

    if (page === 'cafe' && extra?.id) {
      setActiveCafeId(extra.id);
    } else if (page === 'equipamento' && extra?.id) {
      setActiveEquipmentId(extra.id);
    }
  };

  // Cart Action Handlers
  const handleAddToCartAndCheckout = (item: Omit<CartItem, 'id' | 'priceTotal'>) => {
    // Generate unique ID based on product selections to group identical items
    let uniqueId = `${item.productType}-${item.productType === 'cafe' ? item.cafeDetails?.id : item.equipamentoDetails?.id}`;
    if (item.productType === 'cafe' && item.cafeDetails) {
      uniqueId += `-${item.cafeDetails.weight}-${item.cafeDetails.type}-${item.cafeDetails.roast || 'default'}`;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.id === uniqueId);
      if (existingIdx > -1) {
        const copy = [...prev];
        const oldItem = copy[existingIdx];
        copy[existingIdx] = {
          ...oldItem,
          quantity: oldItem.quantity + item.quantity,
          priceTotal: (oldItem.quantity + item.quantity) * oldItem.priceUnit,
        };
        return copy;
      } else {
        const newItem: CartItem = {
          ...item,
          id: uniqueId,
          priceTotal: item.quantity * item.priceUnit,
        };
        return [...prev, newItem];
      }
    });

    // Directly open checkout
    setIsCartOpen(false);
    setCurrentPage('checkout');
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: newQty, priceTotal: newQty * item.priceUnit }
          : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleSuccessSubscribe = (planName: string, config: any) => {
    // Alert is standard inside the form, we can log or handle further
    console.log(`Nova assinatura consolidada para: ${planName}`, config);
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream-light text-brand-brown-900 overflow-x-hidden antialiased">
      
      {/* Dynamic Header */}
      <Header
        currentPage={currentPage}
        onPageChange={handlePageChange}
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Cart Drawer Overlay */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={() => {
          setIsCartOpen(false);
          setCurrentPage('checkout');
        }}
      />

      {/* Main Page Area Container */}
      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage onPageChange={handlePageChange} />
        )}

        {currentPage === 'tradicionais' && (
          <TraditionalPage onPageChange={handlePageChange} />
        )}

        {currentPage === 'especiais' && (
          <SpecialtyPage onPageChange={handlePageChange} />
        )}

        {currentPage === 'equipamentos' && (
          <EquipmentsPage onPageChange={handlePageChange} />
        )}

        {currentPage === 'kits' && (
          <KitsPage
            onPageChange={handlePageChange}
            onAddToCartAndCheckout={handleAddToCartAndCheckout}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentPage === 'clube' && (
          <SubscriptionPage onSuccessSubscribe={handleSuccessSubscribe} />
        )}

        {currentPage === 'blog' && (
          <BlogPage />
        )}

        {currentPage === 'contact' && (
          <ContactPage onPageChange={handlePageChange} />
        )}

        {currentPage === 'admin' && (
          <AdminPage />
        )}

        {currentPage === 'cafeicultores' && (
          <CafeicultoresPage onPageChange={handlePageChange} />
        )}

        {currentPage === 'cafe' && activeCafeId !== null && (
          <CafeDetailPage
            cafeId={activeCafeId}
            onPageChange={handlePageChange}
            onAddToCartAndCheckout={handleAddToCartAndCheckout}
          />
        )}

        {currentPage === 'equipamento' && activeEquipmentId !== null && (
          <EquipmentDetailPage
            equipId={activeEquipmentId}
            onPageChange={handlePageChange}
            onAddToCartAndCheckout={handleAddToCartAndCheckout}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            cart={cart}
            onPageChange={handlePageChange}
            onClearCart={handleClearCart}
          />
        )}
      </main>

      {/* Dynamic Footer */}
      <Footer
        onPageChange={handlePageChange}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
      />

      {/* Policies Modal View Layer */}
      {activePolicy && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setActivePolicy(null)} />
          
          <div className="bg-white border border-brand-beige p-6 sm:p-8 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative z-10 text-left space-y-6 shadow-2xl animate-fade-in" id="policy-modal-container">
            
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-brand-beige/50 pb-4">
              <div className="flex items-center gap-2">
                {activePolicy === 'Termos de Uso' && <Scale className="w-5 h-5 text-brand-gold" />}
                {activePolicy === 'Política de Privacidade' && <Lock className="w-5 h-5 text-brand-gold" />}
                {activePolicy === 'Política de Entrega' && <Truck className="w-5 h-5 text-brand-gold" />}
                {activePolicy === 'Trocas e Devoluções' && <RotateCcw className="w-5 h-5 text-brand-gold" />}
                <h2 className="font-serif text-lg sm:text-xl font-bold text-brand-brown-950">{activePolicy}</h2>
              </div>
              
              <button
                onClick={() => setActivePolicy(null)}
                className="p-1 px-2 rounded-md hover:bg-brand-cream-deep/60 text-brand-brown-700 hover:text-brand-brown-950 transition-colors"
                id="close-policy-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content text */}
            <div className="text-xs sm:text-sm font-light text-brand-brown-850 leading-relaxed space-y-4">
              
              {activePolicy === 'Termos de Uso' && (
                <>
                  <p><strong>1. Aceitação dos Termos:</strong> Ao navegar pela plataforma da Grão & Origem e adquirir nossos lotes, cafés tradicionais e especiais, você concorda de livre e espontânea vontade com as diretrizes regulamentares e comerciais expressas sob a legislação comercial brasileira de e-commerce.</p>
                  <p><strong>2. Relação com Produtores:</strong> Atuamos como intermediários e curadores oficiais de cafés rurais. Toda imagem, vídeo ou história de cafeicultor possui autorização contratual explícita e respeita a dignidade do trabalho agrícola de montanha.</p>
                  <p><strong>3. Responsabilidade de Cadastro:</strong> O cliente é civilmente responsável por fornecer dados cadastrais corretos (como CPF e endereços) para evitar falhas ou atrasos contratuais de entrega de mantimentos.</p>
                </>
              )}

              {activePolicy === 'Política de Privacidade' && (
                <>
                  <p><strong>1. Coleta de Informações:</strong> Armazenamos estritamente os dados necessários para o processamento comercial do pagamento (Pix, cartões ou boletos) e despacho com transportadoras credenciadas. Seus dados cadastrais básicos ficam encriptados local e remotamente.</p>
                  <p><strong>2. Certificação SSL:</strong> Garantimos um checkout protegido com os mais altos certificados de segurança digital (criptografia HTTPS / SSLv3). Seus dados financeiros não permanecem em nossos servidores.</p>
                  <p><strong>3. Direitos do Cliente:</strong> Você pode, a qualquer dia e sem taxas, solicitar a exclusão integral ou cópia completa e formatada de seu histórico cadastral e de consumo em nosso e-commerce de curadoria de café.</p>
                </>
              )}

              {activePolicy === 'Política de Entrega' && (
                <>
                  <p><strong>1. Cotação por origem:</strong> O frete é calculado no checkout a partir do CEP de cada produtor responsável pelos itens.</p>
                  <p><strong>2. Prazo total:</strong> A estimativa inclui preparação, agenda de postagem do produtor, margem operacional e transporte.</p>
                  <p><strong>3. Pedidos com vários produtores:</strong> A compra é única, mas cada produtor prepara e envia seu pacote separadamente.</p>
                </>
              )}

              {activePolicy === 'Trocas e Devoluções' && (
                <>
                  <p><strong>1. Direito de Arrependimento:</strong> Respeitamos integralmente o artigo 49 do Código de Defesa do Consumidor brasileiro. Você possui 7 dias corridos após a recepção para desistir da compra.</p>
                  <p><strong>2. Condições para Café:</strong> Sendo um produto alimentício sensível e perecível, o café de experiência tradicional ou especial só será elegível para troca caso a embalagem com válvula permaneça totalmente intacta, sem sinais de abertura ou violação que degradem as propriedades sensoriais orgânicas.</p>
                  <p><strong>3. Acessórios e Utensílios:</strong> Moedores, chaleiras e balanças não podem conter sinais de uso culinário prévio e devem ser despachados de volta acompanhados de suas caixas originais protetoras.</p>
                </>
              )}

            </div>

            <div className="pt-4 border-t border-brand-beige/50 text-right">
              <button
                onClick={() => setActivePolicy(null)}
                className="px-5 py-2 rounded-lg bg-brand-brown-850 hover:bg-brand-brown-700 text-brand-cream-light text-xs font-semibold uppercase tracking-wider cursor-pointer"
              >
                Compreendi
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
