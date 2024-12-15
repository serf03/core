import { useAuth } from '@/components/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import * as firebaseServices from "@/lib/firebaseServices"
import { Attachment, Client, GarmentType, Invoice, InvoiceItem, Product } from '@/lib/types'
import { AnimatePresence, motion } from 'framer-motion'
import { Banknote, Calendar, CreditCard, Mail, Palette, Phone, Plus, Search, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface CrearFacturaModuleProps {
    isCreateInvoiceDialogOpen: boolean
    setIsCreateInvoiceDialogOpen: (open: boolean) => void
    clientFilter: string
    setClientFilter: (filter: string) => void
    clientFilterType: 'cedula' | 'phone'
    setClientFilterType: (type: 'cedula' | 'phone') => void
    newInvoice: Omit<Invoice, 'id' | 'date'>
    setNewInvoice: React.Dispatch<React.SetStateAction<Omit<Invoice, 'id' | 'date'>>>
    filterClients: () => Client[]
    products: Product[]
    garmentTypes: GarmentType[]
    calculatePrice: (productId: string, garmentTypeId: string) => number
    calculatePickupDate: (items: InvoiceItem[]) => string
    handleCreateInvoice: (paymentType: string, amountPaid?: number) => void
    getLastInvoiceNumber: () => Promise<number>
    resetInvoice: () => void
}

function CrearInvoiceModule(props: CrearFacturaModuleProps) {
    const { user } = useAuth()

    const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false)
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
    const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'pending'>('cash')
    const [amountPaid, setAmountPaid] = useState(0)
    const [newClient, setNewClient] = useState<Client>({
        name: '',
        email: '',
        phone: '',
        cedula: '',
        idAdministrador: `${user?.uid}`,
        direccion: "",
    })
    const [openStates, setOpenStates] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const filteredClients = props.filterClients()
        if (filteredClients.length === 1) {
            const client = filteredClients[0]
            props.setNewInvoice({
                ...props.newInvoice,
                clientId: client.id || "",
            })
        }
    }, [props.clientFilter, props.clientFilterType])

    const handleAddAttachment = (itemIndex: number) => {
        const newItems = [...props.newInvoice.items]
        newItems[itemIndex].attachments.push({
            id: Date.now().toString(),
            name: '',
            price: 0,
            idAdministrador: `${user?.uid}`
        })
        props.setNewInvoice({ ...props.newInvoice, items: newItems })
    }

    const handleRemoveAttachment = (itemIndex: number, attachmentIndex: number) => {
        const newItems = [...props.newInvoice.items]
        newItems[itemIndex].attachments.splice(attachmentIndex, 1)
        props.setNewInvoice({ ...props.newInvoice, items: newItems })
    }

    const handleAttachmentChange = (
        itemIndex: number,
        attachmentIndex: number,
        field: keyof Attachment,
        value: string | number
    ) => {
        const newItems = [...props.newInvoice.items]

        if (newItems[itemIndex] && newItems[itemIndex].attachments[attachmentIndex]) {
            newItems[itemIndex].attachments[attachmentIndex] = {
                ...newItems[itemIndex].attachments[attachmentIndex],
                [field]: value,
            }
        }

        props.setNewInvoice({ ...props.newInvoice, items: newItems })
    }

    const handleCreateNewClient = async () => {
        try {
            await firebaseServices.addClient(newClient)
            setNewClient({
                name: '',
                email: '',
                phone: '',
                cedula: '',
                direccion: "",
                idAdministrador: `${user?.uid}`
            })
            setIsNewClientDialogOpen(false)
            toast.success('Cliente agregado exitosamente')
        } catch (error) {
            console.error("Error adding client: ", error)
            toast.error("Error al agregar el cliente")
        }
    }

    const handlePaymentSubmit = () => {
        if (paymentType === 'cash' || paymentType === 'card') {
            if (amountPaid < props.newInvoice.total) {
                props.handleCreateInvoice(paymentType, amountPaid);
            } else {
                props.handleCreateInvoice(paymentType, props.newInvoice.total);
            }
        } else if (paymentType === 'pending') {
            props.handleCreateInvoice(paymentType, 0);
        }
        setIsPaymentDialogOpen(false);
        props.setIsCreateInvoiceDialogOpen(false);
    };

    const isInvoiceValid = () => {
        return (
            props.newInvoice.clientId &&
            props.newInvoice.items.length > 0 &&
            props.newInvoice.items.every(item => item.productId && item.garmentTypeId && item.quantity > 0)
        )
    }

    const handleAddProduct = () => {
        props.setNewInvoice({
            ...props.newInvoice,
            items: [
                ...props.newInvoice.items,
                { productId: '', garmentTypeId: '', quantity: 1, price: 0, attachments: [], idAdministrador: `${user?.uid}` },
            ],
        })
    }

    const handleRemoveProduct = (index: number) => {
        const newItems = [...props.newInvoice.items]
        newItems.splice(index, 1)
        props.setNewInvoice({
            ...props.newInvoice,
            items: newItems,
            total: newItems.reduce(
                (sum, item) => sum + item.price * item.quantity + item.attachments.reduce((sum, att) => sum + att.price, 0),
                0
            ),
        })
    }

    const handleProductChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...props.newInvoice.items]
        newItems[index] = { ...newItems[index], [field]: value }

        if (field === 'productId' || field === 'garmentTypeId') {
            newItems[index].price = props.calculatePrice(newItems[index].productId, newItems[index].garmentTypeId)
        }

        props.setNewInvoice({
            ...props.newInvoice,
            items: newItems,
            total: newItems.reduce(
                (sum, item) => sum + item.price * item.quantity + item.attachments.reduce((sum, att) => sum + att.price, 0),
                0
            ),
        })
    }

    const handleOpenChange = (index: number, isOpen: boolean) => {
        setOpenStates(prev => ({
            ...prev,
            [index]: isOpen
        }));
    };

    return (
        <>
            <Dialog open={props.isCreateInvoiceDialogOpen} onOpenChange={props.setIsCreateInvoiceDialogOpen}>
                <DialogContent className="max-w-7xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Crear Nueva Factura</DialogTitle>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            if (isInvoiceValid()) {
                                setIsPaymentDialogOpen(true)
                            } else {
                                toast.error("Por favor, complete todos los campos requeridos")
                            }
                        }}
                        className="space-y-6"
                    >
                        <div className="grid gap-6">
                            {/* Cliente Filter */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="clientFilter" className="sm:text-right">
                                    Buscar Cliente
                                </Label>
                                <div className="relative col-span-2">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <Input
                                        id="clientFilter"
                                        value={props.clientFilter}
                                        onChange={(e) => props.setClientFilter(e.target.value)}
                                        className="pl-10"
                                        placeholder="Buscar por cédula o teléfono"
                                    />
                                </div>
                                <Select
                                    value={props.clientFilterType}
                                    onValueChange={(value: 'cedula' | 'phone') => props.setClientFilterType(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cedula">Cédula</SelectItem>
                                        <SelectItem value="phone">Teléfono</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Cliente Select */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="client" className="sm:text-right">
                                    Cliente
                                </Label>
                                <Select
                                    value={props.newInvoice.clientId}
                                    onValueChange={(value) =>
                                        props.setNewInvoice({
                                            ...props.newInvoice,
                                            clientId: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="col-span-2">
                                        <SelectValue placeholder="Seleccione un cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {props.filterClients().map((client) => (
                                            <SelectItem key={client.id} value={client.id || ""}>
                                                {client.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" type="button" onClick={() => setIsNewClientDialogOpen(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                </Button>
                            </div>

                            {/* Agregar Producto Button */}
                            <div className="flex justify-end">
                                <Button type="button" onClick={handleAddProduct}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Agregar Producto
                                </Button>
                            </div>

                            {/* Invoice Items Table */}
                            <div className="col-span-4 overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Producto</TableHead>
                                            <TableHead>Tipo de Prenda</TableHead>
                                            <TableHead>Cantidad</TableHead>
                                            <TableHead>Precio</TableHead>
                                            <TableHead>Attachments</TableHead>
                                            <TableHead>Subtotal</TableHead>
                                            <TableHead>Acción</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {props.newInvoice.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Select
                                                        value={item.productId}
                                                        onValueChange={(value) => handleProductChange(index, 'productId', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione un producto" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {props.products.map((product) => (
                                                                <SelectItem key={product.id} value={product.id || ""}>
                                                                    {product.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Popover open={openStates[index]} onOpenChange={(isOpen) => handleOpenChange(index, isOpen)}>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className="w-full justify-start">
                                                                {item.garmentTypeId ? props.garmentTypes.find(type => type.id === item.garmentTypeId)?.name : "Seleccione tipo"}
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[200px] p-0">
                                                            <Command>
                                                                <CommandInput placeholder="Buscar tipo de prenda..." />
                                                                <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {props.garmentTypes
                                                                        .sort((a, b) => a.name.localeCompare(b.name))
                                                                        .map((type) => (
                                                                            <CommandItem
                                                                                key={type.id}
                                                                                onSelect={() => {
                                                                                    const garmentTypeId = type.id || ""
                                                                                    handleProductChange(index, 'garmentTypeId', garmentTypeId)
                                                                                    handleOpenChange(index, false)
                                                                                }}
                                                                                className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                                                                            >
                                                                                {type.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                </CommandGroup>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleProductChange(index, 'quantity', parseInt(e.target.value))}
                                                        min={1}
                                                    />
                                                </TableCell>
                                                <TableCell>${item.price}</TableCell>
                                                <TableCell>
                                                    {item.attachments.map((attachment, attIndex) => (
                                                        <div key={attachment.id} className="flex items-center space-x-2 mb-2">
                                                            <Input
                                                                placeholder="Nombre"
                                                                value={attachment.name}
                                                                onChange={(e) => handleAttachmentChange(index, attIndex, 'name', e.target.value)}
                                                                className="w-1/2"
                                                            />
                                                            <Input
                                                                type="number"
                                                                placeholder="Precio"
                                                                value={attachment.price}
                                                                onChange={(e) => handleAttachmentChange(index, attIndex, 'price', parseFloat(e.target.value))}
                                                                className="w-1/4"
                                                            />
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleRemoveAttachment(index, attIndex)}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAddAttachment(index)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Agregar Attachment
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
                                                    ${item.price * item.quantity + item.attachments.reduce((sum, att) => sum + att.price, 0)}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleRemoveProduct(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pickup Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-8 items-center gap-4">
                                <Label className="sm:text-right sm:col-span-2 font-bold">
                                    Entrega:
                                </Label>
                                <div className="font-bold sm:col-span-6">
                                    <div className="flex items-center p-2 border rounded-lg bg-gray-100">
                                        <Calendar className="mr-2 text-gray-500" size={18} />
                                        <span>{props.calculatePickupDate(props.newInvoice.items)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label htmlFor="color" className="sm:text-right">
                                    Color
                                </Label>
                                <div className="relative col-span-3">
                                    <Palette className="absolute left-3 top-1/2 transform -translate-y-1/2  text-gray-400" size={18} />
                                    <Input
                                        id="color"
                                        type="color"
                                        value={props.newInvoice.color}
                                        onChange={(e) =>
                                            props.setNewInvoice({ ...props.newInvoice, color: e.target.value })
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Total */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                                <Label className="sm:text-right sm:col-span-3 font-bold">Total:</Label>
                                <div className="font-bold text-2xl">${props.newInvoice.total.toFixed(2)}</div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="submit" disabled={!isInvoiceValid()}>
                                Proceder al Pago
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <AnimatePresence>
                {isPaymentDialogOpen && (
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-center">Método de Pago</DialogTitle>
                            </DialogHeader>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <form onSubmit={(e) => {
                                    e.preventDefault()
                                    handlePaymentSubmit()
                                }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <Label htmlFor="paymentType" className="text-lg font-semibold">
                                            Seleccione el tipo de pago
                                        </Label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setPaymentType('cash')}
                                                type="button"
                                                className={`p-4 rounded-lg flex flex-col items-center justify-center transition-colors ${paymentType === 'cash'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-secondary-foreground'
                                                    }`}
                                            >
                                                <Banknote className="h-8 w-8 mb-2" />
                                                <span>Efectivo</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setPaymentType('card')}
                                                type="button"
                                                className={`p-4 rounded-lg flex flex-col items-center justify-center transition-colors ${paymentType === 'card'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-secondary-foreground'
                                                    }`}
                                            >
                                                <CreditCard className="h-8 w-8 mb-2" />
                                                <span>Tarjeta</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setPaymentType('pending')}
                                                type="button"
                                                className={`p-4 rounded-lg flex flex-col items-center justify-center transition-colors ${paymentType === 'pending'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-secondary text-secondary-foreground'
                                                    }`}
                                            >
                                                <Calendar className="h-8 w-8 mb-2" />
                                                <span>Pagar al recoger</span>
                                            </motion.button>
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {paymentType === 'cash' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="space-y-4"
                                            >
                                                <Label htmlFor="amountPaid" className="text-lg font-semibold">
                                                    Monto Pagado
                                                </Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-bold">
                                                        $
                                                    </span>
                                                    <Input
                                                        id="amountPaid"
                                                        type="number"
                                                        value={amountPaid}
                                                        onChange={(e) => setAmountPaid(parseFloat(e.target.value))}
                                                        min={0}
                                                        step={0.01}
                                                        className="text-2xl font-bold pl-8 pr-4 py-6 w-full border-4 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                                {amountPaid >= props.newInvoice.total && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="bg-green-100 border-4 border-green-400 text-green-700 px-4 py-3 rounded-lg relative"
                                                        role="alert"
                                                    >
                                                        <strong className="font-bold text-lg">Cambio: </strong>
                                                        <span className="block sm:inline text-2xl font-bold">
                                                            ${(amountPaid - props.newInvoice.total).toFixed(2)}
                                                        </span>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <DialogFooter>
                                            <Button type="submit" className="w-full text-lg">
                                                Confirmar Pago
                                            </Button>
                                        </DialogFooter>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>

            <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Crear Nuevo Cliente</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                        e.preventDefault()
                        handleCreateNewClient()
                    }}
                        className="space-y-4"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="name"
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                    className="pl-10"
                                    placeholder="Nombre completo"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="email"
                                    type="email"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    className="pl-10"
                                    placeholder="correo@ejemplo.com"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="phone"
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    className="pl-10"
                                    placeholder="123-456-7890"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cedula">Cédula</Label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="cedula"
                                    value={newClient.cedula}
                                    onChange={(e) => setNewClient({ ...newClient, cedula: e.target.value })}
                                    className="pl-10"
                                    placeholder="1234567890"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="direccion">Dirección</Label>
                            <Textarea
                                id="direccion"
                                value={newClient.direccion}
                                onChange={(e) => setNewClient({ ...newClient, direccion: e.target.value })}
                                placeholder="Ingrese la dirección del cliente"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">Crear Cliente</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default CrearInvoiceModule

