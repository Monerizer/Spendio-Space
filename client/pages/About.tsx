import { PublicLayout } from "@/components/PublicLayout";
import { Users, Target, Heart, Zap } from "lucide-react";

export default function About() {
  return (
    <PublicLayout currentPage="about">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">About Spendio Space</h1>
          <p className="text-[#666666]">Taking the complexity out of personal finance</p>
        </div>

        {/* Our Story */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Our Story</h2>
          <p className="text-[#666666] leading-relaxed">
            Spendio Space was created with a simple mission: to help people understand and take control of their finances without the complexity and privacy concerns of traditional financial apps.
          </p>
          <p className="text-[#666666] leading-relaxed">
            We believe that financial wellness shouldn't require connecting to your bank accounts, uploading sensitive documents, or trusting tech companies with your most private information. Everyone deserves clarity about their money while maintaining complete privacy and anonymity.
          </p>
        </section>

        {/* Our Mission */}
        <section className="bg-gradient-to-r from-[#1db584]/10 to-[#8b5cf6]/10 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <Target size={32} className="text-[#1db584] flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Our Mission</h3>
              <p className="text-[#666666] leading-relaxed">
                To empower individuals with AI-driven financial insights while protecting their privacy. We're building a world where everyone can achieve financial clarity and confidence, on their own terms, without compromising their personal data.
              </p>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#e5e5e5] rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Heart size={24} className="text-[#1db584] flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-[#1a1a1a]">Privacy First</h3>
              </div>
              <p className="text-[#666666]">
                Your data is yours. We don't collect, sell, or share your financial information with anyone. Your privacy is non-negotiable.
              </p>
            </div>

            <div className="border border-[#e5e5e5] rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Zap size={24} className="text-[#8b5cf6] flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-[#1a1a1a]">Simplicity</h3>
              </div>
              <p className="text-[#666666]">
                Financial tools should be intuitive and easy to use. No complexity, no learning curves. Just you and your money.
              </p>
            </div>

            <div className="border border-[#e5e5e5] rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Users size={24} className="text-[#06b6d4] flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-[#1a1a1a]">Transparency</h3>
              </div>
              <p className="text-[#666666]">
                We're honest about how we work, what data we collect, and how we use it. No hidden terms or surprise fees.
              </p>
            </div>

            <div className="border border-[#e5e5e5] rounded-xl p-6">
              <div className="flex items-start gap-3 mb-3">
                <Target size={24} className="text-[#ec4899] flex-shrink-0 mt-1" />
                <h3 className="text-lg font-bold text-[#1a1a1a]">User Empowerment</h3>
              </div>
              <p className="text-[#666666]">
                We put you in control. Export your data, delete your account, change your settings anytime. It's your choice.
              </p>
            </div>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="space-y-4 border-t border-[#e5e5e5] pt-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">What Makes Us Different</h2>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1db584] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#1a1a1a]">No Bank Connections</h4>
                <p className="text-[#666666] text-sm">Manually enter your data. No integrations with banks or other services. Complete control and privacy.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1db584] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#1a1a1a]">Anonymous Account</h4>
                <p className="text-[#666666] text-sm">Just username and email required. No real name, address, or sensitive personal information needed.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1db584] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#1a1a1a]">AI-Powered Insights</h4>
                <p className="text-[#666666] text-sm">Get personalized financial advice from our AI copilot, available 24/7 to answer your questions.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1db584] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-[#1a1a1a]">Your Data, Your Control</h4>
                <p className="text-[#666666] text-sm">Export all your data anytime. Delete your account and all associated data with one click.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section className="space-y-4 border-t border-[#e5e5e5] pt-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">Get in Touch</h2>
          <p className="text-[#666666] leading-relaxed">
            Have questions about Spendio Space? Want to give us feedback? We'd love to hear from you.
          </p>
          <div className="space-y-2">
            <p className="text-[#666666]">
              <span className="font-semibold">Email:</span> support@spendio.space
            </p>
            <p className="text-[#666666]">
              <span className="font-semibold">Support:</span> Visit our <a href="/support" className="text-[#1db584] hover:underline">Support & Help</a> page for FAQs and issue reporting.
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
