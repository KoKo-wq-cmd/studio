"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { Suspense } from 'react';
import { FileText } from "lucide-react";
import LeadsTable from "@/components/admin/LeadsTable";
import { useSearchParams } from 'next/navigation';
import { Lead } from '@/types';
import { getLeadsPage, deleteAllLeads } from "@/lib/firestore";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="flex items-center mb-6">
          <FileText className="mr-3 h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Admin Dashboard</h2>
            <p className="text-gray-500">Manage leads and AI insights.</p>
          </div>
        </div>
        <Suspense fallback={<div>Loading leads...</div>}>
          <LeadsTableWrapper />
        </Suspense>
      </div>
    </div>
  );
}

function AdminContent() {
  return (
    <div>
      <div className="flex items-center mb-4">
        <FileText className="mr-2 h-4 w-4" />
        <div>
          <h2 className="text-lg font-semibold">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">Manage leads and AI insights.</p>
        </div>
      </div>
      <LeadsTableWrapper />
    </div>
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
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button variant="default" onClick={handleExport}>
          Export Leads
        </Button>
        <Button variant="destructive" onClick={handleDeleteAll} disabled={deleting}>
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

function convertLeadsToCSV(leads: Lead[]): string {
  // Define CSV headers - match exactly with Admin table columns
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Current Street',
    'Current City',
    'Current State',
    'Current ZipCode',
    'Destination Street',
    'Destination City',
    'Destination State',
    'Destination ZipCode',
    'Move Date',
    'Number of Rooms',
    'Approximate Boxes Count',
    'Approximate Furniture Count',
    'Special Instructions',
    'Move Type',
    'Category',
    'Urgency',  // Added Urgency header
    'Created At'
  ].join(',');

  // Convert each lead to CSV row - match column order with headers
  const rows = leads.map(lead => {
    // Calculate urgency if not present
    const urgency = lead.urgency || getTimelineCategory(new Date(lead.movingDate));

    return [
      lead.name,
      lead.email,
      lead.phone,
      `"${lead.currentAddress.street}"`,
      lead.currentAddress.city,
      lead.currentAddress.state,
      lead.currentAddress.zipCode,
      `"${lead.destinationAddress.street}"`,
      lead.destinationAddress.city,
      lead.destinationAddress.state,
      lead.destinationAddress.zipCode,
      new Date(lead.movingDate).toLocaleDateString(),
      lead.numberOfRooms !== undefined ? lead.numberOfRooms.toString() : 'N/A',
      lead.approximateBoxesCount || 'N/A',
      lead.approximateFurnitureCount || 'N/A',
      `"${lead.specialInstructions || ''}"`,
      lead.movingPreference,
      lead.category || 'Residential',
      urgency,  // Added Urgency value
      new Date(lead.createdAt).toLocaleDateString()
    ].map(value => {
      // Properly escape values containing commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  return [headers, ...rows].join('\n');
}

function getTimelineCategory(date: Date): "Urgent" | "Urgent Moderate" | "Urgent Low" | null {
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;

  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return "Urgent";
  } else if (diffDays <= 21) {
    return "Urgent Moderate";
  } else if (diffDays > 21) {
    return "Urgent Low";
  }
  return null;
}

