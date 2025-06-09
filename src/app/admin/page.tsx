"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useSearchParams } from 'next/navigation';
import { Lead } from '@/types';
import { getLeadsPage, deleteAllLeads } from "@/lib/firestore";
import LeadsTable from "@/components/admin/LeadsTable";
import React from 'react';
import { Button } from "@/components/ui/button";
import { convertLeadsToCSV } from "@/lib/utils";

function AdminDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          Admin Dashboard
        </CardTitle>
        <CardDescription>Manage leads and AI insights.</CardDescription>
      </CardHeader>
      <CardContent>
        <LeadsTableWrapper />
      </CardContent>
    </Card>
  );
}

function LeadsTableWrapper() {
  const searchParams = useSearchParams();
  const cursor = searchParams.get('cursor') || null;
  const [leadsData, setLeadsData] = React.useState<Lead[] | null>(null);
  const [lastVisible, setLastVisible] = React.useState(null);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    async function loadLeads() {
      const { leads, lastVisible } = await getLeadsPage(cursor);
      setLeadsData(leads);
      setLastVisible(lastVisible);
    }
    loadLeads();
  }, [cursor]);

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete ALL leads? This cannot be undone.")) return;
    setDeleting(true);
    await deleteAllLeads();
    setDeleting(false);
    setLeadsData([]); // Clear table after deletion
  };

  const handleExport = () => {
    if (!leadsData || leadsData.length === 0) {
      alert('No leads to export');
      return;
    }

    const csv = convertLeadsToCSV(leadsData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!leadsData) {
    return <div>Loading leads...</div>;
  }

  return (
    <div>
      <div className="flex justify-end mb-4 gap-2">
        <Button
          variant="default"
          onClick={handleExport}
        >
          Export Leads
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteAll}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete All Leads"}
        </Button>
        {lastVisible && (
          <Button asChild>
            <a href={`/admin?cursor=${lastVisible}`}>Load More</a>
          </Button>
        )}
      </div>
      <LeadsTable leads={leadsData} />
    </div>
  );
}

export default AdminDashboardPage;
