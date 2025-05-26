import { getAllLeads } from "@/lib/firestore";
import LeadsTable from "@/components/admin/LeadsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export const revalidate = 0; // Revalidate this page on every request

export default async function AdminDashboardPage() {
  const leads = await getAllLeads();

  return (
    <section className="py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-3xl">Customer Inquiries</CardTitle>
              <CardDescription className="text-md">
                View and manage all submitted moving inquiries.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {leads.length > 0 ? (
            <LeadsTable leads={leads} />
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No inquiries submitted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
