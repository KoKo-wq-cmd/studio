"use client";

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function EstimatePage() {
  const searchParams = useSearchParams();
  const minEstimate = searchParams.get('minEstimate');
  const maxEstimate = searchParams.get('maxEstimate');

  return (
    <div className="container mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Approximate Estimate</CardTitle>
        </CardHeader>
        <CardContent>
          {(minEstimate && maxEstimate) ? (
            <p className="text-lg">Your approximate estimate is: ${parseFloat(minEstimate).toFixed(2)} - ${parseFloat(maxEstimate).toFixed(2)}</p>
          ) : (
            <p className="text-lg text-muted-foreground">Estimate not available.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default EstimatePage;
