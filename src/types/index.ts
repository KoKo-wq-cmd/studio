export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
  export interface Lead {
    priority: string;
    category: "Residential" | "Commercial";
    submitted: string | number | Date;
    id: string;
    name: string;
    email: string;
    phone: string;
    currentAddress: Address;
    destinationAddress: Address;
    movingDate: string;
    movingPreference: string;
    additionalNotes: string | null;
    specialInstructions: string;
    createdAt: any;
    numberOfRooms?: number;
    approximateBoxesCount?: string;
    approximateFurnitureCount?: string;
    urgency: "Urgent" | "Urgent Moderate" | "Urgent Low" | null | undefined;
    minEstimate: number | undefined;
    maxEstimate: number | undefined;
  }