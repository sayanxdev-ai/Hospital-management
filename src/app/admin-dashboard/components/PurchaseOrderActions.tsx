'use client';

import React, { useState } from 'react';
import { Eye, Minus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { getAdminRequests, saveAdminRequests, type AdminRequest } from '../lib/adminData';
import { recordAdminActivity } from '../lib/activityStorage';

export default function PurchaseOrderActions({ order }: { order: AdminRequest }) {
  const [dialog, setDialog] = useState<'view' | 'edit' | null>(null);
  const [item, setItem] = useState(order.item);
  const [quantity, setQuantity] = useState(String(Number.parseInt(order.quantity, 10) || 0));
  const [vendor, setVendor] = useState(order.hospital);
  const [batchNumber, setBatchNumber] = useState(order.batchNumber || '');
  const [expiryDate, setExpiryDate] = useState(order.expiryDate || '');
  const currentQuantity = Number.parseInt(order.quantity, 10) || 0;

  const saveOrder = (updatedOrder: AdminRequest, message: string) => {
    saveAdminRequests(getAdminRequests().map(request => request.id === order.id ? updatedOrder : request));
    recordAdminActivity({ category: 'order', tone: 'info', message });
  };

  const adjustQuantity = (delta: number) => {
    const nextQuantity = currentQuantity + delta;
    if (nextQuantity <= 0) return;
    const unit = order.quantity.replace(/^\s*\d+\s*/, '') || 'units';
    saveOrder({ ...order, quantity: `${nextQuantity} ${unit}` }, `Purchase order quantity adjusted for ${order.item}: ${currentQuantity} → ${nextQuantity}.`);
  };

  const saveEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numericQuantity = Number.parseInt(quantity, 10);
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) return;
    const unit = order.quantity.replace(/^\s*\d+\s*/, '') || 'units';
    saveOrder({
      ...order,
      item: item.trim(),
      quantity: `${numericQuantity} ${unit}`,
      hospital: vendor.trim(),
      batchNumber: batchNumber.trim(),
      expiryDate,
    }, `Purchase order ${order.id} updated: ${item.trim()}, ${numericQuantity} ${unit} from ${vendor.trim()}.`);
    setDialog(null);
  };

  const deleteOrder = () => {
    if (!window.confirm(`Delete purchase order ${order.id} for ${order.item}?`)) return;
    saveAdminRequests(getAdminRequests().filter(request => request.id !== order.id));
    recordAdminActivity({ category: 'order', tone: 'warning', message: `Purchase order deleted: ${order.id} for ${order.item}.` });
  };

  return (
    <>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <button type="button" onClick={() => adjustQuantity(-1)} disabled={currentQuantity <= 1} className="btn-icon text-muted-foreground hover:text-warning disabled:opacity-40" title="Decrease order quantity" aria-label={`Decrease ${order.item} order quantity`}>
          <Minus size={15} />
        </button>
        <button type="button" onClick={() => adjustQuantity(1)} className="btn-icon text-muted-foreground hover:text-success" title="Increase order quantity" aria-label={`Increase ${order.item} order quantity`}>
          <Plus size={15} />
        </button>
        <button type="button" onClick={() => setDialog('view')} className="btn-icon text-muted-foreground hover:text-primary" title="View order" aria-label={`View ${order.item} order`}>
          <Eye size={15} />
        </button>
        <button type="button" onClick={() => setDialog('edit')} className="btn-icon text-muted-foreground hover:text-warning" title="Edit order" aria-label={`Edit ${order.item} order`}>
          <Pencil size={15} />
        </button>
        <button type="button" onClick={deleteOrder} className="btn-icon text-muted-foreground hover:text-danger" title="Delete order" aria-label={`Delete ${order.item} order`}>
          <Trash2 size={15} />
        </button>
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4" onClick={() => setDialog(null)}>
          <section role="dialog" aria-modal="true" aria-labelledby="purchase-order-dialog-title" className="w-full max-w-lg rounded-2xl bg-card shadow-2xl" onClick={event => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 id="purchase-order-dialog-title" className="font-bold text-foreground">{dialog === 'view' ? 'Purchase Order Details' : 'Edit Purchase Order'}</h2>
              <button type="button" onClick={() => setDialog(null)} className="btn-icon text-muted-foreground" aria-label="Close dialog"><X size={18} /></button>
            </div>
            {dialog === 'view' ? (
              <dl className="space-y-3 p-5 text-sm">
                {[
                  ['Order ID', order.id],
                  ['Item', order.item],
                  ['Quantity', order.quantity],
                  ['Vendor', order.hospital],
                  ['Status', order.purchaseStatus || 'Pending Approval'],
                  ['Batch', order.batchNumber || 'Not recorded'],
                  ['Expiry', order.expiryDate || 'Not recorded'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <form onSubmit={saveEdit} className="space-y-4 p-5">
                <label className="block text-sm font-medium text-foreground">Item name
                  <input value={item} onChange={event => setItem(event.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2" />
                </label>
                <label className="block text-sm font-medium text-foreground">Quantity
                  <input type="number" min="1" value={quantity} onChange={event => setQuantity(event.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2" />
                </label>
                <label className="block text-sm font-medium text-foreground">Vendor
                  <input value={vendor} onChange={event => setVendor(event.target.value)} required className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2" />
                </label>
                {order.type !== 'Blood' && (
                  <>
                    <label className="block text-sm font-medium text-foreground">Batch number
                      <input value={batchNumber} onChange={event => setBatchNumber(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2" />
                    </label>
                    <label className="block text-sm font-medium text-foreground">Expiry date
                      <input type="date" value={expiryDate} onChange={event => setExpiryDate(event.target.value)} className="mt-1 w-full rounded-lg border border-border bg-input px-3 py-2" />
                    </label>
                  </>
                )}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setDialog(null)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button>
                  <button type="submit" className="btn-primary px-4 py-2 text-sm">Save changes</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
