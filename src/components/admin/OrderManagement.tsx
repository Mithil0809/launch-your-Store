import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderFulfillmentStatus } from '../../types/store';
import { CURRENCY_SYMBOLS } from '../../data/seedData';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Printer,
  ChevronRight,
  X,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';

export const OrderManagement: React.FC = () => {
  const { currentStore, orders, updateOrderStatus } = useStore();
  const currencySymbol = CURRENCY_SYMBOLS[currentStore.settings.currency] || '$';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderFulfillmentStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status transition form within order detail
  const [newStatus, setNewStatus] = useState<OrderFulfillmentStatus>('Packed');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('UPS Ground');

  // Print packing slip view state
  const [isPrintSlipOpen, setIsPrintSlipOpen] = useState(false);

  // Notification simulation
  const [notificationSentMessage, setNotificationSentMessage] = useState('');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch =
        !searchQuery ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || o.fulfillmentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  // Open Order Detail Drawer
  const openOrderDrawer = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.fulfillmentStatus);
    setStatusNote('');
    setTrackingNumber(order.trackingNumber || '');
    setCarrier(order.carrier || 'UPS Ground');
    setNotificationSentMessage('');
  };

  // Handle status update
  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    updateOrderStatus(
      selectedOrder.id,
      newStatus,
      statusNote || `Updated status to ${newStatus}`,
      trackingNumber,
      carrier
    );

    // Refresh selected order view
    const updated = orders.find(o => o.id === selectedOrder.id);
    if (updated) {
      setSelectedOrder({
        ...updated,
        fulfillmentStatus: newStatus,
        trackingNumber,
        carrier,
      });
    }
    setStatusNote('');
  };

  // Simulate customer notification email
  const handleSendNotification = () => {
    if (!selectedOrder) return;
    setNotificationSentMessage(
      `✓ Notification email preview dispatched to ${selectedOrder.customer.email}: "Your order ${selectedOrder.orderNumber} is now ${selectedOrder.fulfillmentStatus}!"`
    );
    setTimeout(() => setNotificationSentMessage(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fulfill store orders, update shipping tracking, and inspect customer timelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700">
            Total Orders: {orders.length}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer name, email..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Payment</th>
                <th className="py-3 px-3">Fulfillment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders match your search query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => openOrderDrawer(order)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>

                    <td className="py-3.5 px-3 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{order.customer.name}</p>
                      <p className="text-slate-400 text-[11px] truncate max-w-[150px]">
                        {order.customer.email}
                      </p>
                    </td>

                    <td className="py-3.5 px-3 text-slate-600 font-medium">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} item(s)
                    </td>

                    <td className="py-3.5 px-3 font-extrabold text-slate-900">
                      {currencySymbol}
                      {order.total.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          order.fulfillmentStatus === 'Shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.fulfillmentStatus === 'Packed'
                            ? 'bg-amber-100 text-amber-800'
                            : order.fulfillmentStatus === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.fulfillmentStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {order.fulfillmentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-end gap-1 ml-auto">
                        Details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white max-w-xl w-full h-full shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-slideLeft overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-[11px] font-mono font-bold text-indigo-600 uppercase tracking-wider">
                  Order Details
                </span>
                <h3 className="font-bold text-slate-900 text-lg">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintSlipOpen(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" /> Packing Slip
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification simulated alert */}
            {notificationSentMessage && (
              <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{notificationSentMessage}</span>
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 space-y-6 flex-1 text-xs">
              {/* Status transition controller */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3">
                  Update Fulfillment Status
                </h4>
                <form onSubmit={handleUpdateStatusSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        New Status
                      </label>
                      <select
                        value={newStatus}
                        onChange={e => setNewStatus(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled (Restores Stock)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Carrier
                      </label>
                      <input
                        type="text"
                        value={carrier}
                        onChange={e => setCarrier(e.target.value)}
                        placeholder="UPS, FedEx, DHL"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tracking Reference #
                    </label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="e.g. 1Z9999999999999999"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Status Note (Logged to audit timeline)
                    </label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={e => setStatusNote(e.target.value)}
                      placeholder="e.g. Handed package to courier dispatch"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleSendNotification}
                      className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Send className="w-3.5 h-3.5" /> Email Customer Update
                    </button>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
                    >
                      Update Status
                    </button>
                  </div>
                </form>
              </div>

              {/* Customer and Shipping Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    Customer Information
                  </span>
                  <p className="font-bold text-slate-900 text-sm">{selectedOrder.customer.name}</p>
                  <p className="text-slate-600 mt-0.5">{selectedOrder.customer.email}</p>
                  <p className="text-slate-600">{selectedOrder.customer.phone}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    Shipping Address
                  </span>
                  <p className="text-slate-800 font-medium">{selectedOrder.customer.address}</p>
                  <p className="text-slate-600">
                    {selectedOrder.customer.city}, {selectedOrder.customer.state}{' '}
                    {selectedOrder.customer.zip}
                  </p>
                  <p className="text-slate-600">{selectedOrder.customer.country}</p>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-50 px-3 py-2 font-bold text-[11px] text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  Purchased Items ({selectedOrder.items.length})
                </div>
                <div className="divide-y divide-slate-100 p-3 space-y-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between pt-2 first:pt-0">
                      <div className="flex items-center gap-3">
                        {it.imageUrl && (
                          <img
                            src={it.imageUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{it.name}</p>
                          <p className="text-slate-400 text-[11px]">
                            Qty: {it.quantity} {it.selectedVariant ? `• ${it.selectedVariant}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        {currencySymbol}
                        {(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal, tax, shipping, total */}
                <div className="bg-slate-50 p-3 border-t border-slate-200 space-y-1 text-slate-600 text-xs">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      {currencySymbol}
                      {selectedOrder.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {selectedOrder.shipping === 0
                        ? 'FREE'
                        : `${currencySymbol}${selectedOrder.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>
                      {currencySymbol}
                      {selectedOrder.tax.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-extrabold text-slate-900 text-sm">
                    <span>Total Paid</span>
                    <span>
                      {currencySymbol}
                      {selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Status History Timeline */}
              <div className="space-y-3">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">
                  Status & Audit History
                </span>
                <div className="space-y-2 border-l-2 border-indigo-200 pl-3 ml-2">
                  {selectedOrder.statusHistory.map((hist, i) => (
                    <div key={i} className="relative pb-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute -left-[17px] top-1" />
                      <p className="font-bold text-slate-900">{hist.status}</p>
                      <p className="text-slate-500 text-[11px]">{hist.note}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(hist.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Packing Slip Modal */}
      {isPrintSlipOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-slate-300 print:m-0 print:border-0 text-slate-900 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-bold">{currentStore.name}</h2>
                <p className="text-xs text-slate-500">Official Packing Slip</p>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-sm">{selectedOrder.orderNumber}</p>
                <p className="text-xs text-slate-500">
                  {new Date(selectedOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Ship To:</span>
                <p className="font-bold">{selectedOrder.customer.name}</p>
                <p>{selectedOrder.customer.address}</p>
                <p>
                  {selectedOrder.customer.city}, {selectedOrder.customer.state}{' '}
                  {selectedOrder.customer.zip}
                </p>
                <p>{selectedOrder.customer.country}</p>
              </div>
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Shipping Method:</span>
                <p className="font-bold">{selectedOrder.carrier || 'Standard Ground Delivery'}</p>
                {selectedOrder.trackingNumber && (
                  <p className="font-mono mt-1">Tracking: {selectedOrder.trackingNumber}</p>
                )}
              </div>
            </div>

            {/* Slip Items */}
            <table className="w-full text-xs text-left border-y border-slate-200 py-2">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedOrder.items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-2.5 font-medium">{it.name}</td>
                    <td className="py-2.5 text-right font-bold">{it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsPrintSlipOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
