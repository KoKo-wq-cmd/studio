import { useState } from 'react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export const MoveInquiryForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    fromAddress: '',
    toAddress: '',
    moveDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      alert("You must agree to the data usage disclosure to submit.");
      return;
    }
    setShowPrivacyDialog(true);
  };

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      const inquiriesRef = collection(db, 'moveInquiries');
      await addDoc(inquiriesRef, {
        ...formData,
        createdAt: Date.now(),
        status: 'new'
      });
      toast.success('Your inquiry has been submitted successfully!');
      setShowPrivacyDialog(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        fromAddress: '',
        toAddress: '',
        moveDate: ''
      });
    } catch (error) {
      toast.error('Failed to submit your inquiry. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    setShowPrivacyDialog(false);
    toast.error('You must accept the privacy policy to submit.');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Full Name"
          required
        />
        
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          required
        />
        
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          placeholder="Phone"
          required
        />
        
        <input
          type="text"
          name="fromAddress"
          value={formData.fromAddress}
          onChange={e => setFormData({ ...formData, fromAddress: e.target.value })}
          placeholder="Current Address"
          required
        />
        
        <input
          type="text"
          name="toAddress"
          value={formData.toAddress}
          onChange={e => setFormData({ ...formData, toAddress: e.target.value })}
          placeholder="Destination Address"
          required
        />
        
        <input
          type="date"
          name="moveDate"
          value={formData.moveDate}
          onChange={e => setFormData({ ...formData, moveDate: e.target.value })}
          required
        />
        
        <div className="text-xs text-gray-600 mb-2">
          By clicking <b>"Submit"</b>, you agree to our <b>Moving Quote Form Data Usage Disclosure</b> and consent to your information being shared with moving companies to provide quotes. You may be contacted by these companies via phone, email, or other means.
        </div>

        <div className="flex items-center mb-4">
          <input
            id="data-usage-agree"
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mr-2"
            required
          />
          <label htmlFor="data-usage-agree" className="text-sm">
            I agree to the <b>Moving Quote Form Data Usage Disclosure</b> and consent to being contacted by moving companies for quotes.
          </label>
        </div>

        <button 
          type="submit" 
          className="w-full p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      <AlertDialog open={showPrivacyDialog}>
        <AlertDialogPortal>
          <AlertDialogOverlay className="bg-black/80" />
          <AlertDialogContent className="max-w-[600px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Privacy Policy Agreement</AlertDialogTitle>
              <AlertDialogDescription>
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

            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDecline}>
                Decline
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleAccept}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Accept & Submit'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogPortal>
      </AlertDialog>
    </>
  );
};