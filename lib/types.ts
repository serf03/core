interface Expense {
    id?: string
    description: string
    amount: number
    date: string
    idAdministrador: string;
}

// Definición de tipos
type UserRole = 'Administrador' | 'Facturador' | 'Operador' | 'Cliente'

interface User {
    id?: string
    name: string
    email: string
    clave: string
    role: UserRole,
    idAdministrador: string;
}

interface Client {
    id?: string; // Propiedad requerida
    name: string;
    email: string
    phone: string;
    cedula: string;
    direccion: string; // Asegúrate de que este nombre coincida
    idAdministrador: string;
    active?: boolean; // Esta propiedad también puede ser requerida
}

interface Product {
    id?: string
    name: string
    price: number
    productionTime: number
    status: 'Disponible' | 'En Uso' | 'En Mantenimiento' | 'Agotado'
    idAdministrador: string,
    garmentTypeId?: string
}

interface GarmentType {
    id?: string
    name: string
    basePrice: number
    description: string
    category: string
    idAdministrador: string
}
interface Attachment {
    id: string
    name: string
    price: number
    idAdministrador: string
}
interface InvoiceItem {
    productId: string
    garmentTypeId: string
    quantity: number
    price: number
    attachments: Attachment[]
    idAdministrador: string
}
interface Invoice {
    id: string
    clientId: string
    items: InvoiceItem[]
    total: number
    status: 'Pendiente' | 'En Proceso' | 'Lavando' | 'Planchando' | 'Completada' | 'Entregada' | 'Cancelada' | 'Parcialmente Pagada'
    date: string
    pickupDate: string
    color: string
    idAdministrador: string,
    paymentType: string
    amountPaid?: number,
    invoiceNumber: string
    pendingBalance: number
}
interface InvoiceItemDetails {
    product: string
    garmentType: string
    quantity: number
    price: number
    attachments: Attachment[]
}
interface InvoiceDetail {
    client: string
    items: InvoiceItemDetails[]
    total: number
    status: 'Pendiente' | 'En Proceso' | 'Lavando' | 'Planchando' | 'Completada' | 'Entregada' | 'Cancelada'
    date: string
    pickupDate: string
    color: string
    paymentType: string
    amountPaid?: number,
    invoiceNumber: string
}
interface ProductionRecord {
    id: string
    date: string
    amount: number
    type: 'Lavado' | 'Planchado' | 'Empaquetado'
    idAdministrador: string
}

interface Printers {
    name: string
    isDefault: boolean
    idAdministrador: string
}

interface TabsFacturacionProps {
    invoices: Invoice[];
    clients: Client[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    setIsCreateInvoiceDialogOpen: (isOpen: boolean) => void;
    setInvoiceToChangeStatus: (invoice: Invoice) => void;
    setIsChangeInvoiceStatusDialogOpen: (isOpen: boolean) => void;
    handlePrintInvoice: (invoice: Invoice) => void;
    handleCancelInvoice: (invoice: Invoice) => void;
    handleMakePayment: (invoice: Invoice) => void;
}

export type { Attachment, Client, Expense, GarmentType, Invoice, InvoiceDetail, InvoiceItem, InvoiceItemDetails, Printers, Product, ProductionRecord, TabsFacturacionProps, User, UserRole };

