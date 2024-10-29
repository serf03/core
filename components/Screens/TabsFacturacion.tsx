import { AnimatePresence, motion } from 'framer-motion';
import { Grid, List, Plus, Printer, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Invoice, TabsFacturacionProps } from "../../lib/types";
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TabsContent } from '../ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

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
                        <div>Cliente: {client?.name}</div>
                        <div>Total: ${invoice.total}</div>
                        <div>Estado:
                            <Badge
                                variant={
                                    invoice.status === 'En Proceso' ? 'default' :
                                        invoice.status === 'Completada' || invoice.status === 'Entregada' ? 'success' :
                                            'destructive'
                                }
                            >
                                {invoice.status}
                            </Badge>
                        </div>
                        <div>Fecha: {invoice.date}</div>
                        <div>Fecha de Retiro: {invoice.pickupDate}</div>
                        <div>
                            Color:
                            <div className="w-6 h-6 rounded-full inline-block ml-2" style={{ backgroundColor: invoice.color }}></div>
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                        <Button
                            onClick={() => {
                                props.setInvoiceToChangeStatus(invoice);
                                props.setIsChangeInvoiceStatusDialogOpen(true);
                            }}
                            disabled={invoice.status === 'Entregada'}
                        >
                            Cambiar Estado
                        </Button>
                        <Button onClick={() => props.handlePrintInvoice(invoice)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
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
                                                .map(invoice => (
                                                    <TableRow key={invoice.id}>
                                                        <TableCell>{invoice.invoiceNumber}</TableCell>
                                                        <TableCell>
                                                            {props.clients.find(c => c.id === invoice.clientId)?.name}
                                                        </TableCell>
                                                        <TableCell>${invoice.total}</TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    invoice.status === 'En Proceso' ? 'default' :
                                                                        invoice.status === 'Completada' || invoice.status === 'Entregada' ? 'success' :
                                                                            'destructive'
                                                                }
                                                            >
                                                                {invoice.status}
                                                            </Badge>

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
                                                                    disabled={invoice.status === 'Entregada'}
                                                                >
                                                                    Cambiar Estado
                                                                </Button>
                                                                <Button onClick={() => props.handlePrintInvoice(invoice)}>
                                                                    <Printer className="h-4 w-4 mr-2" />
                                                                    Imprimir
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