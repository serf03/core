
// Definición de tipos
type UserRole = 'Administrador' | 'Facturador' | 'Operador' | 'Cliente'

interface User {
    id: string
    name: string
    email: string
    role: UserRole
}

interface Client {
    id: string
    name: string
    email: string
    phone: string
    cedula: string
}

interface Product {
    id: string
    name: string
    price: number
    stock: number
    productionTime: number
    status: 'Disponible' | 'En Uso' | 'En Mantenimiento' | 'Agotado'
}

interface GarmentType {
    id: string
    name: string
    basePrice: number
    description: string
    category: string
}

interface InvoiceItem {
    productId: string
    garmentTypeId: string
    quantity: number
    price: number
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
}

interface ProductionRecord {
    id: string
    date: string
    amount: number
    type: 'Lavado' | 'Planchado' | 'Empaquetado'
}

interface Printer {
    id: string
    name: string
    isDefault: boolean
}

export type {
    Client, GarmentType, Invoice, InvoiceItem, Printer, Product, ProductionRecord, User, UserRole
}
