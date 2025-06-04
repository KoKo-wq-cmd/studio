// src/components/ui/InquiryForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, CheckCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // Adjusted import path based on structure
import { Button } from "@/components/ui/button"; // Adjusted import path
import { Calendar } from "@/components/ui/calendar"; // Adjusted import path
import { Form, FormControl, FormField,FormItem, FormLabel, FormMessage } from "@/components/ui/form"; // Adjusted import path
import { Input } from "@/components/ui/input"; // Adjusted import path
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Adjusted import path
import { submitInquiryAction } from "@/actions/inquiryActions"; // Adjusted import path
import { toast } from "sonner";
import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';

const zipRegex = /^\d{5}(?:-\d{4})?$/;
const phoneRegex = /^\(?([0-9]{3})\)?[-.●]?([0-9]{3})[-.●]?([0-9]{4})$/;

const inquiryFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Invalid phone number"),
  currentAddress: z.object({
    street: z.string().trim().min(2),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    zipCode: z.string().trim().regex(zipRegex, "Invalid ZIP"),
  }),
  destinationAddress: z.object({
    street: z.string().trim().min(2),
    city: z.string().trim().min(2),
    state: z.string().trim().min(2),
    zipCode: z.string().trim().regex(zipRegex, "Invalid ZIP"),
  }),
  movingDate: z.date({ required_error: "Please select a moving date" }),
  numberOfRooms: z.string().trim().min(1, "Required"),
  approximateBoxesCount: z.string().trim().min(1, "Required"),
  approximateFurnitureCount: z.string().trim().min(1, "Required"),
  specialInstructions: z.string().optional(),
  movingPreference: z.enum(["local", "longDistance"]),
});

type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

const defaultValues: Partial<InquiryFormValues> = {
  name: "",
  email: "",
  phone: "",
  currentAddress: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
  },
  destinationAddress: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
  },
  movingDate: undefined,
  numberOfRooms: "",
  approximateBoxesCount: "",
  approximateFurnitureCount: "",
  specialInstructions: "",
  movingPreference: "local",
};

export function InquiryForm() {
  const [isPending, startTransition] = useTransition();
  const [isResetting, setIsResetting] = useState(false); // State to control form reset animation
  const router = useRouter();

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquiryFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(values: InquiryFormValues) {
    startTransition(async () => {
      const result = await submitInquiryAction(values);
      if (result.success) {
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Inquiry submitted successfully!</span>
          </div>,
          {
            duration: 3000,
            description: "We've received your inquiry and will follow up soon.",
          }
        );
        if (result.estimate !== undefined) {
            router.push(`/estimate?estimate=${result.estimate}`);
        } else {
            // Trigger the reset animation if no estimate is available
             setIsResetting(true);
        }

      } else {
        toast.error("Submission failed", {
          description: result.error || "An unexpected error occurred. Please try again.",
          style: { background: "#fee2e2", color: "#dc2626" },
        });
      }
    });
  }

  // Handle form reset after animation completes
  const handleResetAnimationEnd = () => {
    if (isResetting) {
      form.reset(defaultValues);
      setIsResetting(false);
      toast.info("Form has been reset for a new submission.");
    }
  };

  return (
    <div className="relative">
      {/* Circular Progress Indicator */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      )}
      <motion.form
        initial={{ opacity: 1 }}
        animate={{ opacity: isResetting ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        onSubmit={form.handleSubmit(onSubmit)}
        onAnimationComplete={handleResetAnimationEnd}
        className="space-y-6"
      >
        <Form {...form}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 555-5555" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CURRENT ADDRESS */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="currentAddress.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Street</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentAddress.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current City</FormLabel>
                  <FormControl>
                    <Input placeholder="Los Angeles" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="currentAddress.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current State</FormLabel>
                  <FormControl>
                    <Input placeholder="CA" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currentAddress.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current ZIP</FormLabel>
                  <FormControl>
                    <Input placeholder="90001" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* DESTINATION ADDRESS */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="destinationAddress.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Street</FormLabel>
                  <FormControl>
                    <Input placeholder="456 Elm St" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destinationAddress.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination City</FormLabel>
                  <FormControl>
                    <Input placeholder="New York" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="destinationAddress.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination State</FormLabel>
                  <FormControl>
                    <Input placeholder="NY" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destinationAddress.zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination ZIP</FormLabel>
                  <FormControl>
                    <Input placeholder="10001" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* MOVING DATE */}
          <FormField
            control={form.control}
            name="movingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Moving Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        disabled={isPending}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Select a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numberOfRooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Rooms</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 3" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="approximateBoxesCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Approximate Boxes Count</FormLabel>
                <FormControl>
                  <Input placeholder="How many boxes total do you think you will have" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="approximateFurnitureCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Approximate Furniture Count</FormLabel>
                <FormControl>
                  <Input placeholder="How many furniture pieces total do you think you will have" {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Input placeholder="Optional notes..." {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="movingPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moving Preference</FormLabel>
                <FormControl>
                  <select {...field} className="w-full p-2 border rounded-md" disabled={isPending}>
                    <option value="local">Local</option>
                    <option value="longDistance">Long Distance</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={isPending} type="submit" className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </Form>
      </motion.form>
    </div>
  );
}