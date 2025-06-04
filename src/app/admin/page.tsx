"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect } from 'react';
import { Lead } from '@/types';

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

  React.useEffect(() => {
    async function loadLeads() {
      const { leads, lastVisible } = await getLeadsPage(cursor);
      setLeadsData(leads);
      setLastVisible(lastVisible);
    }

    loadLeads();
  }, [cursor]);

  if (!leadsData) {
    return <div>Loading leads...</div>;
  }

  return (
    <div>
      <LeadsTable leads={leadsData} />
      {lastVisible && (
        <Button asChild>
          <a href={`/admin?cursor=${lastVisible}`}>Load More</a>
        </Button>
      )}
    </div>
  );
}

import { getLeadsPage } from "@/lib/firestore";
import LeadsTable from "@/components/admin/LeadsTable";
import React from 'react';
import { Button } from "@/components/ui/button";

export default AdminDashboardPage;
