import { PublicLayout } from "@/components/PublicLayout";
import { TrendingUp, BarChart3, Zap, Lock, Target, Globe, Smartphone, Zap as ZapIcon, PieChart, Brain, DollarSign, Shield } from "lucide-react";

export default function Features() {
  return (
    <PublicLayout currentPage="features">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Features</h1>
          <p className="text-[#666666]">Everything you need to take control of your finances</p>
        </div>

        {/* Core Features */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Income & Expense Tracking",
                description: "Easily record and categorize all your income and expenses. Track spending patterns and trends over time."
              },
              {
                icon: PieChart,
                title: "Smart Analytics",
                description: "Visual charts and detailed breakdowns of your financial data. Understand your money at a glance."
              },
              {
                icon: Target,
                title: "Goal Setting",
                description: "Set savings and investing goals. Track your progress and celebrate milestones as you reach them."
              },
              {
                icon: BarChart3,
                title: "Financial Health Score",
                description: "Get a personalized score based on your financial habits. Receive actionable insights to improve."
              },
              {
                icon: DollarSign,
                title: "Multi-Currency Support",
                description: "Support for 20+ currencies worldwide. Perfect for managing finances in any country or currency."
              },
              {
                icon: Lock,
                title: "Debt Tracking",
                description: "Monitor all your debts in one place. Track payments and plan your debt payoff strategy."
              }
            ].map((feature, idx) => (
              <div key={idx} className="border border-[#e5e5e5] rounded-xl p-6 hover:shadow-lg transition">
                <feature.icon size={32} className="text-[#1db584] mb-4" />
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{feature.title}</h3>
                <p className="text-[#666666]">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Advanced Features */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Advanced Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: Brain,
                title: "AI Copilot",
                description: "Get personalized financial advice from our AI advisor. Ask questions and get recommendations 24/7."
              },
              {
                icon: ZapIcon,
                title: "Voice Commands",
                description: "Speak with Copilot using voice. Input transactions and get advice hands-free."
              },
              {
                icon: Smartphone,
                title: "Responsive Design",
                description: "Works seamlessly on all devices. Desktop, tablet, and mobile - always synchronized."
              },
              {
                icon: Globe,
                title: "100% Private",
                description: "Your data stays on your device. No bank connections, no data collection, no tracking."
              },
              {
                icon: Shield,
                title: "Anonymous Sign-up",
                description: "Just username and email required. No sensitive personal data needed."
              },
              {
                icon: TrendingUp,
                title: "Spending Insights",
                description: "Understand your spending habits with detailed analytics and recommendations."
              }
            ].map((feature, idx) => (
              <div key={idx} className="border border-[#e5e5e5] rounded-xl p-6 hover:shadow-lg transition">
                <feature.icon size={32} className="text-[#8b5cf6] mb-4" />
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{feature.title}</h3>
                <p className="text-[#666666]">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Premium Features */}
        <section className="bg-gradient-to-r from-[#1db584]/5 to-[#8b5cf6]/5 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Premium Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              "Unlimited AI advisor access",
              "Advanced analytics & trends",
              "Custom reports & exports",
              "Investment portfolio tracking",
              "Tax planning insights",
              "Priority support"
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#1db584] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">✓</span>
                </div>
                <span className="text-[#1a1a1a] font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Why Choose Spendio Space?</h2>
          <div className="space-y-4">
            {[
              {
                title: "Privacy First",
                description: "We don't sell your data. We don't track you. Your financial information is yours alone."
              },
              {
                title: "Simple & Intuitive",
                description: "Beautiful design that's easy to use. Get started in minutes, no technical knowledge needed."
              },
              {
                title: "Powerful Insights",
                description: "AI-powered recommendations help you make better financial decisions and build wealth."
              },
              {
                title: "Always Accessible",
                description: "Works offline. Your data syncs automatically when you're connected. Access anytime, anywhere."
              }
            ].map((item, idx) => (
              <div key={idx} className="border-l-4 border-[#1db584] pl-4 py-2">
                <h3 className="font-bold text-[#1a1a1a]">{item.title}</h3>
                <p className="text-[#666666] text-sm mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
