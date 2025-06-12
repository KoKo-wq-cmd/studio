import Link from "next/link";

export default function LandingPage() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/images/landing.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      <div className="relative z-10 bg-blue-100/80 backdrop-blur-md rounded-xl shadow-xl border border-blue-200 p-6 max-w-md w-full text-center flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3 text-blue-800 drop-shadow-sm">
          Welcome to{" "}
          <span className="text-blue-600">Move Info Central</span>
        </h1>
        <p className="text-base md:text-lg text-blue-900 mb-6 font-normal">
          Get fast, accurate moving quotes from trusted companies.
          <br />
          Start your journey by filling out our quick inquiry form.
        </p>
        <Link
          href="/inquiry"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold text-base shadow hover:bg-blue-700 transition"
        >
          Get My Moving Quote
        </Link>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 left-0 w-full flex justify-center z-20">
        <span className="text-xs text-white bg-black/40 px-4 py-2 rounded-full shadow">
          © 2025 Move Info Central. All rights reserved.
        </span>
      </footer>
    </main>
  );
}
