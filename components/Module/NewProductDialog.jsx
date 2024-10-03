// Importar componentes de UI
import { useEffect, useState } from 'react';
// import * as firebaseServices from "../../lib/firebaseServices";
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

function NewProduct(props) {

const [newProduct, setNewProduct] = useState({
    name: '',
    price: 0,
    stock: 0,
    productionTime: 0,
    status: 'Disponible',
  });

  const handleAddProduct = async () => {
      try {
         console.log(newProduct);
          
          return
      await firebaseServices.addProduct(newProduct);
      setNewProduct({ name: '', price: 0, stock: 0, productionTime: 0, status: 'Disponible' });
      setIsAddProductDialogOpen(false);
      toast.success('Producto agregado exitosamente');
    } catch (error) {
      console.error("Error adding product: ", error);
      toast.error("Error al agregar el producto");
    }
      };
    
    useEffect(() => {
    

        console.log('props.isAddProductDialogOpen', props.isAddProductDialogOpen);

  
    });



    return (
        <Dialog open={props.isAddProductDialogOpen} onOpenChange={props.setIsAddProductDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        handleAddProduct()
                        props.handleAddProduct();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="productName" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="productName"
                                value={props.newProduct.name}
                                onChange={e =>
                                    props.setNewProduct({
                                        ...props.newProduct,
                                        name: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Precio
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={props.newProduct.price}
                                onChange={e =>
                                    props.setNewProduct({
                                        ...props.newProduct,
                                        price: parseFloat(e.target.value),
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                value={props.newProduct.stock}
                                onChange={e =>
                                    props.setNewProduct({
                                        ...props.newProduct,
                                        stock: parseInt(e.target.value, 10),
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="productionTime" className="text-right">
                                Tiempo de Producción (min)
                            </Label>
                            <Input
                                id="productionTime"
                                type="number"
                                value={props.newProduct.productionTime}
                                onChange={e =>
                                    props.setNewProduct({
                                        ...props.newProduct,
                                        productionTime: parseInt(e.target.value, 10),
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">
                                Estado
                            </Label>
                            <Select
                                value={props.newProduct.status}
                                onValueChange={value =>
                                    props.setNewProduct({
                                        ...props.newProduct,
                                        status: value,
                                    })
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
                        <Button type="submit">Agregar Producto</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default NewProduct;
