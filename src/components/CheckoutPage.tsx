import React, { useState, useMemo } from 'react';
import { CartItem } from '../types';
import { requestShippingQuotes, ShippingQuoteGroup } from '../lib/shipping';
import { createOrder, CreatedOrder } from '../lib/orders';
import { createOrderPayment, CreatedPayment, CheckoutPaymentMethod } from '../lib/payments';
import { 
  ShieldCheck, Check, Copy, CreditCard, ExternalLink, QrCode, 
  MapPin, ShoppingBag, Truck, Lock, ArrowLeft 
} from 'lucide-react';

interface CheckoutPageProps {
  cart: CartItem[];
  onPageChange: (page: string) => void;
  onClearCart: () => void;
}

export default function CheckoutPage({ cart, onPageChange, onClearCart }: CheckoutPageProps) {
  
  // Checkout details form state
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  
  // Delivery address states
  const [cep, setCep] = useState('');
  const [rua, setRua] = useState('');
  const [num, setNum] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('SP');
  const [complemento, setComplemento] = useState('');

  // Billing address match checkbox
  const [sameAddress, setSameAddress] = useState(true);

  // Billing Address States (when sameAddress is false)
  const [billingCep, setBillingCep] = useState('');
  const [billingRua, setBillingRua] = useState('');
  const [billingNum, setBillingNum] = useState('');
  const [billingBairro, setBillingBairro] = useState('');
  const [billingCidade, setBillingCidade] = useState('');
  const [billingEstado, setBillingEstado] = useState('SP');

  // checkout submission success states
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccessful, setOrderSuccessful] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<CreatedOrder | null>(null);
  const [createdPayment, setCreatedPayment] = useState<CreatedPayment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>('PIX');
  const [pixCopied, setPixCopied] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [shippingGroups, setShippingGroups] = useState<ShippingQuoteGroup[]>([]);
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<Record<string, string>>({});
  const [shippingProvider, setShippingProvider] = useState<'mock' | 'melhor_envio' | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');

  // Summarize prices
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.priceTotal, 0);
  }, [cart]);

  const selectedShippingOptions = useMemo(() => shippingGroups.flatMap((group) => {
    const selectedQuoteId = selectedQuoteIds[group.producerId];
    const selectedOption = group.options.find((option) => option.quoteId === selectedQuoteId);
    return selectedOption ? [selectedOption] : [];
  }), [shippingGroups, selectedQuoteIds]);

  const frete = useMemo(
    () => selectedShippingOptions.reduce((total, option) => total + option.priceCents, 0) / 100,
    [selectedShippingOptions],
  );

  const totalFinal = subtotal + frete;

  // Simulate CPF format or cep lookups
  const handleCepBlur = async (val: string, type: 'delivery' | 'billing') => {
    const cleanCep = val.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      // Pre-fill mock data for real lookups simulation
      if (type === 'delivery') {
        setRua('Alameda das Araucárias');
        setBairro('Jardim das Flores');
        setCidade('São Paulo');
        setEstado('SP');
      } else {
        setBillingRua('Alameda das Araucárias');
        setBillingBairro('Jardim das Flores');
        setBillingCidade('São Paulo');
        setBillingEstado('SP');
      }

      if (type === 'delivery') {
        setShippingLoading(true);
        setShippingError('');
        try {
          const result = await requestShippingQuotes(cleanCep, cart);
          setShippingGroups(result.groups);
          setShippingProvider(result.provider);
          setSelectedQuoteIds(Object.fromEntries(
            result.groups.map((group) => [group.producerId, group.options[0]?.quoteId ?? '']),
          ));
        } catch (error) {
          setShippingGroups([]);
          setSelectedQuoteIds({});
          setShippingProvider(null);
          setShippingError(error instanceof Error ? error.message : 'Não foi possível calcular o frete.');
        } finally {
          setShippingLoading(false);
        }
      }
    }
  };

  const handleFinishCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setErrorText('Sua sacola de compras está vazia.');
      return;
    }
    setErrorText('');

    if (!nome || !cpf || !email || !tel || !cep || !rua || !num || !bairro || !cidade) {
      setErrorText('Por favor, preencha todos os campos obrigatórios identificados por (*).');
      return;
    }

    if (shippingGroups.length === 0 || selectedShippingOptions.length !== shippingGroups.length) {
      setErrorText('Calcule e selecione o frete de todos os produtores antes de continuar.');
      return;
    }

    setIsProcessing(true);
    try {
      const order = createdOrder ?? await createOrder({
          cart,
          customer: {
            name: nome,
            email,
            phone: tel,
            document: cpf,
          },
          shippingAddress: {
            postalCode: cep.replace(/\D/g, ''),
            street: rua,
            number: num,
            district: bairro,
            city: cidade,
            state: estado,
            complement: complemento || undefined,
            country: 'BR',
          },
          shippingQuoteSelections: shippingGroups.map((group) => ({
            producerId: group.producerId,
            quoteId: selectedQuoteIds[group.producerId],
          })),
        });
      setCreatedOrder(order);
      const payment = await createOrderPayment(order.id, order.code, paymentMethod);
      setCreatedPayment(payment);
      setOrderSuccessful(true);
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Não foi possível criar o pedido ou a cobrança.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedHomeAfterSuccess = () => {
    onClearCart();
    setOrderSuccessful(false);
    onPageChange('home');
  };

  const handleCopyPix = async () => {
    if (!createdPayment?.pixQrCode?.payload) return;
    await navigator.clipboard.writeText(createdPayment.pixQrCode.payload);
    setPixCopied(true);
  };

  if (orderSuccessful) {
    return (
      <div className="bg-brand-cream-light min-h-screen py-20 flex items-center justify-center animate-fade-in" id="checkout-success-container">
        <div className="bg-white border border-brand-beige p-10 rounded-2xl max-w-xl text-center shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-green-600/10 text-brand-green-700 flex items-center justify-center mx-auto scale-105">
            <Check className="w-9 h-9" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-gold font-mono leading-none">
              {createdPayment?.sandboxMock ? 'Cobrança simulada no sandbox local' : 'Cobrança criada no Asaas Sandbox'}
            </span>
            <h1 className="font-serif text-2.5xl font-extrabold text-brand-brown-950">Pedido recebido e aguardando pagamento</h1>
            <p className="text-xs font-light text-brand-brown-750 max-w-md mx-auto leading-relaxed">
              O pedido e os envios por produtor foram registrados. O preparo será liberado automaticamente somente após a confirmação financeira recebida pelo webhook.
            </p>
          </div>

          <div className="bg-brand-cream-deep/60 p-5 rounded-xl border border-brand-beige/50 text-left text-xs font-light space-y-2 max-w-md mx-auto font-sans text-brand-brown-850">
            <p><strong>Número do Pedido:</strong> <span className="font-mono text-brand-amber-500">#{createdOrder?.code}</span></p>
            <p><strong>Destinatário:</strong> {nome}</p>
            <p><strong>Destino:</strong> {rua}, {num} - {bairro}, {cidade} - {estado}</p>
            <p><strong>Método:</strong> {createdPayment?.billingType === 'CREDIT_CARD' ? 'Cartão de crédito' : 'Pix'}</p>
            <p><strong>Status:</strong> Aguardando pagamento</p>
            <p><strong>Valor do pedido:</strong> <span className="font-bold font-mono">R$ {((createdOrder?.totalCents ?? 0) / 100).toFixed(2)}</span></p>
          </div>

          {createdPayment?.billingType === 'PIX' && createdPayment.pixQrCode && (
            <div className="bg-white border border-brand-beige rounded-xl p-5 space-y-4 max-w-md mx-auto w-full">
              <img
                src={createdPayment.pixQrCode.imageDataUrl}
                alt="QR Code Pix da cobrança"
                className="w-44 h-44 mx-auto object-contain"
              />
              <div className="text-left space-y-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-brand-brown-700">Pix copia e cola</p>
                <p className="font-mono text-[10px] break-all bg-brand-cream-deep/50 p-3 rounded-lg border border-brand-beige/50">
                  {createdPayment.pixQrCode.payload}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPix}
                className="w-full py-3 rounded-lg border border-brand-brown-850 text-brand-brown-850 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                {pixCopied ? 'Código copiado' : 'Copiar código Pix'}
              </button>
            </div>
          )}

          {createdPayment?.billingType === 'CREDIT_CARD' && (
            <div className="bg-white border border-brand-beige rounded-xl p-5 space-y-3 max-w-md mx-auto w-full text-xs text-brand-brown-750">
              <p>Os dados do cartão são informados diretamente na página segura do Asaas e não passam pela Grão &amp; Origem.</p>
              {createdPayment.invoiceUrl ? (
                <a
                  href={createdPayment.invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-lg bg-brand-brown-850 text-brand-cream-light font-bold flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir pagamento seguro no Asaas
                </a>
              ) : (
                <p className="bg-brand-cream-deep/60 border border-brand-beige/50 rounded-lg p-3">
                  O mock local registrou a cobrança. O link hospedado aparece quando `PAYMENT_PROVIDER=asaas` estiver ativo.
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleProceedHomeAfterSuccess}
            className="px-8 py-3.5 rounded-xl bg-brand-brown-850 hover:bg-brand-brown-700 text-brand-cream-light text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            id="checkout-success-home-btn"
          >
            Voltar para a Página Inicial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-cream-light min-h-screen py-12 animate-fade-in text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation title */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-beige/35">
          <button
            onClick={() => onPageChange('home')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-brown-800 hover:text-brand-gold uppercase tracking-wider cursor-pointer"
            id="checkout-abort-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuar Comprando
          </button>
          
          <div className="flex items-center gap-1.5 text-xs text-brand-brown-600 font-light">
            <Lock className="w-4 h-4 text-brand-gold animate-pulse" />
            <span>Ambiente Criptografado SSL Seguros</span>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-gold-light/40 flex items-center justify-center text-brand-brown-600 mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-lg font-bold text-brand-brown-950">Seu checkout está desativado</h2>
            <p className="text-xs font-light text-brand-brown-750">Adicione algum café tradicional, especial ou equipamento ao cesto de compras antes de formalizar seu pagamento.</p>
            <button
              onClick={() => onPageChange('tradicionais')}
              className="px-6 py-2.5 rounded-lg bg-brand-brown-850 text-brand-cream-light text-xs font-bold"
            >
              Explorar Cafés
            </button>
          </div>
        ) : (
          <form onSubmit={handleFinishCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* LFT: Order input forms (8 Columns) */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8">
              
              {errorText && (
                <div className="p-3.5 bg-red-100 border border-red-300 rounded-lg text-xs font-semibold text-red-700">
                  {errorText}
                </div>
              )}

              {/* 1. Personal Informações */}
              <div className="bg-white rounded-xl border border-brand-beige p-6 space-y-4">
                <h3 className="font-serif text-base font-bold text-brand-brown-950 border-b border-brand-beige/35 pb-2">1. Dados do Comprador</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-nome">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Maria Alice Ferreira"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="chk-nome"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-cpf">CPF do Titular *</label>
                    <input
                      type="text"
                      required
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden font-mono"
                      id="chk-cpf"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-email">E-mail de Cadastro *</label>
                    <input
                      type="email"
                      required
                      placeholder="maria@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="chk-email"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-tel">WhatsApp / Celular *</label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 97777-6666"
                      value={tel}
                      onChange={(e) => setTel(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="chk-tel"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address (Endereço de Entrega) */}
              <div className="bg-white rounded-xl border border-brand-beige p-6 space-y-4">
                <h3 className="font-serif text-base font-bold text-brand-brown-950 border-b border-brand-beige/35 pb-2">2. Endereço para Entrega</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-cep">CEP *</label>
                    <input
                      type="text"
                      required
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => {
                        setCep(e.target.value);
                        setShippingGroups([]);
                        setSelectedQuoteIds({});
                        setShippingProvider(null);
                        setShippingError('');
                      }}
                      onBlur={(e) => handleCepBlur(e.target.value, 'delivery')}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden font-mono"
                      id="chk-cep"
                    />
                  </div>
                  
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-rua">Logradouro / Rua *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Alameda das Hortênsias"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="chk-rua"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-num">Número *</label>
                    <input
                      type="text"
                      required
                      placeholder="100"
                      value={num}
                      onChange={(e) => setNum(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden font-mono"
                      id="chk-num"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-compl">Complemento</label>
                    <input
                      type="text"
                      placeholder="Apto 15, Bloco B"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="chk-compl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-bairro">Bairro *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Centro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="chk-bairro"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="chk-cidade">Cidade *</label>
                    <input
                      type="text"
                      required
                      placeholder="Serrinha"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                      id="chk-cidade"
                    />
                  </div>
                </div>

                {/* Billing Match Checkbox */}
                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="billing-match"
                    checked={sameAddress}
                    onChange={(e) => setSameAddress(e.target.checked)}
                    className="accent-brand-gold h-4 w-4 border-brand-beige"
                  />
                  <label htmlFor="billing-match" className="text-xs font-light text-brand-brown-800">
                    O endereço de cobrança é o mesmo endereço de entrega
                  </label>
                </div>
              </div>

              {/* Endereço de Cobrança (Only if sameAddress is false) */}
              {!sameAddress && (
                <div className="bg-white rounded-xl border border-brand-beige p-6 space-y-4 animate-fade-in" id="billing-addr-block">
                  <h3 className="font-serif text-base font-bold text-brand-brown-950 border-b border-brand-beige/35 pb-2">Endereço de Cobrança</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="bil-cep">CEP *</label>
                      <input
                        type="text"
                        required
                        placeholder="00000-000"
                        value={billingCep}
                        onChange={(e) => setBillingCep(e.target.value)}
                        onBlur={(e) => handleCepBlur(e.target.value, 'billing')}
                        className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden font-mono"
                        id="bil-cep"
                      />
                    </div>
                    
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="bil-rua">Logradouro / Rua *</label>
                      <input
                        type="text"
                        required
                        placeholder="Logradouro"
                        value={billingRua}
                        onChange={(e) => setBillingRua(e.target.value)}
                        className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                        id="bil-rua"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="bil-num">Número *</label>
                      <input
                        type="text"
                        required
                        placeholder="100"
                        value={billingNum}
                        onChange={(e) => setBillingNum(e.target.value)}
                        className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden font-mono"
                        id="bil-num"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="bil-bairro">Bairro *</label>
                      <input
                        type="text"
                        required
                        placeholder="Bairro"
                        value={billingBairro}
                        onChange={(e) => setBillingBairro(e.target.value)}
                        className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                        id="bil-bairro"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-brown-700 uppercase" htmlFor="bil-cidade">Cidade *</label>
                      <input
                        type="text"
                        required
                        placeholder="Cidade"
                        value={billingCidade}
                        onChange={(e) => setBillingCidade(e.target.value)}
                        className="w-full bg-brand-cream-deep/30 border border-brand-beige rounded-lg px-3.5 py-2 text-xs text-brand-brown-900 focus:outline-hidden"
                        id="bil-cidade"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Frete por produtor */}
              <div className="bg-white rounded-xl border border-brand-beige p-6 space-y-5">
                <div className="flex items-center justify-between gap-4 border-b border-brand-beige/35 pb-2">
                  <h3 className="font-serif text-base font-bold text-brand-brown-950">3. Opções de Entrega</h3>
                  {shippingProvider && (
                    <span className="text-[9px] uppercase tracking-wider font-bold text-brand-green-700">
                      {shippingProvider === 'mock' ? 'Simulação sandbox' : 'Melhor Envio sandbox'}
                    </span>
                  )}
                </div>

                {shippingLoading && (
                  <div className="flex items-center gap-2 text-xs text-brand-brown-700">
                    <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                    Calculando opções para cada produtor...
                  </div>
                )}

                {!shippingLoading && shippingGroups.length === 0 && !shippingError && (
                  <p className="text-xs font-light text-brand-brown-700">
                    Informe um CEP válido para calcular o frete com a origem de cada produtor.
                  </p>
                )}

                {shippingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                    {shippingError}
                  </div>
                )}

                <div className="space-y-4">
                  {shippingGroups.map((group) => (
                    <div key={group.producerId} className="rounded-xl border border-brand-beige/70 p-4 space-y-3 bg-brand-cream-deep/25">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-brand-gold" />
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-brand-brown-600 font-bold">Envio independente</p>
                          <p className="text-xs font-semibold text-brand-brown-950">{group.producerName}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {group.options.map((option) => {
                          const checked = selectedQuoteIds[group.producerId] === option.quoteId;
                          const label = option.label === 'FAST' ? 'Mais rápido' : option.label === 'RECOMMENDED' ? 'Recomendado' : 'Econômico';

                          return (
                            <label
                              key={option.quoteId}
                              className={`cursor-pointer rounded-lg border p-3 flex gap-3 items-start transition-colors ${
                                checked
                                  ? 'border-brand-gold bg-brand-gold-light/25'
                                  : 'border-brand-beige bg-white hover:bg-brand-cream-light'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`shipping-${group.producerId}`}
                                checked={checked}
                                onChange={() => setSelectedQuoteIds((current) => ({
                                  ...current,
                                  [group.producerId]: option.quoteId,
                                }))}
                                className="mt-0.5 accent-brand-gold"
                              />
                              <span className="flex-1 min-w-0">
                                <span className="flex justify-between gap-2 text-xs font-bold text-brand-brown-950">
                                  <span>{label}</span>
                                  <span className="font-mono">R$ {(option.priceCents / 100).toFixed(2)}</span>
                                </span>
                                <span className="block mt-1 text-[10px] text-brand-brown-600">
                                  Até {option.totalPromiseDays} dias • {option.carrier}
                                </span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Meios de Pagamento */}
              <div className="bg-white rounded-xl border border-brand-beige p-6 space-y-5">
                <h3 className="font-serif text-base font-bold text-brand-brown-950 border-b border-brand-beige/35 pb-2">4. Forma de Pagamento</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('PIX')}
                    className={`py-3 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${paymentMethod === 'PIX' ? 'bg-brand-brown-850 border-brand-brown-850 text-brand-cream-light' : 'bg-white border-brand-beige text-brand-brown-700'}`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pix</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CREDIT_CARD')}
                    className={`py-3 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer ${paymentMethod === 'CREDIT_CARD' ? 'bg-brand-brown-850 border-brand-brown-850 text-brand-cream-light' : 'bg-white border-brand-beige text-brand-brown-700'}`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Cartão de crédito</span>
                  </button>
                </div>

                <div className="p-4 bg-brand-cream-deep/40 rounded-xl border border-brand-beige/50 text-xs text-center space-y-2" id="pix-instruct-wrapper">
                  <p className="text-brand-brown-900 font-semibold uppercase tracking-wider text-[10px]">
                    {paymentMethod === 'PIX' ? 'QR Code gerado após criar o pedido' : 'Pagamento hospedado pelo Asaas'}
                  </p>
                  <p className="text-[11px] text-brand-brown-750 font-light max-w-md mx-auto leading-relaxed">
                    {paymentMethod === 'PIX'
                      ? 'A confirmação do Pix chega por webhook e libera todos os subpedidos de uma só vez.'
                      : 'Você será direcionado à página segura do Asaas; nenhum dado de cartão é coletado nesta loja.'}
                  </p>
                </div>
              </div>

            </div>

            {/* RGT: Cart Summary Panel (4 Columns) */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <div className="bg-brand-cream-deep/70 border border-brand-beige rounded-xl p-6 lg:sticky lg:top-24 max-h-[calc(100vh-140px)] overflow-y-auto space-y-5">
                <h3 className="font-serif text-base font-bold text-brand-brown-950 border-b border-brand-beige/35 pb-2">Resumo da Compra</h3>
                
                {/* List item components in cart */}
                <div className="space-y-4 max-h-60 overflow-y-auto divide-y divide-brand-beige/25">
                  {cart.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex gap-3 text-xs">
                      <img
                        src={item.productType === 'cafe' ? item.cafeDetails?.image : item.equipamentoDetails?.image}
                        alt={item.productType === 'cafe' ? item.cafeDetails?.name : item.equipamentoDetails?.name}
                        className="w-10 h-10 rounded-md object-cover border border-brand-beige/60 shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0 font-light flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-brand-brown-900 truncate">
                            {item.productType === 'cafe' ? item.cafeDetails?.name : item.equipamentoDetails?.name}
                          </p>
                          {item.productType === 'cafe' && (
                            <p className="text-[10px] text-brand-brown-600 truncate mt-0.5 leading-none">
                              {item.cafeDetails?.type} • {item.cafeDetails?.weight}g {item.cafeDetails?.roast && `• Torra ${item.cafeDetails?.roast}`}
                            </p>
                          )}
                          {item.productType === 'equipamento' && (
                            <p className="text-[10px] text-brand-brown-600 truncate mt-0.5 leading-none">Acessório</p>
                          )}
                        </div>
                        
                        <p className="text-[10px] text-brand-brown-500 mt-1">Qtde: {item.quantity}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-brand-brown-950 block font-mono">R$ {item.priceTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-brand-beige/40 space-y-2 text-xs font-light text-brand-brown-800">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold">R$ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete Contratado</span>
                    {shippingLoading ? (
                      <span className="text-brand-brown-600 text-[10px]">Calculando...</span>
                    ) : selectedShippingOptions.length === 0 ? (
                      <span className="text-brand-brown-600 text-[10px]">Informe o CEP</span>
                    ) : frete === 0 ? (
                      <span className="text-brand-green-700 font-bold uppercase text-[10px]">Grátis</span>
                    ) : (
                      <span className="font-mono">R$ {frete.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <div className="h-px bg-brand-beige/40 my-2" />
                  
                  <div className="flex justify-between items-baseline font-serif text-base font-bold text-brand-brown-950">
                    <span>Total Final</span>
                    <span className="font-serif text-lg font-bold font-mono">R$ {totalFinal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Secure check markers */}
                <div className="text-[10px] text-brand-brown-700/80 bg-white/50 p-3 rounded-lg border border-brand-beige/20 space-y-2 font-light">
                  <div className="flex gap-2 items-center">
                    <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
                    <span>Seus dados pessoais estão protegidos</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <ShieldCheck className="w-4 h-4 text-brand-gold shrink-0" />
                    <span>Embalagens seladas com proteção aromática</span>
                  </div>
                </div>

                {/* Finish action button */}
                <button
                  type="submit"
                  disabled={isProcessing || shippingLoading || selectedShippingOptions.length !== shippingGroups.length || shippingGroups.length === 0}
                  className="w-full py-4 rounded-xl bg-brand-brown-850 hover:bg-brand-brown-700 text-brand-cream-light font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-brand-brown-600 disabled:cursor-not-allowed transition-all"
                  id="checkout-trigger-submit-btn"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-cream-light border-t-transparent rounded-full animate-spin" />
                      <span>{createdOrder ? 'Gerando cobrança...' : 'Criando pedido e cobrança...'}</span>
                    </div>
                  ) : (
                    <span>{createdOrder ? 'Tentar gerar cobrança novamente' : 'Criar pedido e pagar'}</span>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
