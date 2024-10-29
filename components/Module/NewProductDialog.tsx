'use client'
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "@/lib/types"; // Asegúrate de que este tipo esté definido correctamente
import { Clock, DollarSign, Package } from "lucide-react";
import { useState } from "react";
import { toast } from 'react-hot-toast';
import { handleAddProduct } from '../../lib/services'; // Asegúrate de que esta función esté correctamente definida
import { useAuth } from "../context/AuthContext";

interface NewProductProps {
  isAddProductDialogOpen: boolean
  setIsAddProductDialogOpen: (open: boolean) => void
}

export default function NewProduct({ isAddProductDialogOpen, setIsAddProductDialogOpen }: NewProductProps) {
  const { user } = useAuth();
  const [newProduct, setNewProduct] = useState<Product>({ name: '', price: 0, productionTime: 0, status: 'Disponible', idAdministrador: `${user?.uid}` });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que todos los campos estén llenos
    if (!newProduct.name || newProduct.price <= 0 || newProduct.productionTime <= 0) {
      toast.error('Por favor, complete todos los campos requeridos y asegúrese de que los valores sean válidos.');
      return;
    }

    try {


      const productToSend = {
        name: newProduct.name,
        price: newProduct.price,
        productionTime: newProduct.productionTime,
        status: newProduct.status,
        idAdministrador: newProduct.idAdministrador, // Este campo debe estar presente
      };


      // Agregar el nuevo producto
      await handleAddProduct(productToSend);

      // Restablecer el estado del formulario
      setNewProduct({ name: '', price: 0, productionTime: 0, status: 'Disponible', idAdministrador: `${user?.uid}` });
      setIsAddProductDialogOpen(false); // Cerrar el diálogo
      toast.success('Producto agregado exitosamente');
    } catch (error) {
      console.error("Error adding product: ", error);
      toast.error('Error al agregar el producto');
    }
  }

  return (
    <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Nuevo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="productName" className="text-sm font-medium">
              Nombre
            </Label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                id="productName"
                placeholder="Nombre del producto"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="pl-10"
                required // Añadir atributo required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Precio
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  className="pl-10"
                  required // Añadir atributo required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionTime" className="text-sm font-medium">
                Tiempo de Producción (min)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  id="productionTime"
                  type="number"
                  placeholder="0"
                  value={newProduct.productionTime}
                  onChange={(e) => setNewProduct({ ...newProduct, productionTime: parseInt(e.target.value) })}
                  className="pl-10"
                  required // Añadir atributo required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
