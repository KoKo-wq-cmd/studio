import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyDialogProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function PrivacyPolicyDialog({ open, onAccept, onDecline }: PrivacyPolicyDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-[600px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Privacy Policy Agreement</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            Please review our privacy policy before submitting your information.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            <h3 className="font-semibold">Information We Collect</h3>
            <p>When you fill out our Moving Inquiry form, we collect:</p>
            <ul className="list-disc pl-6">
              <li>Full Name</li>
              <li>Phone Number</li>
              <li>Email Address</li>
              <li>Moving Details (addresses and dates)</li>
            </ul>

            <h3 className="font-semibold mt-4">How We Use Your Information</h3>
            <ul className="list-disc pl-6">
              <li>Provide personalized moving quotes</li>
              <li>Match you with licensed moving companies</li>
              <li>Contact you about your inquiry</li>
            </ul>

            <p className="mt-4">Your data is never sold to third parties.</p>
          </div>
        </ScrollArea>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={onDecline}>Decline</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>Accept & Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}