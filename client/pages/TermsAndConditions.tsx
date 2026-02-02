import { PublicLayout } from "@/components/PublicLayout";

export default function TermsAndConditions() {
  return (
    <PublicLayout currentPage="terms">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Terms and Conditions</h1>
          <p className="text-[#666666]">Last updated: January 2026</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">1. Acceptance of Terms</h2>
            <p className="text-[#666666] leading-relaxed">
              By accessing and using Spendio, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">2. Use License</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              Permission is granted to temporarily download one copy of the materials (information or software) on Spendio for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#666666]">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transmit the materials to anyone else or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">3. Disclaimer</h2>
            <p className="text-[#666666] leading-relaxed">
              The materials on Spendio are provided on an 'as is' basis. Spendio makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">4. Limitations</h2>
            <p className="text-[#666666] leading-relaxed">
              In no event shall Spendio or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Spendio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">5. Accuracy of Materials</h2>
            <p className="text-[#666666] leading-relaxed">
              The materials appearing on Spendio could include technical, typographical, or photographic errors. Spendio does not warrant that any of the materials on Spendio are accurate, complete, or current. Spendio may make changes to the materials contained on Spendio at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">6. Links</h2>
            <p className="text-[#666666] leading-relaxed">
              Spendio has not reviewed all of the sites linked to its Internet web site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Spendio of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">7. Modifications</h2>
            <p className="text-[#666666] leading-relaxed">
              Spendio may revise these terms of service for Spendio at any time without notice. By using this site, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">8. Contact Information</h2>
            <p className="text-[#666666] leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at support@spendio.com
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
