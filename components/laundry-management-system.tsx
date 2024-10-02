'use client'

import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

import { addDays, addMinutes, format, setHours, setMinutes } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart,
  Bell,
  Edit,
  FileText,
  LayoutDashboard,
  Package,
  Plus,
  Printer,
  Search,
  Settings,
  Shirt,
  Trash,
  Users
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast, Toaster } from 'react-hot-toast'
import * as firebaseServices from "../lib/firebaseServices"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent } from "./ui/tabs"
//Tabs content
import TabsClients from "./Screens/TabsClients"
import TabsDashboard from "./Screens/TabsDashboard"
import TabsFacturacion from "./Screens/TabsFacturacion"
import TabsProduction from "./Screens/TabsProduction"
import TabsProducts from "./Screens/TabsProducts"
import TabsReport from "./Screens/TabsReport"
import TabsUsuario from "./Screens/TabsUsuario"

//Module content
import AddClientsDialog from "./Module/AddClientsDialog"
import CrearFacturaModule from "./Module/CrearInvoiceModule"
import EditClientsDialog from "./Module/EditClientsDialog"
import EditProductDialog from "./Module/EditProductDialog"
import NewProduct from "./Module/NewProductDialog"
import StateFacturaDialog from "./Module/StateInvoiceDialog"
//Module Alert 
import CancelAlert from "./Module/CancelAlert"
import DeleteAlertDialog from "./Module/DeleteAlert"

import { Client, GarmentType, Invoice, Printer as Printers, Product, ProductionRecord, User } from "../lib/types"


export function LaundryManagementSystemComponent() {
  // Estados
  const [activeTab, setActiveTab] = useState("dashboard")
  const [users, setUsers] = useState<User[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([])
  const [printers, setPrinters] = useState<Printers[]>([])
  const [dailyProduction, setDailyProduction] = useState(0)
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false)
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false)
  const [isCreateInvoiceDialogOpen, setIsCreateInvoiceDialogOpen] = useState(false)
  const [newClient, setNewClient] = useState<Omit<Client, 'id'>>({ name: '', email: '', phone: '', cedula: '' })
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ name: '', price: 0, stock: 0, productionTime: 0, status: 'Disponible' })
  const [newInvoice, setNewInvoice] = useState<Omit<Invoice, 'id' | 'date'>>({
    clientId: '',
    items: [],
    total: 0,
    status: 'Pendiente',
    pickupDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    color: '#FFD700'
  })
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false)
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [clientFilter, setClientFilter] = useState('')
  const [clientFilterType, setClientFilterType] = useState<'cedula' | 'phone'>('cedula')
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ type: 'client' | 'product', id: string } | null>(null)
  const [isEditClientDialogOpen, setIsEditClientDialogOpen] = useState(false)
  const [isEditProductDialogOpen, setIsEditProductDialogOpen] = useState(false)
  const [isChangeInvoiceStatusDialogOpen, setIsChangeInvoiceStatusDialogOpen] = useState(false)
  const [invoiceToChangeStatus, setInvoiceToChangeStatus] = useState<Invoice | null>(null)

  const [isAddGarmentTypeDialogOpen, setIsAddGarmentTypeDialogOpen] = useState(false)
  const [isEditGarmentTypeDialogOpen, setIsEditGarmentTypeDialogOpen] = useState(false)
  const [newGarmentType, setNewGarmentType] = useState<Omit<GarmentType, 'id'>>({ name: '', basePrice: 0, description: '', category: '' })
  const [editingGarmentType, setEditingGarmentType] = useState<GarmentType | null>(null)


  // Efecto para cargar datos iniciales y suscribirse a cambios
  useEffect(() => {
    const unsubscribeUsers = firebaseServices.subscribeToUsers(setUsers);
    const unsubscribeClients = firebaseServices.subscribeToClients(setClients);
    const unsubscribeProducts = firebaseServices.subscribeToProducts(setProducts);
    const unsubscribeGarmentTypes = firebaseServices.subscribeToGarmentTypes(setGarmentTypes);
    const unsubscribeInvoices = firebaseServices.subscribeToInvoices(setInvoices);
    const unsubscribeProductionRecords = firebaseServices.subscribeToProductionRecords(setProductionRecords);
    const unsubscribePrinters = firebaseServices.subscribeToPrinters(setPrinters);

    // Calcular la producción diaria
    const calculateDailyProduction = () => {
      const today = new Date().toISOString().split('T')[0];
      const dailyProduction = productionRecords
        .filter(record => record.date === today)
        .reduce((sum, record) => sum + record.amount, 0);
      setDailyProduction(dailyProduction);
    };

    calculateDailyProduction();

    // Limpiar suscripciones
    return () => {
      unsubscribeUsers();
      unsubscribeClients();
      unsubscribeProducts();
      unsubscribeGarmentTypes();
      unsubscribeInvoices();
      unsubscribeProductionRecords();
      unsubscribePrinters();
    };
  });
  // Funciones de manejo de tipos de prendas
  const handleAddGarmentType = async () => {
    try {
      await firebaseServices.addGarmentType(newGarmentType);
      setNewGarmentType({ name: '', basePrice: 0, description: '', category: '' });
      setIsAddGarmentTypeDialogOpen(false);
      toast.success('Tipo de prenda agregado exitosamente');
    } catch (error) {
      console.error("Error adding garment type: ", error);
      toast.error("Error al agregar el tipo de prenda");
    }
  };

  const handleUpdateGarmentType = async () => {
    if (editingGarmentType) {
      try {
        await firebaseServices.updateGarmentType(editingGarmentType);
        setEditingGarmentType(null);
        setIsEditGarmentTypeDialogOpen(false);
        toast.success('Tipo de prenda actualizado exitosamente');
      } catch (error) {
        console.error("Error updating garment type: ", error);
        toast.error("Error al actualizar el tipo de prenda");
      }
    }
  };

  const handleDeleteGarmentType = async (id: string) => {
    try {
      await firebaseServices.deleteGarmentType(id);
      toast.success('Tipo de prenda eliminado exitosamente');
    } catch (error) {
      console.error("Error deleting garment type: ", error);
      toast.error("Error al eliminar el tipo de prenda");
    }
  };
  // Funciones de manejo de clientes
  const handleAddClient = async () => {
    try {
      await firebaseServices.addClient(newClient);
      setNewClient({ name: '', email: '', phone: '', cedula: '' });
      setIsAddClientDialogOpen(false);
      toast.success('Cliente agregado exitosamente');
    } catch (error) {
      console.error("Error adding client: ", error);
      toast.error("Error al agregar el cliente");
    }
  };

  const handleUpdateClient = async () => {
    if (editingClient) {
      try {
        await firebaseServices.updateClient(editingClient);
        setEditingClient(null);
        setIsEditClientDialogOpen(false);
        toast.success('Cliente actualizado exitosamente');
      } catch (error) {
        console.error("Error updating client: ", error);
        toast.error("Error al actualizar el cliente");
      }
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await firebaseServices.deleteClient(id);
      toast.success('Cliente eliminado exitosamente');
    } catch (error) {
      console.error("Error deleting client: ", error);
      toast.error("Error al eliminar el cliente");
    }
  };

  // Funciones de manejo de productos
  const handleAddProduct = async () => {
    try {
      await firebaseServices.addProduct(newProduct);
      setNewProduct({ name: '', price: 0, stock: 0, productionTime: 0, status: 'Disponible' });
      setIsAddProductDialogOpen(false);
      toast.success('Producto agregado exitosamente');
    } catch (error) {
      console.error("Error adding product: ", error);
      toast.error("Error al agregar el producto");
    }
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      try {
        await firebaseServices.updateProduct(editingProduct);
        setEditingProduct(null);
        setIsEditProductDialogOpen(false);
        toast.success('Producto actualizado exitosamente');
      } catch (error) {
        console.error("Error updating product: ", error);
        toast.error("Error al actualizar el producto");
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await firebaseServices.deleteProduct(id);
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast.error("Error al eliminar el producto");
    }
  };

  // Función para calcular la fecha de entrega
  const calculatePickupDate = (items: Invoice['items']): string => {
    const now = new Date()
    let totalProductionTime = 0

    // Calcular el tiempo total de producción para los nuevos items
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId)
      if (product) {
        totalProductionTime += product.productionTime * item.quantity
      }
    })

    // Obtener las facturas activas (En Proceso)
    const activeInvoices = invoices.filter(inv => inv.status === 'En Proceso')

    // Calcular el tiempo de producción restante de las facturas activas
    let remainingProductionTime = 0
    activeInvoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          remainingProductionTime += product.productionTime * item.quantity
        }
      })
    })

    // Sumar el tiempo de producción de las facturas activas y los nuevos items
    const totalTime = remainingProductionTime + totalProductionTime

    // Calcular la fecha de entrega
    let pickupDate = now
    let remainingMinutes = totalTime

    while (remainingMinutes > 0) {
      pickupDate = addMinutes(pickupDate, 1)

      // Verificar si estamos dentro del horario laboral (8:00 AM - 5:00 PM)
      if (pickupDate.getHours() >= 8 && pickupDate.getHours() < 17) {
        remainingMinutes--
      }

      // Si llegamos al final del día, saltar al siguiente día laboral
      if (pickupDate.getHours() >= 17) {
        pickupDate = setHours(setMinutes(addDays(pickupDate, 1), 0), 8)
      }

      // Si es fin de semana, saltar al lunes
      if (pickupDate.getDay() === 0 || pickupDate.getDay() === 6) {
        pickupDate = setHours(setMinutes(addDays(pickupDate, pickupDate.getDay() === 0 ? 1 : 2), 0), 8)
      }
    }

    return format(pickupDate, 'yyyy-MM-dd HH:mm')
  }

  // Funciones de manejo de facturas
  const handleCreateInvoice = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const pickupDate = calculatePickupDate(newInvoice.items);

      // Verifica el tipo de `newInvoice` aquí si es necesario

      const newInvoiceWithPickupDate: Omit<Invoice, "id"> = {
        ...newInvoice,
        pickupDate,
        date,
        status: 'En Proceso'  // Asegúrate de que esto sea un valor permitido
      };

      await firebaseServices.addInvoice(newInvoiceWithPickupDate);

      setNewInvoice({
        clientId: '',
        items: [],
        total: 0,
        status: 'Pendiente',  // Asegúrate de que esto también sea un valor permitido
        pickupDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        color: '#FFD700'
      });

      setIsCreateInvoiceDialogOpen(false);
      toast.success('Factura creada exitosamente');
    } catch (error) {
      console.error("Error creating invoice: ", error);
      toast.error("Error al crear la factura");
    }
  };


  const handleRegisterProduction = async (amount: number, type: 'Lavado' | 'Planchado' | 'Empaquetado') => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const newRecord = { date, amount, type };
      await firebaseServices.addProductionRecord(newRecord);
      toast.success(`Producción registrada: ${amount} kg de ${type}`);
    } catch (error) {
      console.error("Error registering production: ", error);
      toast.error("Error al registrar la producción");
    }
  };

  const handleChangeInvoiceStatus = async (invoice: Invoice, newStatus: Invoice['status']) => {
    try {
      const updatedInvoice = { ...invoice, status: newStatus };
      await firebaseServices.updateInvoice(updatedInvoice);
      setIsChangeInvoiceStatusDialogOpen(false);
      setInvoiceToChangeStatus(null);
      toast.success(`Estado de la factura actualizado a: ${newStatus}`);
    } catch (error) {
      console.error("Error changing invoice status: ", error);
      toast.error("Error al cambiar el estado de la factura");
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoicePreviewOpen(true);
  };

  const handleCancelInvoice = (invoice: Invoice) => {
    setInvoiceToCancel(invoice);
    setIsCancelDialogOpen(true);
  };
  const confirmCancelInvoice = async () => {
    if (invoiceToCancel) {
      try {
        // Asegúrate de que el tipo de `cancelledInvoice` sea `Invoice`
        const cancelledInvoice: Invoice = {
          ...invoiceToCancel,
          status: 'Cancelada' as 'Pendiente' | 'En Proceso' | 'Lavando' | 'Planchando' | 'Completada' | 'Entregada' | 'Cancelada', // Asegura que TypeScript entienda que es un tipo literal válido
        };
        await firebaseServices.updateInvoice(cancelledInvoice);
        setIsCancelDialogOpen(false);
        setInvoiceToCancel(null);
        toast.success('Factura cancelada exitosamente');
      } catch (error) {
        console.error("Error cancelling invoice: ", error);
        toast.error("Error al cancelar la factura");
      }
    }
  };


  // Funciones de filtrado
  const filterClients = () => {
    return clients.filter(client =>
      clientFilterType === 'cedula'
        ? client.cedula.includes(clientFilter)
        : client.phone.includes(clientFilter)
    );
  };

  const calculatePrice = (productId: string, garmentTypeId: string) => {
    const product = products.find(p => p.id === productId);
    const garmentType = garmentTypes.find(g => g.id === garmentTypeId);
    if (product && garmentType) {
      return product.price + garmentType.basePrice;
    }
    return 0;
  };

  // Componente de vista previa de factura
  const InvoicePreview = ({ invoice }: { invoice: Invoice }) => {
    const client = clients.find(c => c.id === invoice.clientId);
    return (
      <div className="bg-white p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Factura #{invoice.id}</h2>
        <div className="mb-4">
          <p><strong>Cliente:</strong> {client?.name}</p>
          <p><strong>Fecha:</strong> {invoice.date}</p>
          <p><strong>Estado:</strong> {invoice.status}</p>
          <p><strong>Fecha de retiro:</strong> {invoice.pickupDate}</p>
          <div className="flex items-center">
            <strong className="mr-2">Color:</strong>
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: invoice.color }}></div>
          </div>
        </div>
        <table className="w-full mb-4">
          <thead>
            <tr>
              <th className="text-left">Producto</th>
              <th className="text-left">Tipo de Prenda</th>
              <th className="text-right">Cantidad</th>
              <th className="text-right">Precio</th>
              <th className="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              const garmentType = garmentTypes.find(g => g.id === item.garmentTypeId);
              return (
                <tr key={index}>
                  <td>{product?.name}</td>
                  <td>{garmentType?.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">${item.price}</td>
                  <td className="text-right">${item.price * item.quantity}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="text-right">
          <p><strong>Total:</strong> ${invoice.total}</p>
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full md:w-64 bg-white shadow-md"
      >
        <div className="p-4">
          <h1 className="text-2xl font-bold text-blue-600">LaundryPro</h1>
        </div>
        <nav className="mt-6">
          {[
            { name: "Dashboard", icon: <LayoutDashboard size={20} />, id: "dashboard" },
            { name: "Facturación", icon: <FileText size={20} />, id: "billing" },
            { name: "Producción", icon: <Package size={20} />, id: "production" },
            { name: "Usuarios", icon: <Users size={20} />, id: "users" },
            { name: "Clientes", icon: <Users size={20} />, id: "clients" },
            { name: "Productos", icon: <Package size={20} />, id: "products" },
            { name: "Tipos de Prendas", icon: <Shirt size={20} />, id: "garmentTypes" },
            { name: "Reportes", icon: <BarChart size={20} />, id: "reports" },
          ].map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </Button>
          ))}
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-sm p-4 flex justify-between items-center"
        >
          <div className="flex items-center">
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-64 mr-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </motion.header>

        {/* Dashboard content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                {/* Diálogo para agregar tipo de prenda */}
                <TabsContent value="garmentTypes" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Tipos de Prendas</h2>
                    <Button onClick={() => setIsAddGarmentTypeDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Agregar Tipo de Prenda
                    </Button>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Lista de Tipos de Prendas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Input
                          placeholder="Buscar tipo de prenda..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Precio Base</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {garmentTypes
                            .filter(garmentType =>
                              garmentType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              garmentType.category.toLowerCase().includes(searchTerm.toLowerCase())
                            )
                            .map((garmentType) => (
                              <TableRow key={garmentType.id}>
                                <TableCell>{garmentType.id}</TableCell>
                                <TableCell>{garmentType.name}</TableCell>
                                <TableCell>${garmentType.basePrice}</TableCell>
                                <TableCell>{garmentType.description}</TableCell>
                                <TableCell>{garmentType.category}</TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button onClick={() => {
                                      setEditingGarmentType(garmentType)
                                      setIsEditGarmentTypeDialogOpen(true)
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Editar
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteGarmentType(garmentType.id)}>
                                      <Trash className="h-4 w-4 mr-2" />
                                      Eliminar
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
                {/* Dashboard Tab */}
                <TabsDashboard products={products} length={products.filter(p => p.stock < 10).length} invoices={invoices} dailyProduction={dailyProduction}></TabsDashboard>

                {/* Facturación Tab */}
                <TabsFacturacion clients={clients} invoices={invoices} setIsCreateInvoiceDialogOpen={setIsCreateInvoiceDialogOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setIsChangeInvoiceStatusDialogOpen={setIsChangeInvoiceStatusDialogOpen} setInvoiceToChangeStatus={setInvoiceToChangeStatus} handlePrintInvoice={handlePrintInvoice} handleCancelInvoice={handleCancelInvoice}></TabsFacturacion>

                {/* Producción Tab */}
                <TabsProduction productionRecords={productionRecords} searchTerm={searchTerm} setSearchTerm={setSearchTerm} handleRegisterProduction={handleRegisterProduction}></TabsProduction>

                {/* Usuarios Tab */}
                <TabsUsuario users={users} searchTerm={searchTerm} setSearchTerm={setSearchTerm}></TabsUsuario>

                {/* Clientes Tab */}
                <TabsClients clients={clients} setIsAddClientDialogOpen={setIsAddClientDialogOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setEditingClient={setEditingClient} setIsEditClientDialogOpen={setIsEditClientDialogOpen} handleDeleteClient={handleDeleteClient}></TabsClients>

                {/* Productos Tab */}
                <TabsProducts products={products} setIsAddProductDialogOpen={setIsAddProductDialogOpen} searchTerm={searchTerm} setSearchTerm={setSearchTerm} setEditingProduct={setEditingProduct} setIsEditProductDialogOpen={setIsEditProductDialogOpen} handleDeleteProduct={handleDeleteProduct}></TabsProducts>

                {/* Reportes Tab */}
                <TabsReport />
              </Tabs>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {/* ... (otros diálogos permanecen sin cambios) */}

      {/* Diálogo para agregar tipo de prenda */}
      <Dialog open={isAddGarmentTypeDialogOpen} onOpenChange={setIsAddGarmentTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Tipo de Prenda</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleAddGarmentType()
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={newGarmentType.name}
                  onChange={(e) => setNewGarmentType({ ...newGarmentType, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="basePrice" className="text-right">
                  Precio Base
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={newGarmentType.basePrice}
                  onChange={(e) => setNewGarmentType({ ...newGarmentType, basePrice: parseFloat(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="description"
                  value={newGarmentType.description}
                  onChange={(e) => setNewGarmentType({ ...newGarmentType, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoría
                </Label>
                <Input
                  id="category"
                  value={newGarmentType.category}
                  onChange={(e) => setNewGarmentType({ ...newGarmentType, category: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Agregar Tipo de Prenda</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para editar tipo de prenda */}
      <Dialog open={isEditGarmentTypeDialogOpen} onOpenChange={setIsEditGarmentTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Prenda</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            handleUpdateGarmentType()
          }}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editName" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="editName"
                  value={editingGarmentType?.name || ''}
                  onChange={(e) => setEditingGarmentType(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editBasePrice" className="text-right">
                  Precio Base
                </Label>
                <Input
                  id="editBasePrice"
                  type="number"
                  value={editingGarmentType?.basePrice || 0}
                  onChange={(e) => setEditingGarmentType(prev => prev ? { ...prev, basePrice: parseFloat(e.target.value) } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editDescription" className="text-right">
                  Descripción
                </Label>
                <Input
                  id="editDescription"
                  value={editingGarmentType?.description || ''}
                  onChange={(e) => setEditingGarmentType(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editCategory" className="text-right">
                  Categoría
                </Label>
                <Input
                  id="editCategory"
                  value={editingGarmentType?.category || ''}
                  onChange={(e) => setEditingGarmentType(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Actualizar Tipo de Prenda</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Dialogs */}
      <AddClientsDialog isAddClientDialogOpen={isAddClientDialogOpen} setIsAddClientDialogOpen={setIsAddClientDialogOpen} newClient={newClient} setNewClient={setNewClient} handleAddClient={handleAddClient}></AddClientsDialog>

      <EditClientsDialog editingClient={editingClient} setEditingClient={setEditingClient} isEditClientDialogOpen={isEditClientDialogOpen} setIsEditClientDialogOpen={setIsEditClientDialogOpen} handleUpdateClient={handleUpdateClient}></EditClientsDialog>

      <NewProduct isAddProductDialogOpen={isAddProductDialogOpen} setIsAddProductDialogOpen={setIsAddProductDialogOpen} newProduct={newProduct} setNewProduct={setNewProduct} handleAddProduct={handleAddProduct}></NewProduct>

      <EditProductDialog editingProduct={editingProduct} setEditingProduct={setEditingProduct} isEditProductDialogOpen={isEditProductDialogOpen} setIsEditProductDialogOpen={setIsEditProductDialogOpen} handleUpdateProduct={handleUpdateProduct}></EditProductDialog>

      <CrearFacturaModule products={products} garmentTypes={garmentTypes} isCreateInvoiceDialogOpen={isCreateInvoiceDialogOpen} setIsCreateInvoiceDialogOpen={setIsCreateInvoiceDialogOpen} newInvoice={newInvoice} setNewInvoice={setNewInvoice} clientFilter={clientFilter} setClientFilter={setClientFilter} clientFilterType={clientFilterType} setClientFilterType={setClientFilterType} calculatePickupDate={calculatePickupDate} handleCreateInvoice={handleCreateInvoice} filterClients={filterClients} calculatePrice={calculatePrice}></CrearFacturaModule>

      <Dialog open={isInvoicePreviewOpen} onOpenChange={setIsInvoicePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Vista Previa de Factura</DialogTitle>
          </DialogHeader>
          {selectedInvoice && <InvoicePreview invoice={selectedInvoice} />}
          <DialogFooter>
            <Select value={selectedPrinter} onValueChange={setSelectedPrinter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Seleccione impresora" />
              </SelectTrigger>
              <SelectContent>
                {printers.map((printer) => (
                  <SelectItem key={printer.name} value={printer.name}>
                    {printer.name} {printer.isDefault && "(Predeterminada)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => {
              // Aquí iría la lógica para imprimir la factura
              toast.success(`Factura enviada a imprimir en ${selectedPrinter}`)
              setIsInvoicePreviewOpen(false)
            }}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Factura
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CancelAlert isCancelDialogOpen={isCancelDialogOpen} setIsCancelDialogOpen={setIsCancelDialogOpen} confirmCancelInvoice={confirmCancelInvoice}></CancelAlert>

      <DeleteAlertDialog clients={clients} setClients={setClients} products={products} setProducts={setProducts} isDeleteDialogOpen={isDeleteDialogOpen} setIsDeleteDialogOpen={setIsDeleteDialogOpen} itemToDelete={itemToDelete} setItemToDelete={setItemToDelete}></DeleteAlertDialog>

      <StateFacturaDialog isChangeInvoiceStatusDialogOpen={isChangeInvoiceStatusDialogOpen} setIsChangeInvoiceStatusDialogOpen={setIsChangeInvoiceStatusDialogOpen} invoiceToChangeStatus={invoiceToChangeStatus} handleChangeInvoiceStatus={handleChangeInvoiceStatus}></StateFacturaDialog>
      <Toaster />
    </div>
  )
}