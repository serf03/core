import { AnimatePresence, motion } from 'framer-motion';
import { Grid, List, Plus, Printer, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Invoice, TabsFacturacionProps } from "../../lib/types";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TabsContent } from '../ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name: string) {
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
}

function TabsFacturacion(props: TabsFacturacionProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const renderInvoiceItem = (invoice: Invoice) => {
        const client = props.clients.find(c => c.id === invoice.clientId);
        return (
            <Card key={invoice.id} className="mb-4">
                <CardHeader>
                    <CardTitle>Factura {invoice.invoiceNumber}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                        <div className='col-span-2 w-full'>Cliente: <strong>{client?.name}</strong></div>
                        <div>Total: ${invoice.total}</div>
                        <div>Pendiente: ${invoice.pendingBalance}</div>
                        <div>Estado:
                            <Badge
                                variant={
                                    invoice.status === 'En Proceso' ? 'default' :
                                        invoice.status === 'Completada' || invoice.status === 'Entregada' ? 'success' :
                                            invoice.status === 'Parcialmente Pagada' ? 'secondary' :
                                                'destructive'
                                }
                            >
                                {invoice.status}
                            </Badge>
                        </div>
                        <div className='col-span-2 w-full'>Facturado: {invoice.date}</div>
                        <div className='col-span-2 w-full'>Retiro: {invoice.pickupDate}</div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                            onClick={() => {
                                props.setInvoiceToChangeStatus(invoice);
                                props.setIsChangeInvoiceStatusDialogOpen(true);
                            }}
                            disabled={invoice.status === 'Entregada' || invoice.status === 'Cancelada'}
                            size="sm"
                        >
                            Cambiar Estado
                        </Button>
                        <Button onClick={() => props.handlePrintInvoice(invoice)} size="sm">
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                        </Button>
                        <Button
                            onClick={() => props.handleMakePayment(invoice)}
                            disabled={invoice.status === 'Cancelada' || invoice.pendingBalance === 0}
                            size="sm"
                        >
                            Abonar
                        </Button>
                        {invoice.status !== 'Cancelada' && (
                            <Button
                                variant="destructive"
                                onClick={() => props.handleCancelInvoice(invoice)}
                                size="sm"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <TabsContent value="billing" className="space-y-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Facturación</h2>
                    <Button onClick={() => props.setIsCreateInvoiceDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Crear Factura
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Facturas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center mb-4">
                            <Input
                                placeholder="Buscar factura..."
                                value={props.searchTerm}
                                onChange={e => props.setSearchTerm(e.target.value)}
                                className="max-w-sm"
                            />
                            <ToggleGroup type="single" value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
                                <ToggleGroupItem value="grid" aria-label="Grid view">
                                    <Grid className="h-4 w-4" />
                                </ToggleGroupItem>
                                <ToggleGroupItem value="list" aria-label="List view">
                                    <List className="h-4 w-4" />
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        <AnimatePresence mode="wait">
                            {viewMode === 'grid' ? (
                                <motion.div
                                    key="grid"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                >
                                    {props.invoices
                                        .filter(
                                            invoice =>
                                                invoice.id.toString().includes(props.searchTerm) ||
                                                props.clients.find(c => c.id === invoice.clientId)?.name
                                                    .toLowerCase()
                                                    .includes(props.searchTerm.toLowerCase())
                                        )
                                        .sort((a, b) => {
                                            // First, sort by status priority
                                            const statusPriority = {
                                                'En Proceso': 0,
                                                'Pendiente': 1,
                                                'Parcialmente Pagada': 2,
                                                'Completada': 3,
                                                'Entregada': 4,
                                                'Cancelada': 5
                                            };

                                            const statusDiff = (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
                                            if (statusDiff !== 0) return statusDiff;

                                            // If status is the same, sort by date (newest first)
                                            return new Date(b.date).getTime() - new Date(a.date).getTime();
                                        })
                                        .map(renderInvoiceItem)}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Total</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Fecha de Retiro</TableHead>
                                                <TableHead>Color</TableHead>
                                                <TableHead>Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {props.invoices
                                                .filter(
                                                    invoice =>
                                                        invoice.id.toString().includes(props.searchTerm) ||
                                                        props.clients.find(c => c.id === invoice.clientId)?.name
                                                            .toLowerCase()
                                                            .includes(props.searchTerm.toLowerCase())
                                                )
                                                .sort((a, b) => {
                                                    // First, sort by status priority
                                                    const statusPriority = {
                                                        'En Proceso': 0,
                                                        'Pendiente': 1,
                                                        'Parcialmente Pagada': 2,
                                                        'Completada': 3,
                                                        'Entregada': 4,
                                                        'Cancelada': 5
                                                    };

                                                    const statusDiff = (statusPriority[a.status] || 0) - (statusPriority[b.status] || 0);
                                                    if (statusDiff !== 0) return statusDiff;

                                                    // If status is the same, sort by date (newest first)
                                                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                                                })
                                                .map(invoice => (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell>{invoice.invoiceNumber}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center space-x-2">
                                                                <Avatar className={`h-10 w-10 ${getAvatarColor(props.clients.find(c => c.id === invoice.clientId)?.name || "")}`}>
                                                                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${props.clients.find(c => c.id === invoice.clientId)?.name || ""}`} />
                                                                    <AvatarFallback>{getInitials(props.clients.find(c => c.id === invoice.clientId)?.name || "")}</AvatarFallback>
                                                                </Avatar>
                                                                <span>{props.clients.find(c => c.id === invoice.clientId)?.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>${invoice.total}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    invoice.status === 'En Proceso' ? 'default' :
                                                                        invoice.status === 'Completada' || invoice.status === 'Entregada' ? 'success' :
                                                                            invoice.status === 'Parcialmente Pagada' ? 'secondary' :
                                                                                'destructive'
                                                                }
                                                            >
                                                                {invoice.status}
                                                            </Badge>
                                                            {invoice.pendingBalance > 0 && (
                                                                <span className="ml-2 text-sm text-gray-500">
                                                                    Pendiente: ${invoice.pendingBalance.toFixed(2)}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{invoice.date}</TableCell>
                                                        <TableCell>{invoice.pickupDate}</TableCell>
                                                        <TableCell>
                                                            <div
                                                                className="w-6 h-6 rounded-full"
                                                                style={{ backgroundColor: invoice.color }}
                                                            ></div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    onClick={() => {
                                                                        props.setInvoiceToChangeStatus(invoice);
                                                                        props.setIsChangeInvoiceStatusDialogOpen(true);
                                                                    }}
                                                                    disabled={invoice.status === 'Entregada' || invoice.status === 'Cancelada'}
                                                                >
                                                                    Cambiar Estado
                                                                </Button>
                                                                <Button onClick={() => props.handlePrintInvoice(invoice)}>
                                                                    <Printer className="h-4 w-4 mr-2" />
                                                                    Imprimir
                                                                </Button>
                                                                <Button
                                                                    onClick={() => props.handleMakePayment(invoice)}
                                                                    disabled={invoice.status === 'Cancelada' || invoice.pendingBalance === 0}
                                                                >
                                                                    Abonar
                                                                </Button>
                                                                {invoice.status !== 'Cancelada' && (
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={() => props.handleCancelInvoice(invoice)}
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-2" />
                                                                        Cancelar
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </TabsContent>
    );
}

export default TabsFacturacion;

