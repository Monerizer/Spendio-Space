import { PublicLayout } from "@/components/PublicLayout";
import { Shield, Lock, AlertCircle, CheckCircle, Key, Eye } from "lucide-react";

export default function Security() {
  return (
    <PublicLayout currentPage="security">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Security</h1>
          <p className="text-[#666666]">Your financial data security is our top priority</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <Shield size={28} className="text-[#1db584]" />
              Our Security Approach
            </h2>
            <p className="text-[#666666] leading-relaxed">
              Spendio prioritizes your privacy and security by design. We believe in end-to-end security where your financial data is protected at every level.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <Lock size={28} className="text-[#1db584]" />
              Data Encryption
            </h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              All data transmitted between your device and our servers is encrypted using industry-standard TLS 1.2+ protocols.
            </p>
            <ul className="space-y-2 text-[#666666]">
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>256-bit encryption in transit (HTTPS/TLS)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>AES-256 encryption at rest on our servers</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>Automatic encryption for all sensitive data</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <Key size={28} className="text-[#1db584]" />
              Authentication & Access Control
            </h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              We implement strong authentication mechanisms to ensure only authorized users can access their accounts.
            </p>
            <ul className="space-y-2 text-[#666666]">
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>Secure password hashing using bcrypt</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>Session management with automatic timeout</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>Protection against common attacks (CSRF, XSS, SQL injection)</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>Rate limiting on authentication endpoints</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <Eye size={28} className="text-[#1db584]" />
              Privacy First
            </h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              Your anonymity is paramount. We do not collect, store, or share any sensitive personal information.
            </p>
            <ul className="space-y-2 text-[#666666]">
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>Only username and email required for signup</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>No bank connections or account linking required</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>No third-party data sharing or sales</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>GDPR compliant data processing</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3 flex items-center gap-2">
              <AlertCircle size={28} className="text-[#1db584]" />
              Infrastructure Security
            </h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              Our infrastructure is hosted on Google Cloud with enterprise-grade security certifications and compliance standards.
            </p>
            <ul className="space-y-2 text-[#666666]">
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>ISO 27001 certified infrastructure</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>SOC 2 Type II compliance</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>Regular security audits and penetration testing</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>Redundant backups with automatic failover</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle size={20} className="text-[#1db584] flex-shrink-0 mt-0.5" />
                <span>DDoS protection and Web Application Firewall</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Security Updates & Patches</h2>
            <p className="text-[#666666] leading-relaxed">
              We stay current with security best practices and apply security patches promptly. Our development team continuously monitors for vulnerabilities and threats.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Report a Security Issue</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              If you discover a security vulnerability, please email us at security@spendio.space with details. We take all security reports seriously and will respond promptly.
            </p>
            <p className="text-[#999999] text-sm">
              Please do not publicly disclose the vulnerability until we have had time to address it.
            </p>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
