"use client"

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"

import {
    DollarSign,
    FileText,
    Shirt,
    Tag
} from 'lucide-react'
import { Input } from "../ui/input"
import { Label } from "../ui/label"

function EditPrendaModule(props) {
    
    return (
        <Dialog open={props.isEditGarmentTypeDialogOpen} onOpenChange={props.setIsEditGarmentTypeDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Editar Tipo de Prenda</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        props.handleUpdateGarmentType()
                    }}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="editName" className="text-sm font-medium">
                                Nombre
                            </Label>
                            <div className="relative">
                                <Shirt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="editName"
                                    value={props.editingGarmentType?.name || ""}
                                    onChange={(e) =>
                                        props.setEditingGarmentType((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    name: e.target.value,
                                                }
                                                : null
                                        )
                                    }
                                    className="pl-10"
                                    placeholder="Nombre del tipo de prenda"
                                    aria-label="Nombre del tipo de prenda"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editBasePrice" className="text-sm font-medium">
                                Precio Base
                            </Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="editBasePrice"
                                    type="number"
                                    value={props.editingGarmentType?.basePrice || 0}
                                    onChange={(e) =>
                                        props.setEditingGarmentType((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    basePrice: parseFloat(e.target.value),
                                                }
                                                : null
                                        )
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
                            <Label htmlFor="editDescription" className="text-sm font-medium">
                                Descripción
                            </Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                                <textarea
                                    id="editDescription"
                                    value={props.editingGarmentType?.description || ""}
                                    onChange={(e) =>
                                        props.setEditingGarmentType((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    description: e.target.value,
                                                }
                                                : null
                                        )
                                    }
                                    className="w-full min-h-[100px] pl-10 pr-4 py-2 rounded-md border border-input bg-background text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    placeholder="Descripción del tipo de prenda"
                                    aria-label="Descripción del tipo de prenda"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editCategory" className="text-sm font-medium">
                                Categoría
                            </Label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    id="editCategory"
                                    value={props.editingGarmentType?.category || ""}
                                    onChange={(e) =>
                                        props.setEditingGarmentType((prev) =>
                                            prev
                                                ? {
                                                    ...prev,
                                                    category: e.target.value,
                                                }
                                                : null
                                        )
                                    }
                                    className="pl-10"
                                    placeholder="Categoría del tipo de prenda"
                                    aria-label="Categoría del tipo de prenda"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button type="button" variant="outline" onClick={() => props.setIsEditGarmentTypeDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit">Actualizar Tipo de Prenda</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default EditPrendaModule