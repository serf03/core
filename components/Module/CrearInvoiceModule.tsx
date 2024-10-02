import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';


function CrearFacturaModule(props) {
    console.log(props)
    return (
        <Dialog open={props.isCreateInvoiceDialogOpen} onOpenChange={props.setIsCreateInvoiceDialogOpen}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Factura</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        props.handleCreateInvoice();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        {/* Cliente Filter */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="clientFilter" className="text-right">
                                Buscar Cliente
                            </Label>
                            <Input
                                id="clientFilter"
                                value={props.clientFilter}
                                onChange={(e) => props.setClientFilter(e.target.value)}
                                className="col-span-2"
                                placeholder="Buscar por cédula o teléfono"
                            />
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="client" className="text-right">
                                Cliente
                            </Label>
                            <Select
                                value={props.newInvoice.clientId.toString()}
                                onValueChange={(value) =>
                                    props.setNewInvoice({
                                        ...props.newInvoice,
                                        clientId: parseInt(value),
                                    })
                                }
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccione un cliente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.filterClients().map((client) => (
                                        <SelectItem key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Producto Select */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product" className="text-right">
                                Producto
                            </Label>
                            <Select
                                onValueChange={(value) => {
                                    const productId = parseInt(value);
                                    props.setNewInvoice({
                                        ...props.newInvoice,
                                        items: [
                                            ...props.newInvoice.items,
                                            { productId, garmentTypeId: 0, quantity: 1, price: 0 },
                                        ],
                                    });
                                }}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccione un producto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {props.products.map((product) => (
                                        <SelectItem key={product.id} value={product.id.toString()}>
                                            {product.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Invoice Items Table */}
                        <div className="col-span-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Tipo de Prenda</TableHead>
                                        <TableHead>Cantidad</TableHead>
                                        <TableHead>Precio</TableHead>
                                        <TableHead>Subtotal</TableHead>
                                        <TableHead>Acción</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {props.newInvoice.items.map((item, index) => {
                                        const product = props.products.find((p) => p.id === item.productId);
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>{product?.name}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={item.garmentTypeId.toString()}
                                                        onValueChange={(value) => {
                                                            const garmentTypeId = parseInt(value);
                                                            const newItems = [...props.newInvoice.items];
                                                            newItems[index].garmentTypeId = garmentTypeId;
                                                            newItems[index].price = props.calculatePrice(
                                                                item.productId,
                                                                garmentTypeId
                                                            );
                                                            props.setNewInvoice({
                                                                ...props.newInvoice,
                                                                items: newItems,
                                                                total: newItems.reduce(
                                                                    (sum, item) => sum + item.price * item.quantity,
                                                                    0
                                                                ),
                                                            });
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione tipo" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {props.garmentTypes.map((type) => (
                                                                <SelectItem key={type.id} value={type.id.toString()}>
                                                                    {type.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newQuantity = parseInt(e.target.value);
                                                            const newItems = [...props.newInvoice.items];
                                                            newItems[index].quantity = newQuantity;
                                                            props.setNewInvoice({
                                                                ...props.newInvoice,
                                                                items: newItems,
                                                                total: newItems.reduce(
                                                                    (sum, item) => sum + item.price * item.quantity,
                                                                    0
                                                                ),
                                                            });
                                                        }}
                                                        min={1}
                                                    />
                                                </TableCell>
                                                <TableCell>${item.price}</TableCell>
                                                <TableCell>${item.price * item.quantity}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            const newItems = props.newInvoice.items.filter(
                                                                (_, i) => i !== index
                                                            );
                                                            props.setNewInvoice({
                                                                ...props.newInvoice,
                                                                items: newItems,
                                                                total: newItems.reduce(
                                                                    (sum, item) => sum + item.price * item.quantity,
                                                                    0
                                                                ),
                                                            });
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pickup Date */}
                        <div className="grid grid-cols-8 items-center gap-4">
                            <label className="text-sm leading-none text-right font-bold peer-disabled:cursor-not-allowed peer-disabled:opacity-70 col-span-2">
                                Entrega:
                            </label>
                            <div className="font-bold col-span-6">
                                <span className="block p-2 border rounded-lg bg-gray-100">
                                    {props.calculatePickupDate(props.newInvoice.items)}
                                </span>
                            </div>
                        </div>
                        {/* Color Picker */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="color" className="text-right">
                                Color
                            </Label>
                            <Input
                                id="color"
                                type="color"
                                value={props.newInvoice.color}
                                onChange={(e) =>
                                    props.setNewInvoice({ ...props.newInvoice, color: e.target.value })
                                }
                                className="col-span-3"
                            />
                        </div>

                        {/* Total */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right col-span-3 font-bold">Total:</Label>
                            <div className="font-bold">${props.newInvoice.total}</div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit">Crear</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default CrearFacturaModule;
