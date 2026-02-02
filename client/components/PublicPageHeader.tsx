import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PublicPageHeaderProps {
  showBackButton?: boolean;
}

export function PublicPageHeader({ showBackButton = true }: PublicPageHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e5e5e5] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-3" aria-label="Spendio Space home">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0f8a56] to-[#1db584] flex items-center justify-center text-white font-bold text-lg">
            SS
          </div>
          <div>
            <div className="font-semibold text-sm">Spendio Space</div>
            <div className="text-xs text-[#666666]">Money clarity</div>
          </div>
        </Link>

        {showBackButton && (
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1db584] hover:bg-[#f3f3f3] rounded-lg transition"
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
        )}
      </div>
    </header>
  );
}
