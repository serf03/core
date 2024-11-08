//firebaseServices.ts
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Client, Expense, GarmentType, Invoice, InvoiceDetail, InvoiceItem, InvoiceItemDetails, Product, ProductionRecord, User } from './types';

function AdminId() {

    const uid = localStorage.getItem("uid")// Asegúrate de que el uid está disponible 
    return uid;
}

// Add a new expense
export const addExpense = async (expense: Omit<Expense, 'id' | 'idAdministrador'>) => {
    const expenseWithAdminId = { ...expense, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'expenses'), expenseWithAdminId);
    return { id: docRef.id, ...expenseWithAdminId };
};

// Update an existing expense
export const updateExpense = async (expense: Expense) => {
    if (!expense.id) {
        throw new Error("El ID del gasto es indefinido o inválido.");
    }
    if (expense.idAdministrador !== AdminId()) {
        throw new Error("No tienes permiso para actualizar este gasto.");
    }
    await updateDoc(doc(db, 'expenses', expense.id), { ...expense });
    return expense;
};

// Delete an expense
export const deleteExpense = async (id: string) => {
    const expenseSnap = await getDoc(doc(db, 'expenses', id));
    if (expenseSnap.exists() && expenseSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'expenses', id));
    } else {
        throw new Error("No tienes permiso para eliminar este gasto.");
    }
};

// Get all expenses for the current admin
export const getExpenses = async () => {
    const querySnapshot = await getDocs(collection(db, 'expenses'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Expense))
        .filter(expense => expense.idAdministrador === AdminId());
};

// Subscribe to expenses changes
export const subscribeToExpenses = (callback: (expenses: Expense[]) => void) => {
    return onSnapshot(collection(db, 'expenses'), (snapshot) => {
        const expenses = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Expense))
            .filter(expense => expense.idAdministrador === AdminId());
        callback(expenses);
    });
};
const getInvoiceWithDetails = async (invoiceId: string): Promise<InvoiceDetail> => {
    try {
        // Obtener la factura desde Firestore
        const invoiceRef = doc(db, 'invoices', invoiceId);
        const invoiceSnap = await getDoc(invoiceRef);

        if (!invoiceSnap.exists() || invoiceSnap.data().idAdministrador !== AdminId()) {
            throw new Error(`No se encontró la factura con ID: ${invoiceId} o no tienes acceso.`);
        }

        const invoiceData = invoiceSnap.data() as Invoice;

        // Obtener el cliente relacionado con la factura
        const clientId = invoiceData.clientId;
        const clientRef = doc(db, 'clients', clientId);
        const clientSnap = await getDoc(clientRef);

        const clientName = clientSnap.exists() ? clientSnap.data()?.name : null;

        if (!Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
            console.warn(`La factura con ID: ${invoiceId} no tiene ítems.`);
            return constructInvoiceDetail(invoiceData, [], clientName, invoiceData.total);
        }

        // Procesar cada item en la factura
        const itemsDetails = await Promise.all(
            invoiceData.items.map(async (item, index) => {
                const processedItem = await processInvoiceItems(item, index);
                if (!processedItem) {
                    console.warn(`El ítem en la posición ${index} no se procesó correctamente.`);
                }
                return processedItem;
            })
        );

        console.log(itemsDetails)
        // Filtrar los elementos válidos en caso de que `processInvoiceItem` devuelva null
        const validItemsDetails: InvoiceItemDetails[] = itemsDetails.filter(item => item !== null) as InvoiceItemDetails[];

        // Calcular el total de los ítems válidos
        const calculatedTotal = validItemsDetails.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const total = invoiceData.total || calculatedTotal;

        // Retornar la información estructurada según la interfaz InvoiceDetail
        return constructInvoiceDetail(invoiceData, validItemsDetails, clientName, total);
    } catch (error) {
        console.error('Error obteniendo los detalles de la factura:', error);
        throw new Error(`Error al obtener los detalles de la factura con ID: ${invoiceId}.`);
    }
};

// Ejemplo de función para procesar un item de la factura (asegúrate de personalizarla según tus datos)
const processInvoiceItems = async (item: InvoiceItem, index: number): Promise<InvoiceItemDetails | null> => {
    try {
        // Obtener los detalles del producto y tipo de prenda relacionados
        const productRef = doc(db, 'products', item.productId);
        const garmentTypeRef = doc(db, 'garmentTypes', item.garmentTypeId);

        const [productSnap, garmentTypeSnap] = await Promise.all([getDoc(productRef), getDoc(garmentTypeRef)]);

        if (!productSnap.exists() || !garmentTypeSnap.exists()) {
            console.warn(`Producto o tipo de prenda no encontrado para el ítem en la posición ${index}.`);
            return null;
        }

        const productData = productSnap.data() as Product;
        const garmentTypeData = garmentTypeSnap.data() as GarmentType;

        return {
            product: productData.name,
            garmentType: garmentTypeData.name,
            quantity: item.quantity,
            price: item.price,
            attachments: item.attachments
        };
    } catch (error) {
        console.error(`Error al procesar el ítem en la posición ${index}:`, error);
        return null;
    }
};

// Función para construir el objeto de detalle de la factura
const constructInvoiceDetail = (invoiceData: Invoice, items: InvoiceItemDetails[], clientName: string | null, total: number): InvoiceDetail => {
    return {
        client: clientName || "Cliente no encontrado",
        items,
        total,
        status: invoiceData.status,
        date: invoiceData.date,
        pickupDate: invoiceData.pickupDate,
        color: invoiceData.color,
        paymentType: invoiceData.paymentType,
        amountPaid: invoiceData.amountPaid,
        invoiceNumber: invoiceData.invoiceNumber
    };
};


const getLastInvoiceNumber = async (): Promise<number> => {
    const invoicesRef = collection(db, 'invoices');
    const invoicesQuery = query(invoicesRef, orderBy('invoiceNumber', 'desc'), limit(1));
    const lastInvoiceSnapshot = await getDocs(invoicesQuery);

    if (lastInvoiceSnapshot.empty) {
        return 0; // Si no hay facturas, empezamos desde 0
    }

    const lastInvoiceData = lastInvoiceSnapshot.docs[0].data();
    const lastNumber = parseInt(lastInvoiceData.invoiceNumber.slice(2), 10); // Aquí asumo que la numeración empieza con un prefijo de 2 caracteres
    return lastNumber;
};




// Función para procesar cada ítem de la factura
// const processInvoiceItem = async (item: InvoiceItem, index: number): Promise<InvoiceItemDetails | null> => {
//     if (!item.productId) {
//         console.warn(`El ítem ${index + 1} no tiene un productId válido.`);
//         return null;
//     }

//     console.log(`Procesando ítem con productId: ${item.productId}`);

//     // Obtener el producto
//     const productSnap = await getDoc(doc(db, 'products', item.productId));

//     if (!productSnap.exists() || productSnap.data().idAdministrador !== AdminId()) {
//         console.warn(`No se encontró el producto con ID: ${item.productId} o no tienes acceso.`);
//         return null;
//     }

//     const productData = productSnap.data() as Product;
//     const { name: productName, garmentTypeId } = productData;

//     if (!garmentTypeId) {
//         console.warn(`El producto con ID: ${item.productId} no tiene un garmentTypeId válido.`);
//         return null;
//     }

//     // Obtener el tipo de prenda
//     const garmentTypeSnap = await getDoc(doc(db, 'garmentTypes', garmentTypeId));

//     if (!garmentTypeSnap.exists() || garmentTypeSnap.data().idAdministrador !== AdminId()) {
//         console.warn(`No se encontró el tipo de prenda con ID: ${garmentTypeId} o no tienes acceso.`);
//         return null;
//     }

//     const garmentTypeData = garmentTypeSnap.data() as GarmentType;
//     const garmentTypeName = garmentTypeData.name;

//     console.log(`Garment Type: ${garmentTypeName}`);

//     // Retornar el detalle del ítem
//     return {
//         product: productName,
//         garmentType: garmentTypeName,
//         quantity: item.quantity,
//         price: item.price,
//         attachments: item.attachments ?? []
//     };
// };

// Función para construir el objeto de detalle de la factura



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

    // Verifica que user.id esté definido antes de usarlo
    if (!user.id) {
        throw new Error("ID de usuario no definido.");
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

export { addClient, addGarmentType, addInvoice, addProduct, addProductionRecord, addUser, deleteClient, deleteGarmentType, deleteProduct, deleteProductionRecord, deleteUser, getClients, getGarmentTypes, getInvoiceWithDetails, getLastInvoiceNumber, getProductionRecords, getProducts, getUsers, subscribeToClients, subscribeToGarmentTypes, subscribeToInvoices, subscribeToProductionRecords, subscribeToProducts, subscribeToUsers, updateClient, updateGarmentType, updateInvoice, updateProduct, updateProductionRecord, updateUser };

