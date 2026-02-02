import { PublicLayout } from "@/components/PublicLayout";

export default function PrivacyPolicy() {
  return (
    <PublicLayout currentPage="privacy">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Privacy Policy</h1>
          <p className="text-[#666666]">Last updated: January 2026</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">1. Introduction</h2>
            <p className="text-[#666666] leading-relaxed">
              Spendio ("we" or "us" or "our") operates the Spendio application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">2. Information Collection and Use</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <h3 className="font-semibold text-[#1a1a1a] mb-2">Types of Data Collected:</h3>
            <ul className="list-disc list-inside space-y-1 text-[#666666]">
              <li><strong>Email address</strong> - Used for account creation and authentication</li>
              <li><strong>Financial data</strong> - Transactions, balances, income, expenses stored locally on your device</li>
              <li><strong>Usage data</strong> - Pages visited, time spent, features used</li>
              <li><strong>Device information</strong> - Browser type, IP address, operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">3. Data Storage</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              Your financial data storage depends on how you access Spendio:
            </p>
            <div className="space-y-3 text-[#666666]">
              <div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1">Web Browser (Computer):</h3>
                <p className="leading-relaxed">
                  Financial data is stored on Google Cloud servers. All data is encrypted in transit and at rest. Your data is only accessible to you and is never shared with third parties.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#1a1a1a] mb-1">Mobile App:</h3>
                <p className="leading-relaxed">
                  Financial data is stored locally on your device. We do not synchronize app data to our servers unless you explicitly enable cloud backup.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">4. Data Security</h2>
            <p className="text-[#666666] leading-relaxed">
              The security of your data is important to us. We use Google Cloud's enterprise-grade security infrastructure which includes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#666666] mt-3">
              <li>256-bit encryption in transit (HTTPS/TLS)</li>
              <li>Encryption at rest on Google Cloud servers</li>
              <li>Regular security audits and compliance certifications</li>
              <li>ISO 27001 and SOC 2 compliance</li>
            </ul>
            <p className="text-[#666666] leading-relaxed mt-3">
              While we implement industry-standard security measures, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security, but we strive to protect your data with the best available practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">5. Third-Party Services</h2>
            <p className="text-[#666666] leading-relaxed">
              Our Service may contain links to third-party sites that are not operated by us. We have no control over the content, accuracy, or practices of these sites and cannot accept responsibility for their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">6. GDPR Compliance</h2>
            <p className="text-[#666666] leading-relaxed">
              If you are a resident of the European Union, you have certain rights under GDPR including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#666666] mt-2">
              <li>Right to access your personal data</li>
              <li>Right to rectify (correct) your personal data</li>
              <li>Right to delete your personal data</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
            </ul>
            <p className="text-[#666666] leading-relaxed mt-3">
              Spendio uses Google Cloud, which is certified as GDPR compliant. Your data is processed in accordance with GDPR regulations. You can exercise these rights by contacting us at support@spendio.space
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">7. Children's Privacy</h2>
            <p className="text-[#666666] leading-relaxed">
              Our Service does not address anyone under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">8. Changes to This Privacy Policy</h2>
            <p className="text-[#666666] leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">9. Contact Us</h2>
            <p className="text-[#666666] leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at support@spendio.space
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
