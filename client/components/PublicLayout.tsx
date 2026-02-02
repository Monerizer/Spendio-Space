import { Layout } from "./Layout";
import { PublicPageHeader } from "./PublicPageHeader";
import { PublicFooter } from "./PublicFooter";
import { useSpendio } from "@/context/SpendioContext";
import { useScrollToTop } from "@/hooks/useScrollToTop";

interface PublicLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  showBackButton?: boolean;
}

export function PublicLayout({ children, currentPage = "public", showBackButton = true }: PublicLayoutProps) {
  const { user } = useSpendio();
  useScrollToTop();

  // If user is authenticated, use the regular Layout
  if (user) {
    return <Layout currentPage={currentPage}>{children}</Layout>;
  }

  // If not authenticated, show public header, content, and footer
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      <PublicPageHeader showBackButton={showBackButton} />
      <div className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </div>
      </div>
      <PublicFooter />
    </div>
  );
}
