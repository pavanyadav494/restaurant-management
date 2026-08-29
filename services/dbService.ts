import { MENU_ITEMS, initialStaff, TOTAL_TABLES } from '../constants';
import type { FoodItem, Order, StaffMember, Shift, AttendanceRecord, MonthlyReport, TableStatus } from '../types';

const DB_NAME = 'RandiMavaRestaurantDB';
const DB_VERSION = 2;

let db: IDBDatabase | null = null;

const STORES = {
    MENU: 'menu',
    ORDERS: 'orders',
    STAFF: 'staff',
    SHIFTS: 'shifts',
    ATTENDANCE: 'attendance',
    REPORTS: 'reports',
    SETTINGS: 'settings',
    TABLE_STATUS: 'tableStatus',
};

// This function initializes the database.
export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening database.');
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            if (!tempDb.objectStoreNames.contains(STORES.MENU)) {
                tempDb.createObjectStore(STORES.MENU, { keyPath: 'id' });
            }
            if (!tempDb.objectStoreNames.contains(STORES.ORDERS)) {
                const orderStore = tempDb.createObjectStore(STORES.ORDERS, { keyPath: 'id' });
                orderStore.createIndex('by_status', 'status', { unique: false });
            }
            if (!tempDb.objectStoreNames.contains(STORES.STAFF)) {
                tempDb.createObjectStore(STORES.STAFF, { keyPath: 'id' });
            }
            if (!tempDb.objectStoreNames.contains(STORES.SHIFTS)) {
                tempDb.createObjectStore(STORES.SHIFTS, { keyPath: 'id' });
            }
            if (!tempDb.objectStoreNames.contains(STORES.ATTENDANCE)) {
                tempDb.createObjectStore(STORES.ATTENDANCE, { keyPath: 'id' });
            }
            if (!tempDb.objectStoreNames.contains(STORES.REPORTS)) {
                tempDb.createObjectStore(STORES.REPORTS, { keyPath: 'id' });
            }
             if (!tempDb.objectStoreNames.contains(STORES.SETTINGS)) {
                tempDb.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
            }
            if (!tempDb.objectStoreNames.contains(STORES.TABLE_STATUS)) {
                tempDb.createObjectStore(STORES.TABLE_STATUS, { keyPath: 'tableNumber' });
            }
        };
    });
};

// Generic function to perform a DB operation.
const performDbOperation = <T>(storeName: string, mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            return reject('Database not initialized.');
        }
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
};

export const getAll = <T>(storeName: string): Promise<T[]> => performDbOperation(storeName, 'readonly', store => store.getAll());
export const add = <T>(storeName: string, item: T): Promise<IDBValidKey> => performDbOperation(storeName, 'readwrite', store => store.add(item));
export const update = <T>(storeName: string, item: T): Promise<IDBValidKey> => performDbOperation(storeName, 'readwrite', store => store.put(item));
export const deleteById = (storeName: string, id: string | number): Promise<void> => performDbOperation(storeName, 'readwrite', store => store.delete(id));

// Specific setting functions
export const getSetting = async (key: string): Promise<any> => {
    const result = await performDbOperation(STORES.SETTINGS, 'readonly', store => store.get(key));
    // The result from a get operation on an object store is the object itself
    return result ? (result as any).value : null;
};
export const setSetting = (key: string, value: any): Promise<IDBValidKey> => {
    return performDbOperation(STORES.SETTINGS, 'readwrite', store => store.put({ key, value }));
};


// Populates the database with initial data if it's empty.
export const populateInitialData = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject(new Error('Database not initialized.'));
            return;
        }

        console.log('Populating initial data into IndexedDB...');
        const transaction = db.transaction(Object.values(STORES), 'readwrite');
        const menuObjStore = transaction.objectStore(STORES.MENU);
        const staffObjStore = transaction.objectStore(STORES.STAFF);
        const settingsObjStore = transaction.objectStore(STORES.SETTINGS);
        const tableStatusObjStore = transaction.objectStore(STORES.TABLE_STATUS);

        MENU_ITEMS.forEach(item => menuObjStore.put(item));
        initialStaff.forEach(staff => staffObjStore.put(staff));
        settingsObjStore.put({ key: 'qrCodeUrl', value: 'https://i.imgur.com/g1fJ17A.png' });
        settingsObjStore.put({ key: 'recipientName', value: 'Randi Mava Restaurent' });
        settingsObjStore.put({ key: 'upiId', value: 'restaurant@exampleupi' });
        for (let i = 1; i <= TOTAL_TABLES; i++) {
            tableStatusObjStore.put({ tableNumber: i, status: 'available' } as TableStatus);
        }

        transaction.oncomplete = () => {
            console.log('Initial data populated successfully.');
            resolve();
        };
        transaction.onerror = () => {
            console.error('Error populating data:', transaction.error);
            reject(transaction.error ?? new Error('Failed to populate initial data.'));
        };
    });
};