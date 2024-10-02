// Importar componentes de UI
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TabsContent } from '../ui/tabs';

function TabsUsuario(props) {
    return (
        <TabsContent value="users" className="space-y-4">
            <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <Input
                            placeholder="Buscar usuario..."
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
                                <TableHead>Rol</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {props.users
                                .filter(
                                    user =>
                                        user.name.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
                                        user.email.toLowerCase().includes(props.searchTerm.toLowerCase())
                                )
                                .map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.role}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
    );
}

export default TabsUsuario;
