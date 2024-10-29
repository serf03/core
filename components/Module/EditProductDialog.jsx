import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, Clock, DollarSign, Package } from "lucide-react"

function EditProductDialog(props) {
  return (
    <Dialog open={props.isEditProductDialogOpen} onOpenChange={props.setIsEditProductDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Editar Servicio</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            props.handleUpdateProduct()
          }}
          className="space-y-6"
        >
            <div className="space-y-2">
              <Label htmlFor="editProductName" className="text-sm font-medium">
                Nombre
              </Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="editProductName"
                  value={props.editingProduct?.name || ""}
                  onChange={(e) =>
                    props.setEditingProduct(props.editingProduct ? { ...props.editingProduct, name: e.target.value } : null)
                  }
                  className="pl-10"
                  placeholder="Nombre del producto"
                  aria-label="Nombre del producto"
                />
              </div>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editPrice" className="text-sm font-medium">
                Precio
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="editPrice"
                  type="number"
                  value={props.editingProduct?.price || 0}
                  onChange={(e) =>
                    props.setEditingProduct(
                      props.editingProduct ? { ...props.editingProduct, price: parseFloat(e.target.value) } : null
                    )
                  }
                  className="pl-10"
                  placeholder="0.00"
                  aria-label="Precio del producto"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editProductionTime" className="text-sm font-medium">
                Tiempo de Producción (min)
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  id="editProductionTime"
                  type="number"
                  value={props.editingProduct?.productionTime || 0}
                  onChange={(e) =>
                    props.setEditingProduct(
                      props.editingProduct ? { ...props.editingProduct, productionTime: parseInt(e.target.value, 10) } : null
                    )
                  }
                  className="pl-10"
                  placeholder="0"
                  aria-label="Tiempo de producción en minutos"
                  min="0"
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editStatus" className="text-sm font-medium">
              Estado
            </Label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Select
                value={props.editingProduct?.status}
                onValueChange={(value) =>
                  props.setEditingProduct(props.editingProduct ? { ...props.editingProduct, status: value } : null)
                }
              >
                <SelectTrigger className="pl-10" aria-label="Estado del producto">
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
          <DialogFooter className="sm:justify-between">
            <Button type="button" variant="outline" onClick={() => props.setIsEditProductDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditProductDialog