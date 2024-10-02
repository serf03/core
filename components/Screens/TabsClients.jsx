// Importar componentes de UI
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TabsContent } from '../ui/tabs';

// Importar iconos
import { Edit, Plus, Trash } from 'lucide-react';

function TabsClients(props) {
    return (
        <TabsContent value="clients" className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Clientes</h2>
                <Button onClick={() => props.setIsAddClientDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Agregar Cliente
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar cliente..."
                            value={props.searchTerm}
                            onChange={e => props.setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Correo</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Cédula</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.clients
                                .filter(
                                    client =>
                                        client.name.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
                                        client.email.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
                                        client.phone.includes(props.searchTerm) ||
                                        client.cedula.includes(props.searchTerm)
                                )
                                .map(client => (
                                    <TableRow key={client.id}>
                                        <TableCell>{client.id}</TableCell>
                                        <TableCell>{client.name}</TableCell>
                                        <TableCell>{client.email}</TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell>{client.cedula}</TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() => {
                                                        props.setEditingClient(client);
                                                        props.setIsEditClientDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Editar
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => props.handleDeleteClient(client.id)}
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

export default TabsClients;
