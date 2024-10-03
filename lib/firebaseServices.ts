import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Client, GarmentType, Invoice, Product, ProductionRecord, User } from './types';

// Usuarios
export const addUser = async (user: Omit<User, 'id'>) => {
    const docRef = await addDoc(collection(db, 'users'), user);
    return { id: docRef.id, ...user };
};

export const updateUser = async (user: User) => {
    await updateDoc(doc(db, 'users', user.id), { ...user });
    return user;
};

export const deleteUser = async (id: string) => {
    await deleteDoc(doc(db, 'users', id));
};

export const getUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        callback(users);
    });
};

// Obtener Usuario por ID
export const getUserById = async (id: string) => {
    const docRef = doc(db, 'users', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as User) : null;
};

// Clientes
export const addClient = async (client: Omit<Client, 'id'>) => {
    const docRef = await addDoc(collection(db, 'clients'), client);
    return { id: docRef.id, ...client };
};

export const updateClient = async (client: Client) => {
    await updateDoc(doc(db, 'clients', client.id), { ...client });
    return client;
};

export const deleteClient = async (id: string) => {
    await deleteDoc(doc(db, 'clients', id));
};

export const getClients = async () => {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
};

export const subscribeToClients = (callback: (clients: Client[]) => void) => {
    return onSnapshot(collection(db, 'clients'), (snapshot) => {
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
        callback(clients);
    });
};

// Obtener Cliente por ID
export const getClientById = async (id: string) => {
    const docRef = doc(db, 'clients', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Client) : null;
};

// Productos
export const addProduct = async (product: Omit<Product, 'id'>) => {
    const docRef = await addDoc(collection(db, 'products'), product);
    return { id: docRef.id, ...product };
};

export const updateProduct = async (product: Product) => {
    await updateDoc(doc(db, 'products', product.id), { ...product });
    return product;
};

export const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
};

export const getProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    return onSnapshot(collection(db, 'products'), (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        callback(products);
    });
};

// Obtener Producto por ID
export const getProductById = async (id: string) => {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Product) : null;
};

// Tipos de Prendas
export const addGarmentType = async (garmentType: Omit<GarmentType, 'id'>) => {
    const docRef = await addDoc(collection(db, 'garmentTypes'), garmentType);
    return { id: docRef.id, ...garmentType };
};

export const updateGarmentType = async (garmentType: GarmentType) => {
    await updateDoc(doc(db, 'garmentTypes', garmentType.id), { ...garmentType });
    return garmentType;
};

export const deleteGarmentType = async (id: string) => {
    await deleteDoc(doc(db, 'garmentTypes', id));
};

export const getGarmentTypes = async () => {
    const querySnapshot = await getDocs(collection(db, 'garmentTypes'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GarmentType));
};

export const subscribeToGarmentTypes = (callback: (garmentTypes: GarmentType[]) => void) => {
    return onSnapshot(collection(db, 'garmentTypes'), (snapshot) => {
        const garmentTypes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GarmentType));
        callback(garmentTypes);
    });
};

// Obtener Tipo de Prenda por ID
export const getGarmentTypeById = async (id: string) => {
    const docRef = doc(db, 'garmentTypes', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as GarmentType) : null;
};

// Facturas
export const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const docRef = await addDoc(collection(db, 'invoices'), invoice);
    return { id: docRef.id, ...invoice };
};

export const updateInvoice = async (invoice: Invoice) => {
    await updateDoc(doc(db, 'invoices', invoice.id), { ...invoice });
    return invoice;
};

export const deleteInvoice = async (id: string) => {
    await deleteDoc(doc(db, 'invoices', id));
};

export const getInvoices = async () => {
    const querySnapshot = await getDocs(collection(db, 'invoices'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
};

export const subscribeToInvoices = (callback: (invoices: Invoice[]) => void) => {
    return onSnapshot(collection(db, 'invoices'), (snapshot) => {
        const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Invoice));
        callback(invoices);
    });
};

// Obtener Factura por ID
export const getInvoiceById = async (id: string) => {
    const docRef = doc(db, 'invoices', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Invoice) : null;
};

// Registros de Producción
export const addProductionRecord = async (record: Omit<ProductionRecord, 'id'>) => {
    const docRef = await addDoc(collection(db, 'productionRecords'), record);
    return { id: docRef.id, ...record };
};

export const updateProductionRecord = async (record: ProductionRecord) => {
    await updateDoc(doc(db, 'productionRecords', record.id), { ...record });
    return record;
};

export const deleteProductionRecord = async (id: string) => {
    await deleteDoc(doc(db, 'productionRecords', id));
};

export const getProductionRecords = async () => {
    const querySnapshot = await getDocs(collection(db, 'productionRecords'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionRecord));
};

export const subscribeToProductionRecords = (callback: (records: ProductionRecord[]) => void) => {
    return onSnapshot(collection(db, 'productionRecords'), (snapshot) => {
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionRecord));
        callback(records);
    });
};

// Obtener Registro de Producción por ID
export const getProductionRecordById = async (id: string) => {
    const docRef = doc(db, 'productionRecords', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as ProductionRecord) : null;
};


export const deletePrinter = async (id: string) => {
    await deleteDoc(doc(db, 'printers', id));
};

