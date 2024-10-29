import { motion } from 'framer-motion';
import { DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TabsContent } from "../ui/tabs";

function TabsDashboard(props) {
    return (
        <TabsContent value="dashboard" className="space-y-4">
            <h2 className="text-2xl font-bold">Dashboard Principal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${props.invoices.reduce((sum, inv) => sum + inv.total, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Producción Diaria</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{props.dailyProduction} kg</div>
                            <p className="text-xs text-muted-foreground">+5% desde ayer</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Inventario</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {props.products.reduce((sum, p) => sum + p.stock, 0)} items
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {props.length} productos con stock bajo
                            </p>
                        </CardContent>
                    </Card>
                </motion.div> */}

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Cuentas por Cobrar</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${props.invoices.filter((inv) => inv.status === 'En Proceso').reduce((sum, inv) => sum + inv.total, 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {props.invoices.filter((inv) => inv.status === 'En Proceso').length} facturas en proceso
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </TabsContent>
    );
}

export default TabsDashboard;
