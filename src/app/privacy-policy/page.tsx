import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col p-6">
      <Link 
        href="/signup"
        className="flex items-center gap-2 text-gray-600 mb-8 hover:text-primary transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Urban Auto Privacy Policy</h1>
      
      <div className="space-y-6 text-gray-600 text-sm leading-relaxed overflow-y-auto pb-10">
        <section>
          <p className="font-semibold text-gray-900">Effective date: January 22, 2026</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">1. What data we collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account info:</strong> name, email, phone number</li>
            <li><strong>Booking info:</strong> vehicle details, service requests, address</li>
            <li><strong>Location data:</strong> only if user allows via device permissions</li>
            <li><strong>Device/log data:</strong> for security and debugging purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">2. Why we collect it</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and manage your service bookings</li>
            <li>To assign service providers or mechanics to your request</li>
            <li>To send real-time booking updates and notifications</li>
            <li>For fraud prevention, security, and customer support</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">3. How we share data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>With service partners/garages only to complete the booking</li>
            <li>With payment providers to process secure transactions</li>
            <li>We <strong>never sell</strong> your personal data to third parties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">4. Data retention</h2>
          <p>We keep your booking history for support and accounting purposes. Users can request data deletion at any time through our support channels.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">5. Security</h2>
          <p>We implement reasonable security measures to protect your information from unauthorized access or disclosure.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">6. Children</h2>
          <p>Urban Auto is not intended for children under 13. We provide services to a general audience.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">7. User rights</h2>
          <p>You have the right to request access, correction, or deletion of your personal data.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">8. Location Permission Disclosure</h2>
          <p>We request location only to auto-fill your address for pickup/service convenience. You can use the app without granting location access by manually entering your address.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">9. Contact</h2>
          <p>Support email: <a href="mailto:theurbanauto@gmail.com" className="text-primary hover:underline">theurbanauto@gmail.com</a></p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">10. Updates to policy</h2>
          <p>We may update this policy from time to time. Significant changes will be notified through the app.</p>
        </section>
      </div>
    </div>
  );
}
