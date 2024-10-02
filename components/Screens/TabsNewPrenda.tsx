// Importar componentes de UI
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface NewPrendaProps {
    isAddGarmentTypeDialogOpen: boolean;
    setIsAddGarmentTypeDialogOpen: (isOpen: boolean) => void;
    newGarmentType: {
        name: string;
        basePrice: number;
        description: string;
        category: string;
    };
    setNewGarmentType: (newGarmentType: {
        name: string;
        basePrice: number;
        description: string;
        category: string;
    }) => void;
    handleAddGarmentType: () => void;
}

const TabsNewPrenda: React.FC<NewPrendaProps> = (props) => {
    return (
        <Dialog
            open={props.isAddGarmentTypeDialogOpen}
            onOpenChange={props.setIsAddGarmentTypeDialogOpen}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Tipo de Prenda</DialogTitle>
                </DialogHeader>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        props.handleAddGarmentType();
                    }}
                >
                    <div className="grid gap-4 py-4">
                        {/* Nombre */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Nombre
                            </Label>
                            <Input
                                id="name"
                                value={props.newGarmentType.name}
                                onChange={(e) =>
                                    props.setNewGarmentType({
                                        ...props.newGarmentType,
                                        name: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>

                        {/* Precio Base */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="basePrice" className="text-right">
                                Precio Base
                            </Label>
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
                                className="col-span-3"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Descripción
                            </Label>
                            <Input
                                id="description"
                                value={props.newGarmentType.description}
                                onChange={(e) =>
                                    props.setNewGarmentType({
                                        ...props.newGarmentType,
                                        description: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>

                        {/* Categoría */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">
                                Categoría
                            </Label>
                            <Input
                                id="category"
                                value={props.newGarmentType.category}
                                onChange={(e) =>
                                    props.setNewGarmentType({
                                        ...props.newGarmentType,
                                        category: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Agregar Tipo de Prenda</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TabsNewPrenda;
