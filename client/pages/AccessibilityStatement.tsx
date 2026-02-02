import { PublicLayout } from "@/components/PublicLayout";

export default function AccessibilityStatement() {
  return (
    <PublicLayout currentPage="accessibility">
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Accessibility Statement</h1>
          <p className="text-[#666666]">Last updated: January 2026</p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Our Commitment</h2>
            <p className="text-[#666666] leading-relaxed">
              Spendio is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Accessibility Standards</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. WCAG is part of a series of accessibility guidelines published by the Web Accessibility Initiative (WAI) of the World Wide Web Consortium (W3C), the international standards organization for the Internet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Accessibility Features</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              Spendio includes the following accessibility features:
            </p>
            <div className="space-y-3">
              <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg p-4">
                <h3 className="font-semibold text-[#1a1a1a] mb-2">🎹 Keyboard Navigation</h3>
                <p className="text-[#666666] text-sm leading-relaxed">
                  All functionality is accessible via keyboard. You can navigate the app using Tab and Shift+Tab, select items with Enter, and use arrow keys for navigation in dropdowns and menus. Press Escape to close modals and dialogs.
                </p>
              </div>
              <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg p-4">
                <h3 className="font-semibold text-[#1a1a1a] mb-2">🔊 Screen Reader Support</h3>
                <p className="text-[#666666] text-sm leading-relaxed">
                  The app is compatible with screen readers like NVDA, JAWS, and VoiceOver on macOS/iOS. All interactive elements have proper ARIA labels and semantic HTML structure. Decorative icons are hidden from screen readers.
                </p>
              </div>
              <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg p-4">
                <h3 className="font-semibold text-[#1a1a1a] mb-2">🎨 Visual Design</h3>
                <p className="text-[#666666] text-sm leading-relaxed">
                  The interface uses sufficient color contrast ratios (WCAG AA compliant). Text is readable and resizable. Focus indicators clearly show which element you're interacting with.
                </p>
              </div>
              <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg p-4">
                <h3 className="font-semibold text-[#1a1a1a] mb-2">📱 Responsive Design</h3>
                <p className="text-[#666666] text-sm leading-relaxed">
                  The app works well on desktop, tablet, and mobile devices. It supports zoom functionality and adapts to different screen sizes. Touch targets are appropriately sized for mobile users.
                </p>
              </div>
              <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg p-4">
                <h3 className="font-semibold text-[#1a1a1a] mb-2">🏷️ Proper Labeling</h3>
                <p className="text-[#666666] text-sm leading-relaxed">
                  All form inputs have associated labels. Buttons have descriptive labels. Navigation elements are properly labeled. Error messages are clear and accessible.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Mobile Accessibility</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              Spendio is fully accessible on mobile devices. Native mobile accessibility features work seamlessly:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#666666]">
              <li><strong>iOS/iPhone:</strong> Compatible with VoiceOver (Apple's screen reader)</li>
              <li><strong>Android:</strong> Compatible with TalkBack (Google's screen reader) and other Android accessibility features</li>
              <li><strong>Both platforms:</strong> Support voice control, magnification, and high contrast modes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Known Limitations</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              While we've made significant accessibility improvements, we're aware of the following areas:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#666666]">
              <li>Some third-party charting libraries may have limited accessibility features</li>
              <li>Complex data tables could be improved with additional accessibility enhancements</li>
              <li>Some custom components are continually being optimized for screen reader compatibility</li>
            </ul>
            <p className="text-[#666666] leading-relaxed mt-3">
              We are actively working to address these limitations and welcome feedback.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Testing and Validation</h2>
            <p className="text-[#666666] leading-relaxed">
              Spendio is regularly tested with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-[#666666] mt-3">
              <li>Manual accessibility testing using keyboard navigation only</li>
              <li>Screen reader testing with NVDA and JAWS (Windows)</li>
              <li>VoiceOver testing on macOS and iOS</li>
              <li>Automated accessibility scanning tools</li>
              <li>Real user testing with people with disabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Feedback and Improvements</h2>
            <p className="text-[#666666] leading-relaxed">
              We are continuously working to improve the accessibility of Spendio. If you encounter any accessibility barriers or have suggestions for improvement, please let us know. Your feedback is invaluable in helping us create a more inclusive product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Contact Us</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              If you experience any accessibility issues or have accessibility-related questions, please contact us:
            </p>
            <div className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-lg p-4">
              <p className="text-[#1a1a1a] font-semibold">Email: support@spendio.com</p>
              <p className="text-[#666666] text-sm mt-2">
                Please include "Accessibility" in the subject line so we can prioritize your request.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Additional Resources</h2>
            <p className="text-[#666666] leading-relaxed mb-3">
              For more information about web accessibility, visit:
            </p>
            <ul className="space-y-2">
              <li>
                <a href="https://www.w3.org/WAI/" target="_blank" rel="noopener noreferrer" className="text-[#1db584] hover:text-[#0f8a56] underline">
                  Web Accessibility Initiative (WAI) - W3C
                </a>
              </li>
              <li>
                <a href="https://www.w3.org/WAI/WCAG21/quickref/" target="_blank" rel="noopener noreferrer" className="text-[#1db584] hover:text-[#0f8a56] underline">
                  WCAG 2.1 Quick Reference
                </a>
              </li>
              <li>
                <a href="https://www.a11y-101.com/design" target="_blank" rel="noopener noreferrer" className="text-[#1db584] hover:text-[#0f8a56] underline">
                  A11y 101 - Accessibility Fundamentals
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
