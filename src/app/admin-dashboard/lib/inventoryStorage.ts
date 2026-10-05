import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

export type InventoryKind = 'medicine' | 'supplies' | 'blood';

const inventoryKeys: Record<InventoryKind, string> = {
  medicine: 'mediconnect-medicine-inventory',
  supplies: 'mediconnect-supplies-inventory',
  blood: 'mediconnect-blood-inventory',
};
const INVENTORY_RECEIPTS_KEY = 'mediconnect-inventory-receipts';
export const INVENTORY_CHANGED = 'mediconnect-inventory-changed';

export interface InventoryRecord {
  id: string;
  name: string;
  quantity: number;
  batchNumber?: string;
  expiryDate?: string;
  supplier?: string;
  minimumStock?: number;
  status?: string;
  bloodGroup?: string;
  bloodBank?: string;
  units?: number;
  lastUpdated?: string;
  receiptIds?: string[];
}

export interface InventoryReceipt {
  id: string;
  type: InventoryKind;
  item: string;
  quantity: number;
  vendor: string;
  batchNumber: string;
  expiryDate: string;
  receivedAt: string;
}

export function usePersistentInventory<T extends InventoryRecord>(
  type: InventoryKind,
  initialInventory: T[],
): [T[], Dispatch<SetStateAction<T[]>>] {
  const [inventory, setInventory] = useState<T[]>(initialInventory);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(inventoryKeys[type]);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const savedInventory = parsed as T[];
          if (savedInventory.length > 0 && savedInventory.every(item => item.id.startsWith('received-'))) {
            const merged = [...initialInventory];
            savedInventory.forEach(received => {
              const sameBatch = merged.find(item =>
                item.name.toLowerCase() === received.name.toLowerCase() &&
                (item.batchNumber || '') === (received.batchNumber || '')
              );
              if (sameBatch) {
                sameBatch.quantity += received.quantity;
                sameBatch.expiryDate = received.expiryDate || sameBatch.expiryDate;
                sameBatch.supplier = received.supplier || sameBatch.supplier;
              } else {
                merged.unshift(received);
              }
            });
            setInventory(merged);
          } else {
            setInventory(savedInventory);
          }
        }
      }
    } catch (error) {
      console.error(`Could not load ${type} inventory from browser storage.`, error);
    }
    setLoaded(true);

    const syncInventory = () => {
      try {
        const stored = window.localStorage.getItem(inventoryKeys[type]);
        if (stored) setInventory(JSON.parse(stored) as T[]);
      } catch (error) {
        console.error(`Could not refresh ${type} inventory from browser storage.`, error);
      }
    };
    window.addEventListener(INVENTORY_CHANGED, syncInventory);
    window.addEventListener('storage', syncInventory);
    return () => {
      window.removeEventListener(INVENTORY_CHANGED, syncInventory);
      window.removeEventListener('storage', syncInventory);
    };
  }, [type]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(inventoryKeys[type], JSON.stringify(inventory));
    } catch (error) {
      console.error(`Could not save ${type} inventory to browser storage.`, error);
    }
  }, [inventory, loaded, type]);

  return [inventory, setInventory];
}

export function getInventoryReceipts(): InventoryReceipt[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(INVENTORY_RECEIPTS_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as InventoryReceipt[] : [];
  } catch (error) {
    console.error('Could not load inventory receipt history.', error);
    return [];
  }
}

export function receivePurchaseOrderStock(receipt: InventoryReceipt): void {
  if (typeof window === 'undefined') throw new Error('Inventory can only be updated in a browser.');
  const receipts = getInventoryReceipts();
  if (receipts.some(savedReceipt => savedReceipt.id === receipt.id)) return;

  const key = inventoryKeys[receipt.type];
  let inventory: InventoryRecord[] = [];
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) throw new Error(`Stored ${receipt.type} inventory is invalid.`);
      inventory = parsed as InventoryRecord[];
    }
  } catch (error) {
    console.error(`Could not read ${receipt.type} inventory before receiving order.`, error);
    throw error;
  }

  if (inventory.some(record => record.receiptIds?.includes(receipt.id))) {
    window.localStorage.setItem(INVENTORY_RECEIPTS_KEY, JSON.stringify([receipt, ...receipts]));
    window.dispatchEvent(new Event(INVENTORY_CHANGED));
    return;
  }

  if (receipt.type === 'blood') {
    const group = receipt.item.replace(/\s+blood$/i, '').trim();
    const existingBlood = inventory.find(record => String(record.bloodGroup).toLowerCase() === group.toLowerCase() &&
      String(record.bloodBank).toLowerCase() === receipt.vendor.toLowerCase());
    if (existingBlood) {
      existingBlood.units = Number(existingBlood.units) + receipt.quantity;
      existingBlood.lastUpdated = receipt.receivedAt.slice(0, 10);
      existingBlood.receiptIds = [...(existingBlood.receiptIds || []), receipt.id];
    } else {
      inventory.unshift({
        id: `received-${receipt.id}`,
        name: receipt.item,
        bloodGroup: group,
        units: receipt.quantity,
        bloodBank: receipt.vendor,
        location: 'Receiving',
        contact: 'Not provided',
        lastUpdated: receipt.receivedAt.slice(0, 10),
        quantity: receipt.quantity,
        receiptIds: [receipt.id],
      });
    }
    window.localStorage.setItem(key, JSON.stringify(inventory));
    window.localStorage.setItem(INVENTORY_RECEIPTS_KEY, JSON.stringify([receipt, ...receipts]));
    window.dispatchEvent(new Event(INVENTORY_CHANGED));
    return;
  }

  const existing = inventory.find(record =>
    record.name.toLowerCase() === receipt.item.toLowerCase() &&
    (record.batchNumber || '') === receipt.batchNumber
  );
  if (existing) {
    existing.quantity += receipt.quantity;
    existing.expiryDate = receipt.expiryDate || existing.expiryDate;
    existing.supplier = receipt.vendor;
  } else {
    const sameItem = inventory.find(record => record.name.toLowerCase() === receipt.item.toLowerCase());
    const batchFields = {
      id: `received-${receipt.id}`,
      name: receipt.item,
      supplier: receipt.vendor,
      batchNumber: receipt.batchNumber,
      expiryDate: receipt.expiryDate,
      quantity: receipt.quantity,
      status: receipt.expiryDate && receipt.expiryDate < new Date().toISOString().slice(0, 10)
        ? 'Expired'
        : 'Available',
      receiptIds: [receipt.id],
    };
    if (sameItem) {
      inventory.unshift({ ...sameItem, ...batchFields });
    } else if (receipt.type === 'medicine') {
      inventory.unshift({
        ...batchFields,
        genericName: receipt.item,
        category: 'Other',
        manufacturer: receipt.vendor,
        price: 0,
        prescriptionRequired: false,
        location: 'Receiving',
      });
    } else {
      inventory.unshift({
        ...batchFields,
        category: 'Other',
        minimumStock: 10,
        location: 'Receiving',
      });
    }
  }

  inventory.forEach(record => {
    if (record.name.toLowerCase() !== receipt.item.toLowerCase() || record.batchNumber !== receipt.batchNumber) return;
    if (record.id === `received-${receipt.id}` || record === existing) {
      record.receiptIds = [...(record.receiptIds || []), receipt.id];
    }
    const expired = record.expiryDate && record.expiryDate < new Date().toISOString().slice(0, 10);
    record.status = expired ? 'Expired' : record.quantity === 0 ? 'Out of Stock' :
      record.quantity <= (receipt.type === 'supplies' ? record.minimumStock ?? 0 : 5) ? 'Low Stock' : 'Available';
  });

  window.localStorage.setItem(key, JSON.stringify(inventory));
  window.localStorage.setItem(INVENTORY_RECEIPTS_KEY, JSON.stringify([receipt, ...receipts]));
  window.dispatchEvent(new Event(INVENTORY_CHANGED));
}
