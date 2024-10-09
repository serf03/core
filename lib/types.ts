
// Definición de tipos
type UserRole = 'Administrador' | 'Facturador' | 'Operador' | 'Cliente'

interface User {
    id: string
    name: string
    email: string
    role: UserRole
    idAdministrador: string;
}

interface Client {
    id?: string; // Propiedad requerida
    name: string;
    email: string;
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
    idAdministrador: string
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
    status: 'Pendiente' | 'En Proceso' | 'Lavando' | 'Planchando' | 'Completada' | 'Entregada' | 'Cancelada'
    date: string
    pickupDate: string
    color: string
    idAdministrador: string
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

export type { Attachment, Client, GarmentType, Invoice, InvoiceItem, Printers, Product, ProductionRecord, User, UserRole }

