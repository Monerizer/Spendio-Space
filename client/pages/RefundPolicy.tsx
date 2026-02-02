import { PublicLayout } from "@/components/PublicLayout";

export default function RefundPolicy() {
  return (
    <PublicLayout currentPage="refund">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Refund Policy</h1>
          <p className="text-[#666666]">Last updated: January 2026</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">1. Free Trial Refund</h2>
            <p className="text-[#666666] leading-relaxed">
              All new Premium subscriptions include a 7-day free trial. During the trial period, you can cancel anytime without being charged. If you cancel before the trial ends, no payment will be processed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">2. Paid Subscription Refunds</h2>
            <p className="text-[#666666] leading-relaxed">
              We offer a 14-day money-back guarantee for paid Premium subscriptions. If you're not satisfied with your Premium subscription, contact us within 14 days of your purchase for a full refund. No questions asked.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">3. Refund Process</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              To request a refund:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-[#666666]">
              <li>Email us at support@spendio.space with your account email</li>
              <li>Clearly state that you want a refund and the reason</li>
              <li>Include your order confirmation if available</li>
              <li>We will process your refund within 5-7 business days</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">4. Cancellation vs Refund</h2>
            <p className="text-[#666666] leading-relaxed">
              <strong>Canceling your subscription</strong> stops future charges on your next billing date. Your current access continues until the billing cycle ends.
            </p>
            <p className="text-[#666666] leading-relaxed mt-2">
              <strong>Requesting a refund</strong> is different and applies only within the 14-day refund window after purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">5. Non-Refundable Items</h2>
            <p className="text-[#666666] leading-relaxed">
              The following are non-refundable:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#666666]">
              <li>Subscriptions cancelled after 14 days from purchase</li>
              <li>Refunds requested more than 14 days after purchase</li>
              <li>Subscriptions already accessed for more than 2 weeks</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">6. Partial Refunds</h2>
            <p className="text-[#666666] leading-relaxed">
              If you request a refund after using Spendio for several days, we may process a partial refund based on the amount of time used. Full refunds are guaranteed within the first 7 days of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">7. Billing Issues</h2>
            <p className="text-[#666666] leading-relaxed">
              If you notice an unauthorized charge or duplicate billing, please contact support immediately. We will investigate and correct the issue within 2 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">8. Contact Support</h2>
            <p className="text-[#666666] leading-relaxed">
              For refund requests or billing issues, email us at support@spendio.com with the subject line "Refund Request" and include your account details.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
