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

      <div className="relative z-10 bg-blue-100/80 backdrop-blur-md rounded-xl shadow-xl border border-blue-200 p-6 max-w-md w-full flex flex-col">
        <a className="flex items-center space-x-2 self-start ml-20 mt-2" href="/">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-package2 h-6 w-6 text-primary"
          >
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
            <path d="M12 3v6"></path>
          </svg>
          <span className="font-bold sm:inline-block text-lg">
            Move Info Central
          </span>
        </a>

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
