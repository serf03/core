// Importar los componentes de UI
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function EditProductDialog(props) {
    return (
        <Dialog open={props.isEditProductDialogOpen} onOpenChange={props.setIsEditProductDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Producto</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        props.handleUpdateProduct();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editProductName" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="editProductName"
                                value={props.editingProduct?.name || ''}
                                onChange={e =>
                                    props.setEditingProduct(prev =>
                                        prev ? { ...prev, name: e.target.value } : null
                                    )
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editPrice" className="text-right">
                                Precio
                            </Label>
                            <Input
                                id="editPrice"
                                type="number"
                                value={props.editingProduct?.price || 0}
                                onChange={e =>
                                    props.setEditingProduct(prev =>
                                        prev ? { ...prev, price: parseFloat(e.target.value) } : null
                                    )
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editStock" className="text-right">
                                Stock
                            </Label>
                            <Input
                                id="editStock"
                                type="number"
                                value={props.editingProduct?.stock || 0}
                                onChange={e =>
                                    props.setEditingProduct(prev =>
                                        prev ? { ...prev, stock: parseInt(e.target.value, 10) } : null
                                    )
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editProductionTime" className="text-right">
                                Tiempo de Producción (min)
                            </Label>
                            <Input
                                id="editProductionTime"
                                type="number"
                                value={props.editingProduct?.productionTime || 0}
                                onChange={e =>
                                    props.setEditingProduct(prev =>
                                        prev ? { ...prev, productionTime: parseInt(e.target.value, 10) } : null
                                    )
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="editStatus" className="text-right">
                                Estado
                            </Label>
                            <Select
                                value={props.editingProduct?.status}
                                onValueChange={value =>
                                    props.setEditingProduct(prev =>
                                        prev ? { ...prev, status: value } : null
                                    )
                                }
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Seleccione el estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Disponible">Disponible</SelectItem>
                                    <SelectItem value="En Uso">En Uso</SelectItem>
                                    <SelectItem value="En Mantenimiento">En Mantenimiento</SelectItem>
                                    <SelectItem value="Agotado">Agotado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Actualizar Producto</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditProductDialog;
