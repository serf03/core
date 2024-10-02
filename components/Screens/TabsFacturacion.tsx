import { Plus, Printer, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TabsContent } from '../ui/tabs';

function TabsFacturacion(props) {
    return (
        <TabsContent value="billing" className="space-y-4">
            <div className="flex justify-between items-center">
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
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar factura..."
                            value={props.searchTerm}
                            onChange={e => props.setSearchTerm(e.target.value)}
                        />
                    </div>
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
                                        <TableCell>{invoice.id}</TableCell>
                                        <TableCell>
                                            {props.clients.find(c => c.id === invoice.clientId)?.name}
                                        </TableCell>
                                        <TableCell>${invoice.total}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    invoice.status === 'En Proceso'
                                                        ? 'default'
                                                        : invoice.status === 'Completada'
                                                            ? 'success'
                                                            : 'destructive'
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
                </CardContent>
            </Card>
        </TabsContent>
    );
}

export default TabsFacturacion;
