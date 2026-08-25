import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  HiTrash, HiArrowLeft, HiCheck, HiPlus, HiMinus, HiMagnifyingGlass, 
  HiPrinter, HiSparkles, HiCreditCard, HiBanknotes, HiDevicePhoneMobile, 
  HiUserPlus, HiShoppingCart, HiCube, HiExclamationTriangle, HiCheckCircle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import productService from '../../services/productService';
import customerService from '../../services/customerService';
import categoryService from '../../services/categoryService';
import saleService from '../../services/saleService';
import CustomerForm from '../customers/CustomerForm';

export default function CreateSalePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ── State ──────────────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [taxRate, setTaxRate] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [reference, setReference] = useState('');
  const [customAmountPaid, setCustomAmountPaid] = useState('');
  
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const { data: rawProducts, isLoading: isLoadingProducts } = useQuery({ 
    queryKey: ['products'], 
    queryFn: productService.getAll 
  });
  const { data: rawCustomers, refetch: refetchCustomers } = useQuery({ 
    queryKey: ['customers'], 
    queryFn: customerService.getAll 
  });
  const { data: rawCategories } = useQuery({ 
    queryKey: ['categories'], 
    queryFn: categoryService.getAll 
  });

  const products = useMemo(() => Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []), [rawProducts]);
  const customers = useMemo(() => Array.isArray(rawCustomers) ? rawCustomers : (rawCustomers?.data || []), [rawCustomers]);
  const categories = useMemo(() => Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []), [rawCategories]);

  // Filter products by search query and category
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) || 
        p.sku?.toLowerCase().includes(q) || 
        p.barcode?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // ── Cart Handlers ──────────────────────────────────────────────────────────
  const handleAddToCart = (product) => {
    if (!product || product.status !== 'ACTIVE') {
      toast.error('This product is unavailable');
      return;
    }

    const availableStock = product.quantity ?? 0;
    if (availableStock <= 0) {
      toast.error(`"${product.name}" is out of stock.`);
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        if (currentQty + 1 > availableStock) {
          toast.error(`Only ${availableStock} units of "${product.name}" are available.`);
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: currentQty + 1
        };
        toast.success(`Increased "${product.name}" quantity (${currentQty + 1})`);
        return updated;
      }

      toast.success(`Added "${product.name}" to cart`);
      return [...prev, {
        product,
        quantity: 1,
        price: Number(product.sellingPrice || 0)
      }];
    });
  };

  const handleUpdateQuantity = (productId, newQtyStr) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    const availableStock = item.product.quantity ?? 0;
    let qty = parseInt(newQtyStr, 10);

    if (isNaN(qty) || qty < 1) {
      qty = 1;
    }

    if (qty > availableStock) {
      toast.error(`Only ${availableStock} units of "${item.product.name}" are available.`);
      qty = availableStock;
    }

    setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i));
  };

  const handleIncrement = (productId) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    handleUpdateQuantity(productId, item.quantity + 1);
  };

  const handleDecrement = (productId) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    if (item.quantity <= 1) {
      handleRemoveItem(productId);
    } else {
      handleUpdateQuantity(productId, item.quantity - 1);
    }
  };

  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    toast.success('Cart cleared');
  };

  // ── Calculations ───────────────────────────────────────────────────────────
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    return (subtotal * Number(taxRate || 0)) / 100;
  }, [subtotal, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + taxAmount - Number(discount || 0));
  }, [subtotal, taxAmount, discount]);

  const amountPaid = customAmountPaid !== '' ? Number(customAmountPaid) : grandTotal;
  const changeDue = Math.max(0, amountPaid - grandTotal);

  // ── Checkout Mutation ──────────────────────────────────────────────────────
  const createSaleMutation = useMutation({
    mutationFn: saleService.create,
    onSuccess: (res) => {
      const sale = res?.data || res;
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      setCompletedSale(sale);
      toast.success('Sale completed successfully!');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to complete sale';
      toast.error(msg);
    }
  });

  const handleCompleteSale = () => {
    if (cart.length === 0) {
      toast.error('Cart is empty. Please add products to continue.');
      return;
    }

    // Final stock check before submitting
    for (const item of cart) {
      const availableStock = item.product.quantity ?? 0;
      if (item.quantity > availableStock) {
        toast.error(`Only ${availableStock} units of "${item.product.name}" are available.`);
        return;
      }
    }

    if (amountPaid < grandTotal) {
      toast.error(`Amount paid ($${amountPaid.toFixed(2)}) cannot be less than Grand Total ($${grandTotal.toFixed(2)}).`);
      return;
    }

    if (['CARD', 'BANK_TRANSFER', 'MOBILE_MONEY'].includes(paymentMethod) && !reference.trim()) {
      toast.error(`Reference number is required for ${paymentMethod.replace('_', ' ')} payments.`);
      return;
    }

    const payload = {
      customerId: selectedCustomerId || null,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: Number(item.quantity),
        unitPrice: Number(item.price),
        discount: 0
      })),
      taxRate: Number(taxRate || 0),
      discountAmount: Number(discount || 0),
      paymentMethod: paymentMethod || 'CASH',
      paymentStatus: amountPaid >= grandTotal ? 'PAID' : 'PARTIAL',
      amountPaid: Number(amountPaid),
      reference: reference.trim() || null,
    };

    createSaleMutation.mutate(payload);
  };

  const handleStartNewSale = () => {
    setCart([]);
    setSelectedCustomerId('');
    setTaxRate(0);
    setDiscount(0);
    setPaymentMethod('CASH');
    setReference('');
    setCustomAmountPaid('');
    setCompletedSale(null);
  };

  const stockBadge = (product) => {
    const qty = product.quantity ?? 0;
    const min = product.minStock ?? 5;
    if (qty <= 0) return <Badge variant="red">Out of Stock</Badge>;
    if (qty <= min) return <Badge variant="amber">{qty} in stock</Badge>;
    return <Badge variant="green">{qty} in stock</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* POS Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/sales')}>
            <HiArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Point of Sale (POS)</h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Terminal
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Process instant customer transactions</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setIsCustomerModalOpen(true)} leftIcon={<HiUserPlus className="w-4 h-4" />}>
            New Customer
          </Button>
          <div className="text-right border-l border-gray-200 dark:border-gray-800 pl-4 hidden sm:block">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Items in Cart</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
            </p>
          </div>
        </div>
      </div>

      {/* POS Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Product Catalog & Search (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Search & Category Filter */}
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3">
            <div className="relative">
              <Input
                placeholder="Search products by name, SKU, or barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                iconLeft={HiMagnifyingGlass}
                className="w-full pl-10"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All Categories ({products.length})
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-gray-500 dark:text-gray-400">
              <HiCube className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="font-semibold text-gray-900 dark:text-white">No products found</p>
              <p className="text-xs mt-1">Try adjusting your search query or category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[620px] overflow-y-auto pr-1">
              {filteredProducts.map(product => {
                const isOutOfStock = (product.quantity ?? 0) <= 0;
                const inCartItem = cart.find(i => i.product.id === product.id);

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                    className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                      isOutOfStock
                        ? 'opacity-60 bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800 cursor-not-allowed'
                        : inCartItem
                        ? 'bg-primary-50/50 dark:bg-primary-900/20 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-primary-400 hover:shadow-md'
                    }`}
                  >
                    {inCartItem && (
                      <span className="absolute top-2 right-2 bg-primary-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                        {inCartItem.quantity}
                      </span>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider truncate">
                          {product.sku}
                        </span>
                        {stockBadge(product)}
                      </div>

                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                    </div>

                    <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        ${Number(product.sellingPrice || 0).toFixed(2)}
                      </span>
                      <button
                        disabled={isOutOfStock}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isOutOfStock
                            ? 'text-gray-400 bg-gray-100 dark:bg-gray-800'
                            : 'text-white bg-primary-600 hover:bg-primary-700'
                        }`}
                      >
                        <HiPlus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Checkout & Order Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-5">
            
            {/* Customer Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Customer</label>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="text-xs text-primary-600 hover:underline font-medium"
                >
                  + New Customer
                </button>
              </div>
              <Select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </Select>
            </div>

            {/* Cart Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Cart Items ({cart.length})
                </span>
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 dark:text-gray-500">
                    <HiShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">Cart is empty</p>
                    <p className="text-xs mt-0.5">Click products on the left to add items.</p>
                  </div>
                ) : (
                  cart.map(item => {
                    const lineTotal = Number(item.price) * item.quantity;
                    const stock = item.product.quantity ?? 0;

                    return (
                      <div
                        key={item.product.id}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ${Number(item.price).toFixed(2)} × {item.quantity} = <span className="font-bold text-gray-900 dark:text-white">${lineTotal.toFixed(2)}</span>
                          </p>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDecrement(item.product.id)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <HiMinus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={stock}
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.product.id, e.target.value)}
                            className="w-11 text-center text-xs font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg py-1 text-gray-900 dark:text-white"
                          />
                          <button
                            onClick={() => handleIncrement(item.product.id)}
                            className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-200 hover:bg-gray-100 transition-colors"
                          >
                            <HiPlus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center ml-1 transition-colors"
                            title="Remove item"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-2 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Tax (%)</span>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  className="w-24 text-right text-xs"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Discount ($)</span>
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={e => setDiscount(e.target.value)}
                  className="w-24 text-right text-xs"
                />
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="text-base font-bold text-gray-900 dark:text-white">Grand Total</span>
                <span className="text-2xl font-black text-primary-600 dark:text-primary-400">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Controls */}
            <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'CASH',          label: 'Cash',          icon: HiBanknotes },
                    { id: 'CARD',          label: 'Card',          icon: HiCreditCard },
                    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: HiBanknotes },
                    { id: 'MOBILE_MONEY',  label: 'Mobile Money', icon: HiDevicePhoneMobile },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        paymentMethod === m.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {['CARD', 'BANK_TRANSFER', 'MOBILE_MONEY'].includes(paymentMethod) && (
                <Input
                  label="Reference / Transaction ID *"
                  placeholder="e.g. TXN-998811"
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="text-xs"
                />
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Amount Paid ($)"
                  type="number"
                  step="0.01"
                  placeholder={grandTotal.toFixed(2)}
                  value={customAmountPaid}
                  onChange={e => setCustomAmountPaid(e.target.value)}
                  className="text-xs font-bold"
                />
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Change Due
                  </label>
                  <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-emerald-600 dark:text-emerald-400 text-sm text-right">
                    ${changeDue.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Sale Button */}
            <Button
              size="lg"
              className="w-full py-3.5 text-base font-bold shadow-lg"
              onClick={handleCompleteSale}
              isLoading={createSaleMutation.isPending}
              disabled={cart.length === 0}
            >
              <HiCheck className="w-5 h-5 mr-2" /> Complete Sale (${grandTotal.toFixed(2)})
            </Button>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      <CustomerForm
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSuccess={() => {
          setIsCustomerModalOpen(false);
          refetchCustomers();
        }}
      />

      {/* Printable Receipt Modal */}
      {completedSale && (
        <Modal
          isOpen={!!completedSale}
          onClose={handleStartNewSale}
          title="Transaction Receipt"
        >
          <div className="space-y-6 pt-2" id="printable-receipt">
            {/* Header */}
            <div className="text-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <HiCheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">BMS ENTERPRISE POS</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Official Sales Invoice / Receipt</p>
              <p className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 mt-1">
                {completedSale.invoiceNumber}
              </p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Date: </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {new Date(completedSale.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Customer: </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {completedSale.customer?.name || 'Walk-in Customer'}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Payment: </span>
                <span className="font-semibold text-gray-900 dark:text-white">{completedSale.paymentMethod?.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Status: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completedSale.paymentStatus}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              <div className="grid grid-cols-12 font-bold text-gray-400 uppercase tracking-wider pb-2">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-4 text-right">Total</div>
              </div>
              {completedSale.saleItems?.map(item => (
                <div key={item.id} className="grid grid-cols-12 py-2 text-gray-900 dark:text-white">
                  <div className="col-span-6 font-medium truncate">{item.productName}</div>
                  <div className="col-span-2 text-center text-gray-500">{item.quantity}</div>
                  <div className="col-span-4 text-right font-semibold">${Number(item.total).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${Number(completedSale.subtotal).toFixed(2)}</span>
              </div>
              {Number(completedSale.taxAmount) > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax ({completedSale.taxRate}%)</span>
                  <span>${Number(completedSale.taxAmount).toFixed(2)}</span>
                </div>
              )}
              {Number(completedSale.discountAmount) > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Discount</span>
                  <span>-${Number(completedSale.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                <span>Total Paid</span>
                <span className="text-primary-600 dark:text-primary-400">${Number(completedSale.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => window.print()}
                leftIcon={<HiPrinter className="w-4 h-4" />}
              >
                Print Receipt
              </Button>
              <Button
                className="flex-1"
                onClick={handleStartNewSale}
                leftIcon={<HiSparkles className="w-4 h-4" />}
              >
                New Sale
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
