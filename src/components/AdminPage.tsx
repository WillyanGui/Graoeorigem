import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Box,
  Check,
  CheckCircle2,
  ChevronRight,
  Coffee,
  CreditCard,
  Lock,
  LayoutDashboard,
  Package,
  Plus,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from 'lucide-react';
import { coffeesData } from '../data/coffees';
import { equipmentsData } from '../data/equipments';
import { kitsData } from '../data/kits';

type AdminTab = 'overview' | 'products' | 'orders' | 'customers' | 'settings';
type ProductFilter = 'all' | 'traditional' | 'specialty' | 'equipment' | 'kit';

interface AdminOverview {
  tenant: {
    id?: string;
    slug: string;
    name: string;
    segment?: string;
    status: string;
    themeSettings?: {
      logoUrl?: string | null;
      primaryColor: string;
      accentColor: string;
      backgroundColor: string;
      surfaceColor: string;
    } | null;
  };
  metrics: {
    products: number;
    customers: number;
    orders: number;
    subscriptions: number;
  };
  paymentProvider: {
    status: string;
    provider: string;
    message: string;
  };
}

interface AdminProduct {
  id: string;
  legacyId?: number;
  type: 'COFFEE' | 'EQUIPMENT' | 'KIT';
  status: string;
  name: string;
  description: string;
  price: number;
  priceCents?: number;
  image: string;
  stockQuantity?: number;
  category?: string;
  aroma?: string;
  sabor?: string;
  acidez?: string;
  corpo?: string;
  notasMarcantes?: string[];
  produtor?: string;
  fazenda?: string;
  safra?: string;
  localizacao?: string;
  processo?: string;
  variedade?: string;
  altitude?: string;
  pontuacao?: number;
  sommelierComment?: string;
  specs?: string[];
  objective?: string;
  howToUse?: string;
  itemsIncluded?: string[];
}

interface ProductFormState {
  id?: string;
  name: string;
  type: AdminProduct['type'];
  status: string;
  description: string;
  price: string;
  stockQuantity: string;
  image: string;
  category: string;
  aroma: string;
  sabor: string;
  acidez: string;
  corpo: string;
  notasMarcantes: string;
  produtor: string;
  fazenda: string;
  safra: string;
  localizacao: string;
  processo: string;
  variedade: string;
  altitude: string;
  pontuacao: string;
  sommelierComment: string;
  specs: string;
  objective: string;
  howToUse: string;
  itemsIncluded: string;
}

interface AdminOrder {
  id: string;
  code: string;
  status: string;
  totalCents: number;
  createdAt: string;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    document?: string;
  } | null;
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPriceCents?: number;
    totalCents: number;
  }>;
  payments?: Array<{
    id: string;
    provider: string;
    status: string;
  }>;
  shippingAddress?: Record<string, unknown> | null;
  notes?: string | null;
}

interface AdminCustomer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  document?: string | null;
  createdAt: string;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt?: string | null;
  lastOrderStatus?: string | null;
}

interface SettingsFormState {
  displayName: string;
  segment: string;
  status: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
}

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:3333';
const tenantSlug = 'grao-origem';
const adminSessionKey = 'grao_origem_admin_session';
const adminTokenKey = 'grao_origem_admin_token';
const adminUsername = 'grãoecafe';
const adminPassword = '123';
const allowLocalAdminFallback = import.meta.env.DEV;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const fallbackProducts: AdminProduct[] = [
  ...coffeesData.map((coffee) => ({
    id: `coffee-${coffee.id}`,
    legacyId: coffee.id,
    type: 'COFFEE' as const,
    status: 'ACTIVE',
    name: coffee.name,
    description: coffee.description,
    price: coffee.priceBase,
    image: coffee.image,
    stockQuantity: 100,
    category: coffee.category,
  })),
  ...equipmentsData.map((equipment) => ({
    id: `equipment-${equipment.id}`,
    legacyId: equipment.id,
    type: 'EQUIPMENT' as const,
    status: 'ACTIVE',
    name: equipment.name,
    description: equipment.description,
    price: equipment.price,
    image: equipment.image,
    stockQuantity: 30,
  })),
  ...kitsData.map((kit) => ({
    id: `kit-${kit.id}`,
    legacyId: kit.id,
    type: 'KIT' as const,
    status: 'ACTIVE',
    name: kit.name,
    description: kit.description,
    price: kit.price,
    image: kit.image,
    stockQuantity: 20,
  })),
];

const fallbackOverview: AdminOverview = {
  tenant: {
    slug: tenantSlug,
    name: 'Grao & Origem',
    status: 'TRIAL',
  },
  metrics: {
    products: fallbackProducts.length,
    customers: 0,
    orders: 0,
    subscriptions: 0,
  },
  paymentProvider: {
    status: 'pending',
    provider: 'PENDING',
    message: 'Metodo de pagamento ainda nao configurado.',
  },
};

const emptyProductForm: ProductFormState = {
  name: '',
  type: 'COFFEE',
  status: 'ACTIVE',
  description: '',
  price: '',
  stockQuantity: '0',
  image: '',
  category: 'tradicional',
  aroma: '',
  sabor: '',
  acidez: '',
  corpo: '',
  notasMarcantes: '',
  produtor: '',
  fazenda: '',
  safra: '',
  localizacao: '',
  processo: '',
  variedade: '',
  altitude: '',
  pontuacao: '',
  sommelierComment: '',
  specs: '',
  objective: '',
  howToUse: '',
  itemsIncluded: '',
};

const defaultSettingsForm: SettingsFormState = {
  displayName: fallbackOverview.tenant.name,
  segment: 'cafes-especiais',
  status: 'TRIAL',
  logoUrl: '',
  primaryColor: '#24130E',
  accentColor: '#C5A059',
  backgroundColor: '#FCFAF7',
  surfaceColor: '#FAF6F0',
};

const tabItems: Array<{ id: AdminTab; label: string; icon: React.ElementType }> = [
  { id: 'overview', label: 'Visao', icon: LayoutDashboard },
  { id: 'products', label: 'Produtos', icon: Package },
  { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'settings', label: 'Loja', icon: Settings },
];

function metricItems(overview: AdminOverview) {
  return [
    {
      label: 'Produtos',
      value: overview.metrics.products,
      icon: Package,
    },
    {
      label: 'Clientes',
      value: overview.metrics.customers,
      icon: Users,
    },
    {
      label: 'Pedidos',
      value: overview.metrics.orders,
      icon: ShoppingBag,
    },
    {
      label: 'Assinaturas',
      value: overview.metrics.subscriptions,
      icon: CreditCard,
    },
  ];
}

function productTypeLabel(type: AdminProduct['type']) {
  if (type === 'COFFEE') return 'Cafe';
  if (type === 'EQUIPMENT') return 'Equipamento';
  return 'Kit';
}

function productCadastroLabel(product: Pick<AdminProduct, 'type' | 'category'>) {
  if (product.type === 'COFFEE') {
    return product.category === 'especial' ? 'Cafe especial' : 'Cafe tradicional';
  }

  return productTypeLabel(product.type);
}

function productFormCadastroValue(form: ProductFormState) {
  if (form.type === 'COFFEE') {
    return form.category === 'especial' ? 'COFFEE_SPECIALTY' : 'COFFEE_TRADITIONAL';
  }

  return form.type;
}

function applyCadastroType(value: string): Pick<ProductFormState, 'type' | 'category'> {
  if (value === 'COFFEE_SPECIALTY') {
    return { type: 'COFFEE', category: 'especial' };
  }

  if (value === 'EQUIPMENT') {
    return { type: 'EQUIPMENT', category: 'tradicional' };
  }

  if (value === 'KIT') {
    return { type: 'KIT', category: 'tradicional' };
  }

  return { type: 'COFFEE', category: 'tradicional' };
}

const orderStatuses = [
  'PAYMENT_PENDING',
  'PAID',
  'FULFILLMENT_PENDING',
  'SHIPPED',
  'DELIVERED',
  'CANCELED',
];

const productFilterItems: Array<{ id: ProductFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'traditional', label: 'Cafe tradicional' },
  { id: 'specialty', label: 'Cafe especial' },
  { id: 'equipment', label: 'Equipamentos' },
  { id: 'kit', label: 'Kits' },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem(adminTokenKey))
      || (allowLocalAdminFallback && localStorage.getItem(adminSessionKey) === 'authenticated');
  });
  const [login, setLogin] = useState({
    username: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [productFilter, setProductFilter] = useState<ProductFilter>('all');
  const [overview, setOverview] = useState<AdminOverview>(fallbackOverview);
  const [products, setProducts] = useState<AdminProduct[]>(fallbackProducts);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [productMessage, setProductMessage] = useState('');
  const [productError, setProductError] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [settingsForm, setSettingsForm] = useState<SettingsFormState>(defaultSettingsForm);
  const [settingsMessage, setSettingsMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    async function loadAdminData() {
      setIsLoading(true);

      try {
        const authHeaders = {
          Authorization: `Bearer ${localStorage.getItem(adminTokenKey) ?? ''}`,
        };
        const [overviewResponse, productsResponse, ordersResponse, customersResponse] = await Promise.all([
          fetch(`${apiUrl}/api/admin/overview?tenant=${tenantSlug}`, {
            headers: authHeaders,
          }),
          fetch(`${apiUrl}/api/admin/products?tenant=${tenantSlug}`, {
            headers: authHeaders,
          }),
          fetch(`${apiUrl}/api/admin/orders?tenant=${tenantSlug}`, {
            headers: authHeaders,
          }),
          fetch(`${apiUrl}/api/admin/customers?tenant=${tenantSlug}`, {
            headers: authHeaders,
          }),
        ]);

        if (!overviewResponse.ok || !productsResponse.ok || !ordersResponse.ok || !customersResponse.ok) {
          throw new Error('Admin API unavailable');
        }

        const [overviewData, productsData, ordersData, customersData] = await Promise.all([
          overviewResponse.json(),
          productsResponse.json(),
          ordersResponse.json(),
          customersResponse.json(),
        ]);

        if (isMounted) {
          setOverview(overviewData);
          setProducts(productsData);
          setOrders(ordersData);
          setCustomers(customersData);
          setSettingsForm({
            displayName: overviewData.tenant.name ?? defaultSettingsForm.displayName,
            segment: overviewData.tenant.segment ?? defaultSettingsForm.segment,
            status: overviewData.tenant.status ?? defaultSettingsForm.status,
            logoUrl: overviewData.tenant.themeSettings?.logoUrl ?? '',
            primaryColor: overviewData.tenant.themeSettings?.primaryColor ?? defaultSettingsForm.primaryColor,
            accentColor: overviewData.tenant.themeSettings?.accentColor ?? defaultSettingsForm.accentColor,
            backgroundColor: overviewData.tenant.themeSettings?.backgroundColor ?? defaultSettingsForm.backgroundColor,
            surfaceColor: overviewData.tenant.themeSettings?.surfaceColor ?? defaultSettingsForm.surfaceColor,
          });
          setIsApiConnected(true);
        }
      } catch {
        if (isMounted) {
          setOverview(fallbackOverview);
          setProducts(fallbackProducts);
          setOrders([]);
          setCustomers([]);
          setSettingsForm(defaultSettingsForm);
          setIsApiConnected(false);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAdminData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const groupedProducts = useMemo(() => {
    return {
      traditionalCoffees: products.filter((product) => product.type === 'COFFEE' && product.category !== 'especial').length,
      specialtyCoffees: products.filter((product) => product.type === 'COFFEE' && product.category === 'especial').length,
      equipments: products.filter((product) => product.type === 'EQUIPMENT').length,
      kits: products.filter((product) => product.type === 'KIT').length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (productFilter === 'traditional') {
      return products.filter((product) => product.type === 'COFFEE' && product.category !== 'especial');
    }

    if (productFilter === 'specialty') {
      return products.filter((product) => product.type === 'COFFEE' && product.category === 'especial');
    }

    if (productFilter === 'equipment') {
      return products.filter((product) => product.type === 'EQUIPMENT');
    }

    if (productFilter === 'kit') {
      return products.filter((product) => product.type === 'KIT');
    }

    return products;
  }, [productFilter, products]);

  const startNewProduct = () => {
    setProductForm(emptyProductForm);
    setProductMessage('');
    setProductError('');
    setIsProductModalOpen(true);
  };

  const startEditProduct = (product: AdminProduct) => {
    setProductForm({
      id: product.id,
      name: product.name,
      type: product.type,
      status: product.status,
      description: product.description,
      price: String(product.price),
      stockQuantity: String(product.stockQuantity ?? 0),
      image: product.image,
      category: product.category ?? 'tradicional',
      aroma: product.aroma ?? '',
      sabor: product.sabor ?? '',
      acidez: product.acidez ?? '',
      corpo: product.corpo ?? '',
      notasMarcantes: product.notasMarcantes?.join(', ') ?? '',
      produtor: product.produtor ?? '',
      fazenda: product.fazenda ?? '',
      safra: product.safra ?? '',
      localizacao: product.localizacao ?? '',
      processo: product.processo ?? '',
      variedade: product.variedade ?? '',
      altitude: product.altitude ?? '',
      pontuacao: product.pontuacao ? String(product.pontuacao) : '',
      sommelierComment: product.sommelierComment ?? '',
      specs: product.specs?.join('\n') ?? '',
      objective: product.objective ?? '',
      howToUse: product.howToUse ?? '',
      itemsIncluded: product.itemsIncluded?.join('\n') ?? '',
    });
    setProductMessage('');
    setProductError('');
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductError('');
    setProductMessage('');

    const payload = {
      name: productForm.name.trim(),
      type: productForm.type,
      status: productForm.status,
      description: productForm.description.trim(),
      price: Number(productForm.price.replace(',', '.')),
      stockQuantity: Number(productForm.stockQuantity),
      image: productForm.image.trim(),
      category: productForm.category,
      aroma: productForm.aroma.trim(),
      sabor: productForm.sabor.trim(),
      acidez: productForm.acidez.trim(),
      corpo: productForm.corpo.trim(),
      notasMarcantes: productForm.notasMarcantes
        .split(',')
        .map((note) => note.trim())
        .filter(Boolean),
      produtor: productForm.produtor.trim(),
      fazenda: productForm.fazenda.trim(),
      safra: productForm.safra.trim(),
      localizacao: productForm.localizacao.trim(),
      processo: productForm.processo.trim(),
      variedade: productForm.variedade.trim(),
      altitude: productForm.altitude.trim(),
      pontuacao: productForm.pontuacao ? Number(productForm.pontuacao.replace(',', '.')) : undefined,
      sommelierComment: productForm.sommelierComment.trim(),
      specs: productForm.specs.split('\n').map((line) => line.trim()).filter(Boolean),
      objective: productForm.objective.trim(),
      howToUse: productForm.howToUse.trim(),
      itemsIncluded: productForm.itemsIncluded.split('\n').map((line) => line.trim()).filter(Boolean),
    };

    if (!payload.name) {
      setProductError('Informe o nome do produto.');
      return;
    }

    if (Number.isNaN(payload.price) || payload.price < 0) {
      setProductError('Informe um preco valido.');
      return;
    }

    setIsSavingProduct(true);

    try {
      if (isApiConnected) {
        const response = await fetch(
          productForm.id
            ? `${apiUrl}/api/admin/products/${productForm.id}?tenant=${tenantSlug}`
            : `${apiUrl}/api/admin/products?tenant=${tenantSlug}`,
          {
            method: productForm.id ? 'PATCH' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem(adminTokenKey) ?? ''}`,
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error('Falha ao salvar produto.');
        }

        const savedProduct = await response.json();

        setProducts((current) => {
          if (productForm.id) {
            return current.map((product) => (product.id === savedProduct.id ? savedProduct : product));
          }

          return [savedProduct, ...current];
        });
      } else {
        const fallbackProduct: AdminProduct = {
          id: productForm.id ?? `local-${Date.now()}`,
          type: payload.type,
          status: payload.status,
          name: payload.name,
          description: payload.description,
          price: payload.price,
          image: payload.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600',
          stockQuantity: payload.stockQuantity,
          category: payload.category,
          aroma: payload.aroma,
          sabor: payload.sabor,
          acidez: payload.acidez,
          corpo: payload.corpo,
          notasMarcantes: payload.notasMarcantes,
          produtor: payload.produtor,
          fazenda: payload.fazenda,
          safra: payload.safra,
          localizacao: payload.localizacao,
          processo: payload.processo,
          variedade: payload.variedade,
          altitude: payload.altitude,
          pontuacao: payload.pontuacao,
          sommelierComment: payload.sommelierComment,
          specs: payload.specs,
          objective: payload.objective,
          howToUse: payload.howToUse,
          itemsIncluded: payload.itemsIncluded,
        };

        setProducts((current) => {
          if (productForm.id) {
            return current.map((product) => (product.id === fallbackProduct.id ? fallbackProduct : product));
          }

          return [fallbackProduct, ...current];
        });
      }

      setProductMessage(productForm.id ? 'Produto atualizado.' : 'Produto criado.');
      setProductForm(emptyProductForm);
      setIsProductModalOpen(false);
    } catch {
      setProductError('Nao foi possivel salvar o produto agora.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleOrderStatusChange = async (order: AdminOrder, status: string) => {
    const optimisticOrder = { ...order, status };
    setOrders((current) => current.map((item) => (item.id === order.id ? optimisticOrder : item)));
    setSelectedOrder((current) => (current?.id === order.id ? optimisticOrder : current));

    if (!isApiConnected) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/admin/orders/${order.id}?tenant=${tenantSlug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(adminTokenKey) ?? ''}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar pedido.');
      }

      const updatedOrder = await response.json();
      setOrders((current) => current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)));
      setSelectedOrder((current) => (current?.id === updatedOrder.id ? updatedOrder : current));
    } catch {
      setOrders((current) => current.map((item) => (item.id === order.id ? order : item)));
      setSelectedOrder((current) => (current?.id === order.id ? order : current));
    }
  };

  const handleSettingsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsMessage('');
    setSettingsError('');

    if (!settingsForm.displayName.trim()) {
      setSettingsError('Informe o nome da loja.');
      return;
    }

    setIsSavingSettings(true);

    try {
      if (!isApiConnected) {
        setOverview((current) => ({
          ...current,
          tenant: {
            ...current.tenant,
            name: settingsForm.displayName.trim(),
            segment: settingsForm.segment,
            status: settingsForm.status,
            themeSettings: {
              logoUrl: settingsForm.logoUrl || null,
              primaryColor: settingsForm.primaryColor,
              accentColor: settingsForm.accentColor,
              backgroundColor: settingsForm.backgroundColor,
              surfaceColor: settingsForm.surfaceColor,
            },
          },
        }));
        setSettingsMessage('Configuracoes salvas localmente.');
        return;
      }

      const response = await fetch(`${apiUrl}/api/admin/tenant/settings?tenant=${tenantSlug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem(adminTokenKey) ?? ''}`,
        },
        body: JSON.stringify(settingsForm),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar loja.');
      }

      const updatedTenant = await response.json();
      setOverview((current) => ({
        ...current,
        tenant: {
          ...current.tenant,
          name: updatedTenant.displayName,
          segment: updatedTenant.segment,
          status: updatedTenant.status,
          themeSettings: updatedTenant.themeSettings,
        },
      }));
      setSettingsMessage('Configuracoes da loja atualizadas.');
    } catch {
      setSettingsError('Nao foi possivel salvar as configuracoes agora.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant: tenantSlug,
          username: login.username.trim(),
          password: login.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(adminTokenKey, data.token);
        localStorage.setItem(adminSessionKey, 'authenticated');
        setIsAuthenticated(true);
        return;
      }

      if (response.status === 401) {
        setLoginError('Usuario ou senha invalidos.');
        return;
      }
    } catch {
      // Fallback local para desenvolvimento quando a API/Docker ainda nao estiverem ativos.
    }

    if (allowLocalAdminFallback && login.username.trim() === adminUsername && login.password === adminPassword) {
      localStorage.setItem(adminSessionKey, 'authenticated');
      setIsAuthenticated(true);
      setLoginError('');
      return;
    }

    setLoginError('Usuario ou senha invalidos.');
  };

  const handleLogout = () => {
    localStorage.removeItem(adminSessionKey);
    localStorage.removeItem(adminTokenKey);
    setIsAuthenticated(false);
    setLogin({
      username: '',
      password: '',
    });
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-dvh bg-brand-cream-light px-4 py-8 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md flex-col justify-center">
          <div className="rounded-lg border border-brand-beige bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-lg bg-brand-brown-850 text-brand-gold">
                <Lock className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-brand-gold">Admin SaaS</p>
                <h1 className="font-serif text-2xl font-bold text-brand-brown-950 text-balance">
                  Entrar no painel
                </h1>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit}>
              <label className="block">
                <span className="text-sm font-semibold text-brand-brown-800">Usuario</span>
                <input
                  value={login.username}
                  onChange={(event) => setLogin((current) => ({ ...current, username: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-4 py-3 text-base text-brand-brown-950 outline-none focus:border-brand-gold"
                  autoComplete="username"
                  inputMode="text"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-brand-brown-800">Senha</span>
                <input
                  value={login.password}
                  onChange={(event) => setLogin((current) => ({ ...current, password: event.target.value }))}
                  className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-4 py-3 text-base text-brand-brown-950 outline-none focus:border-brand-gold"
                  type="password"
                  autoComplete="current-password"
                />
              </label>

              {loginError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-brand-brown-850 px-4 py-3 text-sm font-bold text-brand-cream-light hover:bg-brand-brown-700"
              >
                Entrar
              </button>
            </form>

            <div className="mt-5 rounded-lg bg-brand-cream-deep p-4 text-sm text-brand-brown-700">
              <p className="font-semibold text-brand-brown-950">Acesso temporario local</p>
              <p className="mt-1 text-pretty">Depois vamos substituir por login real com API, hash de senha e sessao segura.</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-dvh bg-brand-cream-light">
      <div className="bg-brand-brown-950 text-brand-cream-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-brand-gold">
                <Store className="size-4" />
                <span className="text-xs font-semibold uppercase">Admin SaaS</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-balance mt-2">
                {overview.tenant.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-gold text-brand-brown-950 px-3 py-1 text-xs font-bold">
                  <CheckCircle2 className="size-3.5" />
                  {overview.tenant.status}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-brown-800 px-3 py-1 text-xs font-semibold text-brand-gold-light">
                  <CreditCard className="size-3.5" />
                  Pagamento pendente
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-brand-gold/30 px-3 py-2 text-xs text-brand-gold-light">
              {isApiConnected ? <CheckCircle2 className="size-4 text-brand-gold" /> : <AlertCircle className="size-4 text-brand-gold" />}
              <span>{isApiConnected ? 'API conectada' : 'Dados locais'}</span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-brand-gold/30 px-3 py-2 text-xs font-semibold text-brand-gold-light hover:bg-brand-brown-800"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-20 z-40 bg-brand-cream-light border-b border-brand-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto py-3 scrollbar-hide" aria-label="Admin">
            {tabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex min-w-24 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-brand-brown-850 text-brand-cream-light'
                      : 'bg-brand-cream-deep text-brand-brown-800 hover:bg-brand-beige/50'
                  }`}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {metricItems(overview).map((metric) => {
                const Icon = metric.icon;

                return (
                  <div key={metric.label} className="rounded-lg border border-brand-beige bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-brand-brown-700">{metric.label}</span>
                      <Icon className="size-4 text-brand-gold" />
                    </div>
                    <p className="mt-3 text-2xl font-bold tabular-nums text-brand-brown-950">{metric.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-lg border border-brand-beige bg-white p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-brand-brown-950 text-balance">Catalogo</h2>
                    <p className="mt-1 text-sm text-brand-brown-700 text-pretty">Distribuicao atual dos produtos do tenant.</p>
                  </div>
                  <BarChart3 className="size-5 text-brand-gold" />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <ProductBucket label="Tradicionais" value={groupedProducts.traditionalCoffees} icon={Coffee} />
                  <ProductBucket label="Especiais" value={groupedProducts.specialtyCoffees} icon={Coffee} />
                  <ProductBucket label="Equipamentos" value={groupedProducts.equipments} icon={Box} />
                  <ProductBucket label="Kits" value={groupedProducts.kits} icon={Package} />
                </div>
              </div>

              <div className="rounded-lg border border-brand-beige bg-brand-cream-deep p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-5 text-brand-gold" />
                  <h2 className="font-serif text-xl font-bold text-brand-brown-950 text-balance">Pagamento</h2>
                </div>
                <div className="mt-4 rounded-lg border border-brand-beige bg-white p-4">
                  <p className="text-xs font-semibold uppercase text-brand-brown-700">Provider</p>
                  <p className="mt-1 text-lg font-bold text-brand-brown-950">{overview.paymentProvider.provider}</p>
                  <p className="mt-3 text-sm text-brand-brown-700 text-pretty">{overview.paymentProvider.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold text-brand-brown-950 text-balance">Produtos</h2>
                <p className="mt-1 text-sm text-brand-brown-700 text-pretty">
                  {isLoading ? 'Carregando catalogo.' : `${filteredProducts.length} de ${products.length} itens`}
                </p>
              </div>
              <button
                type="button"
                onClick={startNewProduct}
                className="rounded-lg bg-brand-brown-850 px-4 py-2 text-sm font-semibold text-brand-cream-light hover:bg-brand-brown-700"
              >
                Novo
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto rounded-lg border border-brand-beige bg-white p-2 shadow-xs">
              {productFilterItems.map((filter) => {
                const isActive = productFilter === filter.id;

                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setProductFilter(filter.id)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-brand-brown-850 text-brand-cream-light'
                        : 'bg-brand-cream-light text-brand-brown-850 hover:bg-brand-cream-deep'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {filteredProducts.slice(0, 12).map((product) => (
                <React.Fragment key={product.id}>
                  <ProductRow product={product} onEdit={startEditProduct} />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brand-brown-950 text-balance">Pedidos</h2>
              <p className="mt-1 text-sm text-brand-brown-700 text-pretty">
                {orders.length > 0 ? `${orders.length} pedidos encontrados` : 'Nenhum pedido registrado.'}
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-lg border border-brand-beige bg-white p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-lg bg-brand-gold-light text-brand-brown-850">
                    <ShoppingBag className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-brand-brown-950 text-balance">Sem pedidos ainda</h3>
                    <p className="mt-1 text-sm text-brand-brown-700">Quando o checkout criar pedidos, eles vao aparecer aqui.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-brown-850 px-4 py-2 text-sm font-semibold text-brand-cream-light hover:bg-brand-brown-700"
                >
                  Ver produtos
                  <ChevronRight className="size-4" />
                </button>
              </div>
            ) : (
              <div className="grid gap-3">
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <OrderRow
                      order={order}
                      onOpen={setSelectedOrder}
                      onStatusChange={handleOrderStatusChange}
                    />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brand-brown-950 text-balance">Clientes</h2>
              <p className="mt-1 text-sm text-brand-brown-700 text-pretty">
                {customers.length > 0 ? `${customers.length} clientes cadastrados` : 'Nenhum cliente registrado.'}
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              {customers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <CustomerRow customer={customer} />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            overview={overview}
            form={settingsForm}
            error={settingsError}
            message={settingsMessage}
            isSaving={isSavingSettings}
            onChange={setSettingsForm}
            onSubmit={handleSettingsSubmit}
          />
        )}
      </div>

      <ProductEditorModal
        isOpen={isProductModalOpen}
        form={productForm}
        error={productError}
        message={productMessage}
        isSaving={isSavingProduct}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductError('');
          setProductMessage('');
        }}
        onChange={setProductForm}
        onSubmit={handleProductSubmit}
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleOrderStatusChange}
      />
    </section>
  );
}

function ProductEditorModal({
  isOpen,
  form,
  error,
  message,
  isSaving,
  onClose,
  onChange,
  onSubmit,
}: {
  isOpen: boolean;
  form: ProductFormState;
  error: string;
  message: string;
  isSaving: boolean;
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<ProductFormState>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  if (!isOpen) return null;

  const update = (field: keyof ProductFormState, value: string) => {
    onChange((current) => ({ ...current, [field]: value }));
  };

  const previewPrice = Number(form.price.replace(',', '.'));

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[96dvh] w-full overflow-y-auto rounded-t-lg bg-brand-cream-light shadow-xl sm:mx-auto sm:max-w-6xl sm:rounded-lg">
        <div className="sticky top-0 z-10 border-b border-brand-beige bg-brand-cream-light px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-brand-gold">
                <Package className="size-4" />
                <span className="text-xs font-bold uppercase">{form.id ? 'Editar produto' : 'Novo produto'}</span>
              </div>
              <h2 className="mt-1 font-serif text-2xl font-bold text-brand-brown-950 text-balance">
                {form.name || 'Produto sem nome'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-brand-beige p-2 text-brand-brown-850 hover:bg-brand-cream-deep"
              aria-label="Fechar editor de produto"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <section className="rounded-lg border border-brand-beige bg-white p-4 shadow-xs">
              <h3 className="font-serif text-lg font-bold text-brand-brown-950 text-balance">Informacoes principais</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field label="Nome" value={form.name} onChange={(value) => update('name', value)} className="sm:col-span-2" />

                <label className="block">
                  <span className="text-sm font-semibold text-brand-brown-800">Tipo de cadastro</span>
                  <select
                    value={productFormCadastroValue(form)}
                    onChange={(event) => {
                      const next = applyCadastroType(event.target.value);
                      onChange((current) => ({
                        ...current,
                        ...next,
                        ...(event.target.value === 'COFFEE_TRADITIONAL'
                          ? {
                              pontuacao: '',
                              notasMarcantes: '',
                              variedade: '',
                              altitude: '',
                              sommelierComment: '',
                            }
                          : {}),
                        ...(next.type === 'EQUIPMENT'
                          ? {
                              aroma: '',
                              sabor: '',
                              acidez: '',
                              corpo: '',
                              notasMarcantes: '',
                              produtor: '',
                              fazenda: '',
                              safra: '',
                              localizacao: '',
                              processo: '',
                              variedade: '',
                              altitude: '',
                              pontuacao: '',
                              sommelierComment: '',
                              itemsIncluded: '',
                            }
                          : {}),
                        ...(next.type === 'KIT'
                          ? {
                              aroma: '',
                              sabor: '',
                              acidez: '',
                              corpo: '',
                              notasMarcantes: '',
                              produtor: '',
                              fazenda: '',
                              safra: '',
                              localizacao: '',
                              processo: '',
                              variedade: '',
                              altitude: '',
                              pontuacao: '',
                              sommelierComment: '',
                              specs: '',
                            }
                          : {}),
                      }));
                    }}
                    className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-3 py-2.5 text-sm text-brand-brown-950 outline-none focus:border-brand-gold"
                  >
                    <option value="COFFEE_TRADITIONAL">Cafe tradicional</option>
                    <option value="COFFEE_SPECIALTY">Cafe especial</option>
                    <option value="EQUIPMENT">Equipamento</option>
                    <option value="KIT">Kit</option>
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-brand-brown-800">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => update('status', event.target.value)}
                    className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-3 py-2.5 text-sm text-brand-brown-950 outline-none focus:border-brand-gold"
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="ARCHIVED">Arquivado</option>
                  </select>
                </label>

                <Field label="Preco" value={form.price} onChange={(value) => update('price', value)} inputMode="decimal" />
                <Field label="Estoque" value={form.stockQuantity} onChange={(value) => update('stockQuantity', value)} inputMode="numeric" />
                <Field label="Imagem" value={form.image} onChange={(value) => update('image', value)} className="sm:col-span-2" inputMode="url" />
                <TextArea label="Descricao curta" value={form.description} onChange={(value) => update('description', value)} className="sm:col-span-2" />
              </div>
            </section>

            {form.type === 'COFFEE' && (
              <section className="rounded-lg border border-brand-beige bg-white p-4 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-brand-brown-950 text-balance">
                  {form.category === 'especial' ? 'Perfil do cafe especial' : 'Perfil do cafe tradicional'}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Aroma" value={form.aroma} onChange={(value) => update('aroma', value)} />
                  <Field label="Sabor" value={form.sabor} onChange={(value) => update('sabor', value)} />
                  <Field label="Acidez" value={form.acidez} onChange={(value) => update('acidez', value)} />
                  <Field label="Corpo" value={form.corpo} onChange={(value) => update('corpo', value)} />
                  <Field label="Produtor" value={form.produtor} onChange={(value) => update('produtor', value)} />
                  <Field label="Fazenda" value={form.fazenda} onChange={(value) => update('fazenda', value)} />
                  <Field label="Safra" value={form.safra} onChange={(value) => update('safra', value)} />
                  <Field label="Localizacao" value={form.localizacao} onChange={(value) => update('localizacao', value)} />
                  <Field label="Processo" value={form.processo} onChange={(value) => update('processo', value)} />
                  {form.category === 'especial' && (
                    <>
                      <Field label="Pontuacao SCA" value={form.pontuacao} onChange={(value) => update('pontuacao', value)} inputMode="decimal" />
                      <Field label="Variedade" value={form.variedade} onChange={(value) => update('variedade', value)} />
                      <Field label="Altitude" value={form.altitude} onChange={(value) => update('altitude', value)} />
                      <Field label="Notas marcantes" value={form.notasMarcantes} onChange={(value) => update('notasMarcantes', value)} className="sm:col-span-2" />
                      <TextArea label="Comentario do sommelier" value={form.sommelierComment} onChange={(value) => update('sommelierComment', value)} className="sm:col-span-2" />
                    </>
                  )}
                </div>
              </section>
            )}

            {form.type === 'EQUIPMENT' && (
              <section className="rounded-lg border border-brand-beige bg-white p-4 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-brand-brown-950 text-balance">Detalhes do equipamento</h3>
                <div className="mt-4 grid gap-3">
                  <TextArea label="Especificacoes" value={form.specs} onChange={(value) => update('specs', value)} />
                  <TextArea label="Objetivo" value={form.objective} onChange={(value) => update('objective', value)} />
                  <TextArea label="Como usar" value={form.howToUse} onChange={(value) => update('howToUse', value)} />
                </div>
              </section>
            )}

            {form.type === 'KIT' && (
              <section className="rounded-lg border border-brand-beige bg-white p-4 shadow-xs">
                <h3 className="font-serif text-lg font-bold text-brand-brown-950 text-balance">Detalhes do kit</h3>
                <div className="mt-4 grid gap-3">
                  <TextArea label="Itens inclusos" value={form.itemsIncluded} onChange={(value) => update('itemsIncluded', value)} />
                  <TextArea label="Objetivo" value={form.objective} onChange={(value) => update('objective', value)} />
                  <TextArea label="Como usar" value={form.howToUse} onChange={(value) => update('howToUse', value)} />
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-brand-beige bg-white p-4 shadow-xs lg:sticky lg:top-24">
              <h3 className="font-serif text-lg font-bold text-brand-brown-950 text-balance">Preview da pagina</h3>
              <ProductPagePreview form={form} previewPrice={previewPrice} />

              {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
              {message && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>}

              <div className="mt-4 grid gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-brown-850 px-4 py-3 text-sm font-bold text-brand-cream-light hover:bg-brand-brown-700 disabled:opacity-60"
                >
                  <Check className="size-4" />
                  {isSaving ? 'Salvando' : 'Salvar produto'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-brand-beige px-4 py-3 text-sm font-bold text-brand-brown-850 hover:bg-brand-cream-deep"
                >
                  Fechar
                </button>
              </div>
            </section>
          </aside>
        </form>
      </div>
    </div>
  );
}

function ProductPagePreview({ form, previewPrice }: { form: ProductFormState; previewPrice: number }) {
  const notes = form.notasMarcantes
    .split(',')
    .map((note) => note.trim())
    .filter(Boolean)
    .slice(0, 4);
  const specs = form.specs.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 4);
  const kitItems = form.itemsIncluded.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 4);
  const image = form.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=600';
  const price = Number.isNaN(previewPrice) ? 0 : previewPrice;

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-brand-beige bg-brand-cream-light">
      <div className="flex items-center justify-between border-b border-brand-beige bg-white px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-brand-gold" />
          <span className="size-2 rounded-full bg-brand-beige" />
          <span className="size-2 rounded-full bg-brand-brown-600" />
        </div>
        <span className="truncate rounded-full bg-brand-cream-deep px-2 py-1 text-[10px] font-semibold text-brand-brown-700">
          /produto/{form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'preview'}
        </span>
      </div>

      <div className="max-h-[62dvh] overflow-y-auto bg-brand-cream-light">
        <div className="border-b border-brand-beige bg-white px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Coffee className="size-4 text-brand-gold" />
              <span className="font-serif text-sm font-bold text-brand-brown-950">Grao & Origem</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-brand-brown-700">Produto</span>
          </div>
        </div>

        <div className="grid gap-3 p-3">
          <img src={image} alt={form.name || 'Preview'} className="aspect-[16/10] w-full rounded-md object-cover" />

          <section className="rounded-md bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase text-brand-gold">
                {productCadastroLabel({ type: form.type, category: form.category })}
              </span>
              <span className="rounded-full bg-brand-gold-light px-2 py-0.5 text-[10px] font-bold text-brand-brown-950">{form.status}</span>
            </div>
            <h4 className="mt-2 font-serif text-xl font-bold leading-tight text-brand-brown-950 text-balance">
              {form.name || 'Nome do produto'}
            </h4>
            <p className="mt-2 line-clamp-5 text-xs leading-relaxed text-brand-brown-700 text-pretty">
              {form.description || 'Descricao do produto aparecera aqui conforme voce preencher os campos.'}
            </p>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase text-brand-brown-700">A partir de</p>
                <p className="text-lg font-bold tabular-nums text-brand-brown-950">{formatCurrency(price)}</p>
              </div>
              <button type="button" className="rounded-md bg-brand-brown-850 px-3 py-2 text-xs font-bold text-brand-cream-light">
                Comprar
              </button>
            </div>
          </section>

          {form.type === 'COFFEE' && (
            <section className="rounded-md bg-white p-3">
              <h5 className="font-serif text-base font-bold text-brand-brown-950 text-balance">Perfil sensorial</h5>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <MiniSpec label="Aroma" value={form.aroma} />
                <MiniSpec label="Sabor" value={form.sabor} />
                <MiniSpec label="Acidez" value={form.acidez} />
                <MiniSpec label="Corpo" value={form.corpo} />
              </div>
              {notes.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {notes.map((note) => (
                    <span key={note} className="rounded-full bg-brand-gold-light px-2 py-1 text-[10px] font-bold text-brand-brown-950">
                      {note}
                    </span>
                  ))}
                </div>
              )}
            </section>
          )}

          {form.type === 'COFFEE' && (
            <section className="rounded-md bg-white p-3">
              <h5 className="font-serif text-base font-bold text-brand-brown-950 text-balance">Origem</h5>
              <div className="mt-3 space-y-2">
                <MiniLine label="Produtor" value={form.produtor} />
                <MiniLine label="Fazenda" value={form.fazenda} />
                <MiniLine label="Localizacao" value={form.localizacao} />
                <MiniLine label="Processo" value={form.processo} />
              </div>
            </section>
          )}

          {form.type === 'EQUIPMENT' && (
            <section className="rounded-md bg-white p-3">
              <h5 className="font-serif text-base font-bold text-brand-brown-950 text-balance">Especificacoes</h5>
              <ul className="mt-3 space-y-2">
                {(specs.length > 0 ? specs : ['Especificacao a definir']).map((spec) => (
                  <li key={spec} className="text-xs text-brand-brown-700 text-pretty">{spec}</li>
                ))}
              </ul>
            </section>
          )}

          {form.type === 'KIT' && (
            <section className="rounded-md bg-white p-3">
              <h5 className="font-serif text-base font-bold text-brand-brown-950 text-balance">Itens inclusos</h5>
              <ul className="mt-3 space-y-2">
                {(kitItems.length > 0 ? kitItems : ['Item do kit a definir']).map((item) => (
                  <li key={item} className="text-xs text-brand-brown-700 text-pretty">{item}</li>
                ))}
              </ul>
            </section>
          )}

          {(form.objective || form.howToUse || form.sommelierComment) && (
            <section className="rounded-md bg-white p-3">
              <h5 className="font-serif text-base font-bold text-brand-brown-950 text-balance">
                {form.type === 'COFFEE' ? 'Comentario' : 'Experiencia'}
              </h5>
              <p className="mt-2 line-clamp-5 text-xs leading-relaxed text-brand-brown-700 text-pretty">
                {form.sommelierComment || form.objective || form.howToUse}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniSpec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-brand-cream-deep p-2">
      <p className="text-[10px] font-bold uppercase text-brand-brown-700">{label}</p>
      <p className="mt-1 line-clamp-2 text-xs font-semibold text-brand-brown-950 text-pretty">{value || 'A definir'}</p>
    </div>
  );
}

function MiniLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-brand-beige pb-2 last:border-b-0 last:pb-0">
      <span className="text-[10px] font-bold uppercase text-brand-brown-700">{label}</span>
      <span className="text-right text-xs font-semibold text-brand-brown-950">{value || 'A definir'}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = '',
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-brand-brown-800">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-3 py-2.5 text-sm text-brand-brown-950 outline-none focus:border-brand-gold"
        inputMode={inputMode}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-sm font-semibold text-brand-brown-800">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-24 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-3 py-2.5 text-sm text-brand-brown-950 outline-none focus:border-brand-gold"
      />
    </label>
  );
}

function ProductBucket({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-lg border border-brand-beige bg-brand-cream-light p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-brand-brown-800">{label}</span>
        <Icon className="size-4 text-brand-gold" />
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-brand-brown-950">{value}</p>
    </div>
  );
}

function ProductRow({ product, onEdit }: { product: AdminProduct; onEdit: (product: AdminProduct) => void }) {
  return (
    <article className="rounded-lg border border-brand-beige bg-white p-3 shadow-xs">
      <div className="flex gap-3">
        <img
          src={product.image}
          alt={product.name}
          className="size-20 shrink-0 rounded-md object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-brand-gold">{productCadastroLabel(product)}</p>
              <h3 className="mt-1 line-clamp-2 text-sm font-bold text-brand-brown-950 text-pretty">{product.name}</h3>
            </div>
            <span className="shrink-0 rounded-full bg-brand-gold-light px-2 py-1 text-xs font-bold text-brand-brown-950">
              {product.status}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-brand-brown-700 text-pretty">{product.description}</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm font-bold tabular-nums text-brand-brown-950">{formatCurrency(product.price)}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-brown-700">
                Estoque {product.stockQuantity ?? 0}
              </span>
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="rounded-md border border-brand-beige px-2 py-1 text-xs font-bold text-brand-brown-850 hover:bg-brand-cream-deep"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function OrderRow({
  order,
  onOpen,
  onStatusChange,
}: {
  order: AdminOrder;
  onOpen: (order: AdminOrder) => void;
  onStatusChange: (order: AdminOrder, status: string) => void;
}) {
  const payment = order.payments?.[0];

  return (
    <article className="rounded-lg border border-brand-beige bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-brand-gold">{order.code}</p>
          <h3 className="mt-1 text-base font-bold text-brand-brown-950">
            {order.customer?.name ?? 'Cliente nao informado'}
          </h3>
          <p className="mt-1 text-xs text-brand-brown-700">
            {new Date(order.createdAt).toLocaleString('pt-BR')}
          </p>
          {order.customer?.email && (
            <p className="mt-1 truncate text-xs font-medium text-brand-brown-700">
              {order.customer.email}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <select
            value={order.status}
            onChange={(event) => onStatusChange(order, event.target.value)}
            className="max-w-[170px] rounded-lg border border-brand-beige bg-brand-cream-light px-2 py-1 text-xs font-bold text-brand-brown-950 outline-none focus:border-brand-gold"
            aria-label="Status do pedido"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onOpen(order)}
            className="rounded-md border border-brand-beige px-2 py-1 text-xs font-bold text-brand-brown-850 hover:bg-brand-cream-deep"
          >
            Detalhes
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-brand-beige bg-brand-cream-light">
        <div className="border-b border-brand-beige px-3 py-2">
          <p className="text-xs font-bold uppercase text-brand-brown-700">Itens comprados</p>
        </div>

        <div className="divide-y divide-brand-beige">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 px-3 py-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-bold text-brand-brown-950 text-pretty">{item.name}</p>
                  <p className="mt-1 text-xs font-semibold text-brand-brown-700">
                    Quantidade: {item.quantity}
                  </p>
                </div>
                <span className="text-right text-sm font-bold tabular-nums text-brand-brown-950">
                  {formatCurrency(item.totalCents / 100)}
                </span>
              </div>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-brand-brown-700">
              Nenhum item encontrado neste pedido.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2 border-t border-brand-beige pt-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold text-brand-brown-700">Itens</p>
          <p className="mt-1 text-sm font-bold tabular-nums text-brand-brown-950">{order.items?.length ?? 0}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-brown-700">Pagamento</p>
          <p className="mt-1 text-sm font-bold text-brand-brown-950">
            {payment ? `${payment.provider} / ${payment.status}` : 'PENDING'}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-semibold text-brand-brown-700">Total</p>
          <p className="mt-1 text-base font-bold tabular-nums text-brand-brown-950">
            {formatCurrency(order.totalCents / 100)}
          </p>
        </div>
      </div>
    </article>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: AdminOrder | null;
  onClose: () => void;
  onStatusChange: (order: AdminOrder, status: string) => void;
}) {
  if (!order) return null;

  const payment = order.payments?.[0];
  const addressEntries = order.shippingAddress
    ? Object.entries(order.shippingAddress).filter(([, value]) => value)
    : [];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="relative z-10 max-h-[92dvh] w-full max-w-4xl overflow-y-auto rounded-lg border border-brand-beige bg-white p-4 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-brand-beige pb-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-brand-gold">{order.code}</p>
            <h2 className="mt-1 font-serif text-2xl font-bold text-brand-brown-950 text-balance">Detalhes do pedido</h2>
            <p className="mt-1 text-xs text-brand-brown-700">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-brand-beige p-2 text-brand-brown-700 hover:bg-brand-cream-deep"
            aria-label="Fechar detalhes do pedido"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <section className="rounded-lg border border-brand-beige bg-brand-cream-light p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-brand-brown-950">Cliente</h3>
                  <p className="mt-1 text-sm font-bold text-brand-brown-950">{order.customer?.name ?? 'Cliente nao informado'}</p>
                  <p className="text-sm text-brand-brown-700">{order.customer?.email ?? 'Email nao informado'}</p>
                  <p className="text-sm text-brand-brown-700">{order.customer?.phone ?? 'Telefone nao informado'}</p>
                  {order.customer?.document && (
                    <p className="text-sm text-brand-brown-700">Documento: {order.customer.document}</p>
                  )}
                </div>
                <label className="block">
                  <span className="text-xs font-bold uppercase text-brand-brown-700">Status</span>
                  <select
                    value={order.status}
                    onChange={(event) => onStatusChange(order, event.target.value)}
                    className="mt-2 w-full rounded-lg border border-brand-beige bg-white px-3 py-2 text-sm font-bold text-brand-brown-950 outline-none focus:border-brand-gold"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-lg border border-brand-beige bg-white">
              <div className="border-b border-brand-beige px-4 py-3">
                <h3 className="font-serif text-lg font-bold text-brand-brown-950">Itens comprados</h3>
              </div>
              <div className="divide-y divide-brand-beige">
                {order.items?.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-bold text-brand-brown-950 text-pretty">{item.name}</p>
                      <p className="mt-1 text-xs font-semibold text-brand-brown-700">
                        {item.quantity} un. x {formatCurrency((item.unitPriceCents ?? Math.round(item.totalCents / item.quantity)) / 100)}
                      </p>
                    </div>
                    <p className="text-right font-bold tabular-nums text-brand-brown-950">
                      {formatCurrency(item.totalCents / 100)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="rounded-lg border border-brand-beige bg-brand-cream-light p-4">
              <h3 className="font-serif text-lg font-bold text-brand-brown-950">Resumo</h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-brand-brown-700">Itens</span>
                  <span className="font-bold text-brand-brown-950">{order.items?.length ?? 0}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="font-semibold text-brand-brown-700">Pagamento</span>
                  <span className="text-right font-bold text-brand-brown-950">{payment ? `${payment.provider} / ${payment.status}` : 'PENDING'}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-brand-beige pt-3">
                  <span className="font-semibold text-brand-brown-700">Total</span>
                  <span className="font-bold tabular-nums text-brand-brown-950">{formatCurrency(order.totalCents / 100)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-brand-beige bg-white p-4">
              <h3 className="font-serif text-lg font-bold text-brand-brown-950">Entrega</h3>
              <div className="mt-3 space-y-2 text-sm text-brand-brown-700">
                {addressEntries.length > 0 ? (
                  addressEntries.map(([key, value]) => (
                    <p key={key}><strong className="text-brand-brown-950">{key}:</strong> {String(value)}</p>
                  ))
                ) : (
                  <p>Endereco nao informado.</p>
                )}
              </div>
              {order.notes && (
                <p className="mt-3 border-t border-brand-beige pt-3 text-sm text-brand-brown-700">{order.notes}</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CustomerRow({ customer }: { customer: AdminCustomer }) {
  return (
    <article className="rounded-lg border border-brand-beige bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase text-brand-gold">Cliente</p>
          <h3 className="mt-1 text-base font-bold text-brand-brown-950">{customer.name}</h3>
          <p className="mt-1 truncate text-sm text-brand-brown-700">{customer.email ?? 'Email nao informado'}</p>
          <p className="text-sm text-brand-brown-700">{customer.phone ?? 'Telefone nao informado'}</p>
        </div>
        <span className="rounded-full bg-brand-gold-light px-2 py-1 text-xs font-bold text-brand-brown-950">
          {customer.orderCount} pedidos
        </span>
      </div>
      <div className="mt-4 grid gap-3 border-t border-brand-beige pt-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold text-brand-brown-700">Total gasto</p>
          <p className="mt-1 text-sm font-bold tabular-nums text-brand-brown-950">{formatCurrency(customer.totalSpentCents / 100)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-brown-700">Ultimo pedido</p>
          <p className="mt-1 text-sm font-bold text-brand-brown-950">
            {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString('pt-BR') : 'Sem pedidos'}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-brand-brown-700">Status</p>
          <p className="mt-1 text-sm font-bold text-brand-brown-950">{customer.lastOrderStatus ?? 'N/A'}</p>
        </div>
      </div>
    </article>
  );
}

function SettingsPanel({
  overview,
  form,
  error,
  message,
  isSaving,
  onChange,
  onSubmit,
}: {
  overview: AdminOverview;
  form: SettingsFormState;
  error: string;
  message: string;
  isSaving: boolean;
  onChange: React.Dispatch<React.SetStateAction<SettingsFormState>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const update = (field: keyof SettingsFormState, value: string) => {
    onChange((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <form className="rounded-lg border border-brand-beige bg-white p-5 shadow-xs" onSubmit={onSubmit}>
        <div className="flex items-center gap-2">
          <Store className="size-5 text-brand-gold" />
          <h2 className="font-serif text-xl font-bold text-brand-brown-950 text-balance">Loja</h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-brand-brown-800">Nome da loja</span>
            <input
              value={form.displayName}
              onChange={(event) => update('displayName', event.target.value)}
              className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-4 py-3 text-sm text-brand-brown-950 outline-none focus:border-brand-gold"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-brand-brown-800">Segmento</span>
            <input
              value={form.segment}
              onChange={(event) => update('segment', event.target.value)}
              className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-4 py-3 text-sm text-brand-brown-950 outline-none focus:border-brand-gold"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-brand-brown-800">Status</span>
            <select
              value={form.status}
              onChange={(event) => update('status', event.target.value)}
              className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-4 py-3 text-sm text-brand-brown-950 outline-none focus:border-brand-gold"
            >
              <option value="TRIAL">TRIAL</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </label>

          <label className="block sm:col-span-2">
            <span className="text-sm font-semibold text-brand-brown-800">Logo URL</span>
            <input
              value={form.logoUrl}
              onChange={(event) => update('logoUrl', event.target.value)}
              className="mt-2 w-full rounded-lg border border-brand-beige bg-brand-cream-light px-4 py-3 text-sm text-brand-brown-950 outline-none focus:border-brand-gold"
              placeholder="/branding/logo.png"
            />
          </label>

          {([
            ['primaryColor', 'Cor primaria'],
            ['accentColor', 'Cor de destaque'],
            ['backgroundColor', 'Fundo'],
            ['surfaceColor', 'Superficie'],
          ] as Array<[keyof SettingsFormState, string]>).map(([field, label]) => (
            <label key={field} className="block">
              <span className="text-sm font-semibold text-brand-brown-800">{label}</span>
              <div className="mt-2 flex rounded-lg border border-brand-beige bg-brand-cream-light p-1">
                <input
                  type="color"
                  value={form[field]}
                  onChange={(event) => update(field, event.target.value)}
                  className="h-10 w-12 shrink-0 rounded-md border border-brand-beige bg-white"
                />
                <input
                  value={form[field]}
                  onChange={(event) => update(field, event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-brand-brown-950 outline-none"
                />
              </div>
            </label>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 w-full rounded-lg bg-brand-brown-850 px-4 py-3 text-sm font-bold text-brand-cream-light hover:bg-brand-brown-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isSaving ? 'Salvando...' : 'Salvar loja'}
        </button>
      </form>

      <aside className="rounded-lg border border-brand-beige bg-brand-cream-light p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <CreditCard className="size-5 text-brand-gold" />
          <h2 className="font-serif text-xl font-bold text-brand-brown-950 text-balance">SaaS</h2>
        </div>
        <div className="mt-5 divide-y divide-brand-beige">
          {[
            ['Slug', overview.tenant.slug],
            ['Status', overview.tenant.status],
            ['Moeda', 'BRL'],
            ['Plano', 'Starter'],
            ['Billing', 'Pendente'],
            ['Provider', overview.paymentProvider.provider],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm font-semibold text-brand-brown-700">{label}</span>
              <span className="text-right text-sm font-bold text-brand-brown-950">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-brand-beige bg-white p-4">
          <p className="text-xs font-bold uppercase text-brand-brown-700">Preview visual</p>
          <div className="mt-3 overflow-hidden rounded-lg border border-brand-beige" style={{ backgroundColor: form.backgroundColor }}>
            <div className="p-4" style={{ backgroundColor: form.surfaceColor }}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-serif text-lg font-bold" style={{ color: form.primaryColor }}>
                    {form.displayName || 'Nome da loja'}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: form.accentColor }}>
                    {form.segment || 'segmento'}
                  </p>
                </div>
                <div className="size-9 rounded-lg" style={{ backgroundColor: form.primaryColor }} />
              </div>
              <button
                type="button"
                className="mt-4 w-full rounded-lg px-4 py-2 text-xs font-bold"
                style={{ backgroundColor: form.accentColor, color: form.primaryColor }}
              >
                Comprar
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
