import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-6xl font-bold text-[#999999] mb-4">404</div>
        <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Page not found</h1>
        <p className="text-[#666666] mb-8 max-w-sm">
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#1db584] text-white font-semibold rounded-lg hover:bg-[#0f8a56] transition"
        >
          <Home size={20} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
