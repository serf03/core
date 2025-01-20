//firebaseServices.ts
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, setDoc } from 'firebase/firestore';
import { getUserFirebaseInstances } from './userFirebase';
import { Client, Expense, GarmentType, Invoice, InvoiceDetail, InvoiceItem, InvoiceItemDetails, Product, ProductionRecord, User, UserFirebaseConfig } from './types';

function AdminId() {

    const uid = localStorage.getItem("uid")// Asegúrate de que el uid está disponible 
    return uid;
}

export async function getUserFirebaseConfig(userId: string): Promise<UserFirebaseConfig | null> {
    const { db } = await getUserFirebaseInstances();
    const docRef = doc(db, "userConfigs", userId)
    const docSnap = await getDoc(docRef)
  
    if (docSnap.exists()) {
      return docSnap.data() as UserFirebaseConfig
    } else {
      return null
    }
  }
  
  export async function setUserFirebaseConfig(userId: string, config: UserFirebaseConfig): Promise<void> {
    const { db } = await getUserFirebaseInstances();
    const docRef = doc(db, "userConfigs", userId)
    await setDoc(docRef, config)
  }
  

// Add a new expense
export const addExpense = async (expense: Omit<Expense, 'id' | 'idAdministrador'>) => {
    const { db } = await getUserFirebaseInstances();
    const expenseWithAdminId = { ...expense, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'expenses'), expenseWithAdminId);
    return { id: docRef.id, ...expenseWithAdminId };
};

// Update an existing expense
export const updateExpense = async (expense: Expense) => {
    const { db } = await getUserFirebaseInstances();
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
    const { db } = await getUserFirebaseInstances();
    const expenseSnap = await getDoc(doc(db, 'expenses', id));
    if (expenseSnap.exists() && expenseSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'expenses', id));
    } else {
        throw new Error("No tienes permiso para eliminar este gasto.");
    }
};

// Get all expenses for the current admin
export const getExpenses = async () => {
    const { db } = await getUserFirebaseInstances();
    const querySnapshot = await getDocs(collection(db, 'expenses'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Expense))
        .filter(expense => expense.idAdministrador === AdminId());
};

// Subscribe to expenses changes
export const subscribeToExpenses = async (callback: (expenses: Expense[]) => void) => {
    const { db } = await getUserFirebaseInstances();
    return onSnapshot(collection(db, 'expenses'), (snapshot) => {
        const expenses = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Expense))
            .filter(expense => expense.idAdministrador === AdminId());
        callback(expenses);
    });
};
const getInvoiceWithDetails = async (invoiceId: string): Promise<InvoiceDetail> => {
    try {
        const { db } = await getUserFirebaseInstances();
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
        const { db } = await getUserFirebaseInstances();
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
    const { db } = await getUserFirebaseInstances();
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


const subscribeToInvoices = async (callback: (invoices: Invoice[]) => void) => {
    const { db } = await getUserFirebaseInstances();
    return onSnapshot(collection(db, 'invoices'), (snapshot) => {
        const invoices = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Invoice))
            .filter(invoice => invoice.idAdministrador === AdminId());
        callback(invoices);
    });
};

// Registros de producción
const addProductionRecord = async (record: Omit<ProductionRecord, 'id'>) => {
    const { db } = await getUserFirebaseInstances();
    const recordWithAdminId = { ...record, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'productionRecords'), recordWithAdminId);
    return { id: docRef.id, ...recordWithAdminId };
};

const updateProductionRecord = async (record: ProductionRecord) => {
    const { db } = await getUserFirebaseInstances();
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
    const { db } = await getUserFirebaseInstances();
    const recordSnap = await getDoc(doc(db, 'productionRecords', id));
    if (recordSnap.exists() && recordSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'productionRecords', id));
    } else {
        throw new Error("No tienes permiso para eliminar este registro de producción.");
    }
};

const getProductionRecords = async () => {
    const { db } = await getUserFirebaseInstances();
    const querySnapshot = await getDocs(collection(db, 'productionRecords'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ProductionRecord))
        .filter(record => record.idAdministrador === AdminId());
};

const subscribeToProductionRecords = async (callback: (records: ProductionRecord[]) => void) => {
    const { db } = await getUserFirebaseInstances();
    return onSnapshot(collection(db, 'productionRecords'), (snapshot) => {
        const records = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as ProductionRecord))
            .filter(record => record.idAdministrador === AdminId());
        callback(records);
    });
};

// Usuarios
const addUser = async (user: Omit<User, 'id'>) => {
    const { db } = await getUserFirebaseInstances();
    const userWithAdminId = { ...user, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'users'), userWithAdminId);
    return { id: docRef.id, ...userWithAdminId };
};

const updateUser = async (user: User) => {
    const { db } = await getUserFirebaseInstances();
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
    const { db } = await getUserFirebaseInstances();
    const userSnap = await getDoc(doc(db, 'users', id));
    if (userSnap.exists() && userSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'users', id));
    } else {
        throw new Error("No tienes permiso para eliminar este usuario.");
    }
};

const getUsers = async () => {
    const { db } = await getUserFirebaseInstances();
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as User))
        .filter(user => user.idAdministrador === AdminId());
};

const subscribeToUsers = async (callback: (users: User[]) => void) => {
    const { db } = await getUserFirebaseInstances();
    return onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as User))
            .filter(user => user.idAdministrador === AdminId());
        callback(users);
    });
};

// Clientes
const addClient = async (client: Omit<Client, 'id'>) => {
    const { db } = await getUserFirebaseInstances();
    const clientWithAdminId = { ...client, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'clients'), clientWithAdminId);
    return { id: docRef.id, ...clientWithAdminId };
};

const updateClient = async (client: Client) => {
    const { db } = await getUserFirebaseInstances();
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
    const { db } = await getUserFirebaseInstances();
    const clientSnap = await getDoc(doc(db, 'clients', id));
    if (clientSnap.exists() && clientSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'clients', id));
    } else {
        throw new Error("No tienes permiso para eliminar este cliente.");
    }
};

const getClients = async () => {
    const { db } = await getUserFirebaseInstances();
    const querySnapshot = await getDocs(collection(db, 'clients'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Client))
        .filter(client => client.idAdministrador === AdminId());
};

const subscribeToClients = async (callback: (clients: Client[]) => void) => {
    const { db } = await getUserFirebaseInstances();
    return onSnapshot(collection(db, 'clients'), (snapshot) => {
        const clients = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Client))
            .filter(client => client.idAdministrador === AdminId());
        callback(clients);
    });
};

// Productos
const addProduct = async (product: Omit<Product, 'id'>) => {
    const { db } = await getUserFirebaseInstances();
    const productWithAdminId = { ...product, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'products'), productWithAdminId);
    return { id: docRef.id, ...productWithAdminId };
};

const updateProduct = async (product: Product) => {
    const { db } = await getUserFirebaseInstances();
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
    const { db } = await getUserFirebaseInstances();
    const productSnap = await getDoc(doc(db, 'products', id));
    if (productSnap.exists() && productSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'products', id));
    } else {
        throw new Error("No tienes permiso para eliminar este producto.");
    }
};

const getProducts = async () => {
    const { db } = await getUserFirebaseInstances();
    const querySnapshot = await getDocs(collection(db, 'products'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Product))
        .filter(product => product.idAdministrador === AdminId());
};

const subscribeToProducts = async (callback: (products: Product[]) => void) => {
    const { db } = await getUserFirebaseInstances();
    return onSnapshot(collection(db, 'products'), (snapshot) => {
        const products = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Product))
            .filter(product => product.idAdministrador === AdminId());
        callback(products);
    });
};

// Tipos de Prenda
const addGarmentType = async (type: Omit<GarmentType, 'id'>) => {
    try {
        const { db } = await getUserFirebaseInstances();
        const typeWithAdminId = { ...type, idAdministrador: AdminId() };

        // Intenta agregar el documento a Firestore
        let docRef;
        try {
            docRef = await addDoc(collection(db, 'garmentTypes'), typeWithAdminId);
        } catch (err) {
            console.error("Error adding document: ", err);
            throw err;  // Relanzar el error para que el bloque catch principal lo maneje
        }

        // Aquí va el retorno solo si no hubo errores
        return { id: docRef.id, ...typeWithAdminId };
    } catch (error) {
        console.error("Error adding garment type: ", error);
        if (error && typeof error === 'object' && 'message' in error) {
            console.error("Error details: ", (error as { message: string }).message);
        } else {
            console.error("Unknown error: ", error);
        }
        // Aquí puedes retornar un valor por defecto o un objeto de error si lo necesitas
        return null;  // O lo que prefieras
    }
};

const updateGarmentType = async (type: GarmentType) => {
    const { db } = await getUserFirebaseInstances();
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
    const { db } = await getUserFirebaseInstances();
    const typeSnap = await getDoc(doc(db, 'garmentTypes', id));
    if (typeSnap.exists() && typeSnap.data().idAdministrador === AdminId()) {
        await deleteDoc(doc(db, 'garmentTypes', id));
    } else {
        throw new Error("No tienes permiso para eliminar este tipo de prenda.");
    }
};

const getGarmentTypes = async () => {
    const { db } = await getUserFirebaseInstances();
    const querySnapshot = await getDocs(collection(db, 'garmentTypes'));
    return querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as GarmentType))
        .filter(type => type.idAdministrador === AdminId());
};

const subscribeToGarmentTypes = async (callback: (types: GarmentType[]) => void) => {
    const { db } = await getUserFirebaseInstances();
    return onSnapshot(collection(db, 'garmentTypes'), (snapshot) => {
        const types = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as GarmentType))
            .filter(type => type.idAdministrador === AdminId());
        callback(types);
    });
};
const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const { db } = await getUserFirebaseInstances();
    const invoiceWithAdminId = { ...invoice, idAdministrador: AdminId() };
    const docRef = await addDoc(collection(db, 'invoices'), invoiceWithAdminId);
    return { id: docRef.id, ...invoiceWithAdminId };
};

const updateInvoice = async (invoice: Invoice) => {
    const { db } = await getUserFirebaseInstances();
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

