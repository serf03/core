// Importar componentes de UI
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TabsContent } from '../ui/tabs';

// Importar iconos
import { Edit, Plus, Trash } from 'lucide-react';

function TabsProducts(props) {
    return (
        <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Productos</h2>
                <Button onClick={() => { } //props.setIsAddProductDialogOpen(true)
                }>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Producto
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Productos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar producto..."
                            value={props.searchTerm}
                            onChange={e => props.setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Precio</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Tiempo de Producción (min)</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.products
                                ?.filter(product =>
                                    product.name.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
                                    product.status.toLowerCase().includes(props.searchTerm.toLowerCase())
                                )
                                .map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.id}</TableCell>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>${product.price}</TableCell>
                                        <TableCell>{product.stock}</TableCell>
                                        <TableCell>{product.productionTime}</TableCell>
                                        <TableCell>{product.status}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() => {
                                                        props.setEditingProduct(product);
                                                        props.setIsEditProductDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => props.handleDeleteProduct(product.id)}
                                                >
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
    );
}

export default TabsProducts;
