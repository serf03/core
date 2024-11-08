// Importar componentes de UI
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { TabsContent } from '../ui/tabs';

// Importar iconos
import { Edit, Plus, Trash } from 'lucide-react';

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

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
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className={`h-10 w-10 ${getAvatarColor(client.name)}`}>
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${client.name}`} />
                          <AvatarFallback>{getInitials(client.name)}</AvatarFallback>
                        </Avatar>
                        <span>{client.name}</span>
                      </div>
                    </TableCell>
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