'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { TabsContent } from '@/components/ui/tabs'
import { Expense } from '@/lib/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { DollarSign, Edit, Plus, Search, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { addExpense, deleteExpense, subscribeToExpenses, updateExpense } from '../../lib/firebaseServices'
import { useAuth } from "../context/AuthContext"
import { AvatarImage } from '../ui/avatar'

const expenseSchema = z.object({
    id: z.string().optional(),
    description: z.string().min(1, 'La descripción es requerida'),
    amount: z.number().min(0, 'El monto debe ser positivo'),
    date: z.string(),
})

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function getAvatarColor(name: string) {
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
}

export default function TabsExpenses() {
    const { user } = useAuth()
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false)
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null) as [Expense | null, React.Dispatch<React.SetStateAction<Expense | null>>];



    const form = useForm<z.infer<typeof expenseSchema>>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            description: '',
            amount: 0,
            date: format(new Date(), 'yyyy-MM-dd'),
        },
    })

    useEffect(() => {
        const unsubscribe = subscribeToExpenses((updatedExpenses) => {
            setExpenses(updatedExpenses)
        })
        return () => unsubscribe()
    }, [])

    const onSubmit = async (values: z.infer<typeof expenseSchema>) => {
        try {

            console.log(editingExpense);


            if (editingExpense) {
                await updateExpense({ ...values, id: editingExpense.id, idAdministrador: `${user?.uid}` })
            } else {
                await addExpense(values)
            }
            setIsAddExpenseDialogOpen(false)
            setEditingExpense(null)
            form.reset()
        } catch (error) {
            console.error('Error al guardar el gasto:', error)
        }
    }

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense)
        form.reset(expense)
        setIsAddExpenseDialogOpen(true)
    }

    const handleDeleteExpense = async (id?: string) => {
        try {
            await deleteExpense(id || "")
        } catch (error) {
            console.error('Error al eliminar el gasto:', error)
        }
    }

    const filteredExpenses = expenses.filter((expense) =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <TabsContent value="expenses" className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gastos</h2>
                <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="default"
                            className="bg-black hover:bg-black/90 text-white"
                            onClick={() => {
                                setEditingExpense(null)
                                form.reset({
                                    description: '',
                                    amount: 0,
                                    date: format(new Date(), 'yyyy-MM-dd')
                                })
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Agregar Gasto
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {editingExpense ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
                            </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Nombre del gasto" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Monto</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        className="pl-10"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex justify-end gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddExpenseDialogOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-black hover:bg-black/90 text-white"
                                    >
                                        {editingExpense ? 'Actualizar' : 'Agregar'} Gasto
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                        <Input
                            placeholder="Buscar gasto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 max-w-sm"
                        />
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Avatar className={`h-10 w-10 ${getAvatarColor(expense.description)}`}>
                                                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${expense.description}`} />
                                                <AvatarFallback>{getInitials(expense.description)}</AvatarFallback>
                                            </Avatar>
                                            <span>    {expense.description}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>${expense.amount.toFixed(2)}</TableCell>
                                    <TableCell>{format(new Date(expense.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-black hover:bg-black/90 text-white"
                                                onClick={() => handleEditExpense(expense)}
                                            >
                                                <Edit className=" h-4 w-10" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handleDeleteExpense(expense?.id)}
                                            >
                                                <Trash className="h-4 w-4" />
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
    )
}