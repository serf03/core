import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, FileText, Shirt, Tag } from "lucide-react"

interface NewPrendaProps {
    isAddGarmentTypeDialogOpen: boolean
    setIsAddGarmentTypeDialogOpen: (isOpen: boolean) => void
    newGarmentType: {
        name: string
        basePrice: number
        description: string
        category: string
        idAdministrador: string
    }
    setNewGarmentType: (newGarmentType: {
        name: string
        basePrice: number
        description: string
        category: string
        idAdministrador: string
    }) => void
    handleAddGarmentType: () => void
}

const TabsNewPrenda: React.FC<NewPrendaProps> = (props) => {
    return (
        <Dialog open={props.isAddGarmentTypeDialogOpen} onOpenChange={props.setIsAddGarmentTypeDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Agregar Nuevo Tipo de Prenda</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        props.handleAddGarmentType()
                    }}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium">
                                Nombre
                            </Label>
                            <div className="relative">
                                <Shirt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="name"
                                    value={props.newGarmentType.name}
                                    onChange={(e) =>
                                        props.setNewGarmentType({
                                            ...props.newGarmentType,
                                            name: e.target.value,
                                        })
                                    }
                                    className="pl-10"
                                    placeholder="Nombre del tipo de prenda"
                                    aria-label="Nombre del tipo de prenda"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="basePrice" className="text-sm font-medium">
                                Precio Base
                            </Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="basePrice"
                                    type="number"
                                    value={props.newGarmentType.basePrice}
                                    onChange={(e) =>
                                        props.setNewGarmentType({
                                            ...props.newGarmentType,
                                            basePrice: parseFloat(e.target.value),
                                        })
                                    }
                                    className="pl-10"
                                    placeholder="0.00"
                                    aria-label="Precio base del tipo de prenda"
                                    step="0.01"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium">
                                Descripción
                            </Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                <textarea
                                    id="description"
                                    value={props.newGarmentType.description}
                                    onChange={(e) =>
                                        props.setNewGarmentType({
                                            ...props.newGarmentType,
                                            description: e.target.value,
                                        })
                                    }
                                    className="w-full min-h-[100px] pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    placeholder="Descripción del tipo de prenda"
                                    aria-label="Descripción del tipo de prenda"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-sm font-medium">
                                Categoría
                            </Label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="category"
                                    value={props.newGarmentType.category}
                                    onChange={(e) =>
                                        props.setNewGarmentType({
                                            ...props.newGarmentType,
                                            category: e.target.value,
                                        })
                                    }
                                    className="pl-10"
                                    placeholder="Categoría del tipo de prenda"
                                    aria-label="Categoría del tipo de prenda"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button type="button" variant="outline" onClick={() => props.setIsAddGarmentTypeDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Agregar Tipo de Prenda</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default TabsNewPrenda