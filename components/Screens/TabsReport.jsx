import { TabsContent } from '../ui/tabs';
import DashboardReport from "../report/DashboardReport"

function TabsReport(props) {
    return (
        <TabsContent value="reports" className="space-y-4">
          <DashboardReport invoices={props.invoices} client={props.clients}/>
        </TabsContent>
    );
}

export default TabsReport;
