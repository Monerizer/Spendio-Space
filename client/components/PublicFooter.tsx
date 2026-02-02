import { useNavigate } from "react-router-dom";

export function PublicFooter() {
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-[#e5e5e5] py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-bold text-[#1a1a1a] mb-4">Spendio Space</div>
            <p className="text-sm text-[#666666]">Money clarity, without complexity.</p>
          </div>
          <div>
            <div className="font-semibold text-[#1a1a1a] mb-4">Product</div>
            <ul className="space-y-2 text-sm text-[#666666]">
              <li><button onClick={() => navigate('/features')} className="hover:text-[#1db584] cursor-pointer text-left">Features</button></li>
              <li><button onClick={() => navigate('/billing')} className="hover:text-[#1db584] cursor-pointer text-left">Pricing</button></li>
              <li><button onClick={() => navigate('/security')} className="hover:text-[#1db584] cursor-pointer text-left">Security</button></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[#1a1a1a] mb-4">Company</div>
            <ul className="space-y-2 text-sm text-[#666666]">
              <li><button onClick={() => navigate('/about')} className="hover:text-[#1db584] cursor-pointer text-left">About</button></li>
              <li><button onClick={() => navigate('/support')} className="hover:text-[#1db584] cursor-pointer text-left">Support</button></li>
              <li><button onClick={() => navigate('/support')} className="hover:text-[#1db584] cursor-pointer text-left">Contact</button></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-[#1a1a1a] mb-4">Legal</div>
            <ul className="space-y-2 text-sm text-[#666666]">
              <li><button onClick={() => navigate('/privacy')} className="hover:text-[#1db584] cursor-pointer text-left">Privacy</button></li>
              <li><button onClick={() => navigate('/terms')} className="hover:text-[#1db584] cursor-pointer text-left">Terms</button></li>
              <li><button onClick={() => navigate('/accessibility')} className="hover:text-[#1db584] cursor-pointer text-left">Accessibility</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[#e5e5e5] pt-8 text-center text-sm text-[#999999]">
          <p>&copy; 2026 Spendio Space. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
