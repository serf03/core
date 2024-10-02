import { AnimatePresence, motion } from 'framer-motion';
import Header from '../Header/Header'; // Asegúrate de que los componentes están correctamente importados
import TabsClients from '../Screens/TabsClients';
import TabsDashboard from '../Screens/TabsDashboard';
import TabsFacturacion from '../Screens/TabsFacturacion';
import TabsProduction from '../Screens/TabsProduction';
import TabsProducts from '../Screens/TabsProducts';
import TabsReport from '../Screens/TabsReport';
import TabsUsuario from '../Screens/TabsUsuario';
import { Tabs } from '../ui/tabs';

function MainContent(props) {
    const {
        searchTerm,
        setSearchTerm,
        activeTab,
        setActiveTab,
        products,
        invoices,
        _dailyProduction,
        clients,
        productionRecords,
        users,
        setIsCreateInvoiceDialogOpen,
        setIsChangeInvoiceStatusDialogOpen,
        setInvoiceToChangeStatus,
        handlePrintInvoice,
        handleCancelInvoice,
        setIsAddClientDialogOpen,
        setEditingClient,
        setIsEditClientDialogOpen,
        handleDeleteClient,
        setIsAddProductDialogOpen,
        setEditingProduct,
        setIsEditProductDialogOpen,
        handleDeleteProduct,
    } = props;

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            {/* Dashboard content */}
            <main className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                            {/* Dashboard Tab */}
                            <TabsDashboard
                                products={products}
                                length={products.filter(p => p.stock < 10).length}
                                invoices={invoices}
                                dailyProduction={_dailyProduction}
                            />

                            {/* Facturación Tab */}
                            <TabsFacturacion
                                clients={clients}
                                invoices={invoices}
                                setIsCreateInvoiceDialogOpen={setIsCreateInvoiceDialogOpen}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                setIsChangeInvoiceStatusDialogOpen={setIsChangeInvoiceStatusDialogOpen}
                                setInvoiceToChangeStatus={setInvoiceToChangeStatus}
                                handlePrintInvoice={handlePrintInvoice}
                                handleCancelInvoice={handleCancelInvoice}
                            />

                            {/* Producción Tab */}
                            <TabsProduction
                                productionRecords={productionRecords}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                handleRegisterProduction={props.handleRegisterProduction}
                            />

                            {/* Usuarios Tab */}
                            <TabsUsuario
                                users={users}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                            />

                            {/* Clientes Tab */}
                            <TabsClients
                                clients={clients}
                                setIsAddClientDialogOpen={setIsAddClientDialogOpen}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                setEditingClient={setEditingClient}
                                setIsEditClientDialogOpen={setIsEditClientDialogOpen}
                                handleDeleteClient={handleDeleteClient}
                            />

                            {/* Productos Tab */}
                            <TabsProducts
                                products={products}
                                setIsAddProductDialogOpen={setIsAddProductDialogOpen}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                setEditingProduct={setEditingProduct}
                                setIsEditProductDialogOpen={setIsEditProductDialogOpen}
                                handleDeleteProduct={handleDeleteProduct}
                            />

                            {/* Reportes Tab */}
                            <TabsReport />
                        </Tabs>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}

export default MainContent;
