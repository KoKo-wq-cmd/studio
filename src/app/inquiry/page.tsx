import { InquiryForm } from "@/components/InquiryForm";

export default function InquiryPage() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/inquiry.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      <div className="relative z-10 bg-blue-100/60 backdrop-blur-md rounded-xl shadow-xl border border-blue-200 p-4 max-w-2xl w-full text-center flex flex-col items-center">
        <h1 className="text-2xl md:text-2xl font-bold tracking-tight mb-3 text-blue-800 drop-shadow-sm">
          Moving Quote Inquiry
        </h1>
        <InquiryForm />
      </div>
    </main>
  );
}