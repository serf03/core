// Importar componentes de UI
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TabsContent } from '../ui/tabs';

function TabsProduction(props) {
    return (
        <TabsContent value="production" className="space-y-4">
            <h2 className="text-2xl font-bold">Producción</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Registrar Producción Diaria</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            const amount = parseFloat((e.currentTarget.elements.namedItem('amount') as HTMLInputElement).value);
                            const type = ((e.currentTarget.elements.namedItem('type') as HTMLSelectElement).value as 'Lavado' | 'Planchado' | 'Empaquetado');
                            props.handleRegisterProduction(amount, type);
                        }}
                    >
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="amount">Cantidad (kg)</Label>
                                <Input id="amount" type="number" placeholder="0" />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="type">Tipo de Producción</Label>
                                <Select name="type">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione el tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lavado">Lavado</SelectItem>
                                        <SelectItem value="Planchado">Planchado</SelectItem>
                                        <SelectItem value="Empaquetado">Empaquetado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button type="submit">Registrar Producción</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Producción</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar registro de producción..."
                            value={props.searchTerm}
                            onChange={e => props.setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Cantidad (kg)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.productionRecords
                                .filter(
                                    record =>
                                        record.date.includes(props.searchTerm) ||
                                        record.type.toLowerCase().includes(props.searchTerm.toLowerCase())
                                )
                                .map(record => (
                                    <TableRow key={record.id}>
                                        <TableCell>{record.date}</TableCell>
                                        <TableCell>{record.type}</TableCell>
                                        <TableCell>{record.amount} kg</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
    );
}

export default TabsProduction;
