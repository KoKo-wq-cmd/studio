import { InquiryForm } from "@/components/InquiryForm";

export default function InquiryPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-blue-700">Moving Quote Inquiry</h1>
        <InquiryForm />
      </div>
    </main>
  );
}