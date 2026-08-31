import React from 'react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.priceTotal, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-modal="true" role="dialog">
      {/* Black backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-brand-cream-light border-l border-brand-beige shadow-2xl flex flex-col h-full">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-brand-beige/50 bg-brand-cream-deep/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-brown-800" />
              <h2 className="font-serif text-lg font-bold text-brand-brown-950">Seu Carrinho</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-brand-brown-700 hover:text-brand-brown-950 hover:bg-brand-beige/40 transition-colors"
              id="close-cart-btn"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-brand-beige/30">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-2/3 text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-gold-light/40 flex items-center justify-center text-brand-brown-600/85">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-serif text-base font-bold text-brand-brown-900">Seu carrinho está vazio</p>
                  <p className="text-xs text-brand-brown-700/70 max-w-xs mt-1">
                    Que tal saborear cafés selecionados de produtores brasileiros excepcionais? Navegue pela nossa loja.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="px-6 py-2 rounded-full bg-brand-brown-800 text-brand-cream-light text-xs font-semibold hover:bg-brand-brown-700 transition-colors"
                >
                  Continuar navegando
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Image */}
                  <img
                    src={item.productType === 'cafe' ? item.cafeDetails?.image : item.equipamentoDetails?.image}
                    alt={item.productType === 'cafe' ? item.cafeDetails?.name : item.equipamentoDetails?.name}
                    className="w-16 h-16 rounded-md object-cover border border-brand-beige shrink-0"
                  />

                  {/* Description Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-brand-brown-950 truncate">
                        {item.productType === 'cafe' ? item.cafeDetails?.name : item.equipamentoDetails?.name}
                      </h4>
                      
                      {item.productType === 'cafe' && item.cafeDetails && (
                        <p className="text-[10px] text-brand-brown-700 font-light mt-0.5 leading-tight">
                          {item.cafeDetails.type} • {item.cafeDetails.weight}g
                          {item.cafeDetails.roast && ` • Torra ${item.cafeDetails.roast}`}
                        </p>
                      )}
                      {item.productType === 'equipamento' && (
                        <p className="text-[10px] text-brand-brown-600 font-light mt-0.5 leading-tight">
                          Equipamento de Preparo
                        </p>
                      )}
                    </div>

                    {/* Quantity Selector & Trash */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-brand-beige rounded-md overflow-hidden bg-white/70">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 px-2 text-brand-brown-700 hover:bg-brand-beige/30 text-xs"
                          aria-label="Diminuir quantidade"
                          id={`qty-dec-${item.id}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-brand-brown-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 px-2 text-brand-brown-700 hover:bg-brand-beige/30 text-xs"
                          aria-label="Aumentar quantidade"
                          id={`qty-inc-${item.id}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-brand-brown-600 hover:text-red-600 transition-colors"
                        aria-label="Excluir item"
                        id={`delete-item-${item.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex flex-col justify-between items-end">
                    <span className="text-xs font-bold text-brand-brown-950">
                      R$ {item.priceTotal.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-brand-brown-600/70">
                      Un: R$ {item.priceUnit.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & CTA bottom */}
          {cart.length > 0 && (
            <div className="border-t border-brand-beige/60 bg-brand-cream-deep/75 px-6 py-6 space-y-4">
              
              <div className="text-[11px] text-brand-brown-700 text-center">
                O frete será calculado no checkout usando o CEP e a origem de cada produtor.
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-brand-brown-800">
                  <span>Subtotal</span>
                  <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-brown-800">
                  <span>Frete estimado</span>
                  <span className="text-[10px]">Calculado no checkout</span>
                </div>
                <div className="h-px bg-brand-beige/50 my-2" />
                <div className="flex justify-between items-baseline">
                  <span className="font-serif text-sm font-bold text-brand-brown-950">Produtos</span>
                  <span className="font-serif text-lg font-bold text-brand-brown-950">R$ {subtotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Action checkout button */}
              <button
                onClick={onCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-brown-850 hover:bg-brand-brown-700 transition-colors text-brand-cream-light font-bold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-md"
                id="drawer-checkout-button"
              >
                Concluir e Finalizar Compra
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="w-full text-center text-xs text-brand-brown-700 hover:text-brand-brown-900 font-medium cursor-pointer"
              >
                Continuar comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
