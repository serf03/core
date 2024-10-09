import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Client, GarmentType, Invoice, Product, ProductionRecord, User } from './types';

function AdminId() {

    const uid = localStorage.getItem("uid")// Asegúrate de que el uid está disponible 
    return uid;
}

// Obtener Factura y sus relaciones
const getInvoiceWithDetails = async (invoiceId: string) => {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceSnap = await getDoc(invoiceRef);

    if (!invoiceSnap.exists() || invoiceSnap.data().idAdministrador !== AdminId()) {
        throw new Error(`No se encontró la factura con ID: ${invoiceId} o no tienes acceso.`);
    }

    const invoiceData = invoiceSnap.data() as Invoice;

    // Crear el objeto de la factura con el ID
    const invoice = { ...invoiceData, id: invoiceId };

    // Obtener el cliente asociado a la factura
    const clientRef = doc(db, 'clients', invoice.clientId);
    const clientSnap = await getDoc(clientRef);

    if (!clientSnap.exists() || clientSnap.data().idAdministrador !== AdminId()) {
        throw new Error(`No se encontró el cliente con ID: ${invoice.clientId} o no tienes acceso.`);
    }

    const client = clientSnap.data() as Client;

    // Obtener los detalles de los productos y tipos de prendas en los items de la factura
    const products: Product[] = [];
    const garmentTypes: GarmentType[] = [];

    for (const item of invoice.items) {
        const productRef = doc(db, 'products', item.productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists() && productSnap.data().idAdministrador === AdminId()) {
            products.push(productSnap.data() as Product);
        } else {
            console.warn(`No se encontró el producto con ID: ${item.productId} o no tienes acceso.`);
        }

        const garmentTypeRef = doc(db, 'garmentTypes', item.garmentTypeId);
        const garmentTypeSnap = await getDoc(garmentTypeRef);

        if (garmentTypeSnap.exists() && garmentTypeSnap.data().idAdministrador === AdminId()) {
            garmentTypes.push(garmentTypeSnap.data() as GarmentType);
        } else {
            console.warn(`No se encontró el tipo de prenda con ID: ${item.garmentTypeId} o no tienes acceso.`);
        }
    }

    return {
        invoice,
        client,
        products,
        garmentTypes
    };
};

// Suscribirse a facturas
const subscribeToInvoices = (callback: (invoices: Invoice[]) => void) => {
    return onSnapshot(collection(db, 'invoices'), (snapshot) => {
        const invoices = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Invoice))
            .filter(invoice => invoice.idAdministrador === AdminId());
        callback(invoices);
    });
};

// Registros de producción
const addProductionRecord = async (record: Omit<ProductionRecord, 'id'>) => {
    const recordWithAdminId = { ...record, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'productionRecords'), recordWithAdminId);
    return { id: docRef.id, ...recordWithAdminId };
};

const updateProductionRecord = async (record: ProductionRecord) => {
    if (!record.id) {
        throw new Error("El ID del registro de producción es indefinido o inválido.");
    }
    if (record.idAdministrador !== AdminId()) {
        throw new Error("No tienes permiso para actualizar este registro de producción.");
    }
    await updateDoc(doc(db, 'productionRecords', record.id), { ...record });
    return record;
};

const deleteProductionRecord = async (id: string) => {
    const recordSnap = await getDoc(doc(db, 'productionRecords', id));
    if (recordSnap.exists() && recordSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'productionRecords', id));
    } else {
        throw new Error("No tienes permiso para eliminar este registro de producción.");
    }
};

const getProductionRecords = async () => {
    const querySnapshot = await getDocs(collection(db, 'productionRecords'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ProductionRecord))
        .filter(record => record.idAdministrador === AdminId());
};

const subscribeToProductionRecords = (callback: (records: ProductionRecord[]) => void) => {
    return onSnapshot(collection(db, 'productionRecords'), (snapshot) => {
        const records = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as ProductionRecord))
            .filter(record => record.idAdministrador === AdminId());
        callback(records);
    });
};

// Usuarios
const addUser = async (user: Omit<User, 'id'>) => {
    const userWithAdminId = { ...user, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'users'), userWithAdminId);
    return { id: docRef.id, ...userWithAdminId };
};

const updateUser = async (user: User) => {
    if (user.idAdministrador !== AdminId()) {
        throw new Error("No tienes permiso para actualizar este usuario.");
    }
    await updateDoc(doc(db, 'users', user.id), { ...user });
    return user;
};

const deleteUser = async (id: string) => {
    const userSnap = await getDoc(doc(db, 'users', id));
    if (userSnap.exists() && userSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'users', id));
    } else {
        throw new Error("No tienes permiso para eliminar este usuario.");
    }
};

const getUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => user.idAdministrador === AdminId());
};

const subscribeToUsers = (callback: (users: User[]) => void) => {
    return onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as User))
            .filter(user => user.idAdministrador === AdminId());
        callback(users);
    });
};

// Clientes
const addClient = async (client: Omit<Client, 'id'>) => {
    const clientWithAdminId = { ...client, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'clients'), clientWithAdminId);
    return { id: docRef.id, ...clientWithAdminId };
};

const updateClient = async (client: Client) => {
    if (!client.id) {
        throw new Error("El ID del cliente es indefinido o inválido.");
    }
    if (client.idAdministrador !== AdminId()) {
        throw new Error("No tienes permiso para actualizar este cliente.");
    }
    await updateDoc(doc(db, 'clients', client.id), { ...client });
    return client;
};

const deleteClient = async (id: string) => {
    const clientSnap = await getDoc(doc(db, 'clients', id));
    if (clientSnap.exists() && clientSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'clients', id));
    } else {
        throw new Error("No tienes permiso para eliminar este cliente.");
    }
};

const getClients = async () => {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Client))
        .filter(client => client.idAdministrador === AdminId());
};

const subscribeToClients = (callback: (clients: Client[]) => void) => {
    return onSnapshot(collection(db, 'clients'), (snapshot) => {
        const clients = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Client))
            .filter(client => client.idAdministrador === AdminId());
        callback(clients);
    });
};

// Productos
const addProduct = async (product: Omit<Product, 'id'>) => {
    const productWithAdminId = { ...product, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'products'), productWithAdminId);
    return { id: docRef.id, ...productWithAdminId };
};

const updateProduct = async (product: Product) => {
    if (!product.id) {
        throw new Error("El ID del producto es indefinido o inválido.");
    }
    if (product.idAdministrador !== AdminId()) {
        throw new Error("No tienes permiso para actualizar este producto.");
    }
    await updateDoc(doc(db, 'products', product.id), { ...product });
    return product;
};

const deleteProduct = async (id: string) => {
    const productSnap = await getDoc(doc(db, 'products', id));
    if (productSnap.exists() && productSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'products', id));
    } else {
        throw new Error("No tienes permiso para eliminar este producto.");
    }
};

const getProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Product))
        .filter(product => product.idAdministrador === AdminId());
};

const subscribeToProducts = (callback: (products: Product[]) => void) => {
    return onSnapshot(collection(db, 'products'), (snapshot) => {
        const products = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Product))
            .filter(product => product.idAdministrador === AdminId());
        callback(products);
    });
};

// Tipos de Prenda
const addGarmentType = async (type: Omit<GarmentType, 'id'>) => {
    const typeWithAdminId = { ...type, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'garmentTypes'), typeWithAdminId);
    return { id: docRef.id, ...typeWithAdminId };
};

const updateGarmentType = async (type: GarmentType) => {
    if (!type.id) {
        throw new Error("El ID del tipo de prenda es indefinido o inválido.");
    }
    if (type.idAdministrador !== AdminId()) {
        throw new Error("No tienes permiso para actualizar este tipo de prenda.");
    }
    await updateDoc(doc(db, 'garmentTypes', type.id), { ...type });
    return type;
};

const deleteGarmentType = async (id: string) => {
    const typeSnap = await getDoc(doc(db, 'garmentTypes', id));
    if (typeSnap.exists() && typeSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'garmentTypes', id));
    } else {
        throw new Error("No tienes permiso para eliminar este tipo de prenda.");
    }
};

const getGarmentTypes = async () => {
    const querySnapshot = await getDocs(collection(db, 'garmentTypes'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as GarmentType))
        .filter(type => type.idAdministrador === AdminId());
};

const subscribeToGarmentTypes = (callback: (types: GarmentType[]) => void) => {
    return onSnapshot(collection(db, 'garmentTypes'), (snapshot) => {
        const types = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as GarmentType))
            .filter(type => type.idAdministrador === AdminId());
        callback(types);
    });
};
const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const invoiceWithAdminId = { ...invoice, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'invoices'), invoiceWithAdminId);
    return { id: docRef.id, ...invoiceWithAdminId };
};

const updateInvoice = async (invoice: Invoice) => {
    if (!invoice.id) {
        throw new Error("El ID de la factura es indefinido o inválido.");
    }
    if (invoice.idAdministrador !== AdminId()) {
        throw new Error("No tienes permiso para actualizar esta factura.");
    }
    await updateDoc(doc(db, 'invoices', invoice.id), { ...invoice });
    return invoice;
};

export { addClient, addGarmentType, addInvoice, addProduct, addProductionRecord, addUser, deleteClient, deleteGarmentType, deleteProduct, deleteProductionRecord, deleteUser, getClients, getGarmentTypes, getInvoiceWithDetails, getProductionRecords, getProducts, getUsers, subscribeToClients, subscribeToGarmentTypes, subscribeToInvoices, subscribeToProductionRecords, subscribeToProducts, subscribeToUsers, updateClient, updateGarmentType, updateInvoice, updateProduct, updateProductionRecord, updateUser };

