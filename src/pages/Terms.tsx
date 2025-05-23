import React from "react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-950 rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4 text-pathpdf-700 dark:text-white">Terms of Use</h1>
        <p className="mb-2 text-gray-700 dark:text-gray-300"><strong>Effective Date:</strong> [Insert Date]</p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">Welcome to PathPdf! By using our website and services, you agree to these Terms of Use.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Use of Service</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>You must be at least 13 years old to use PathPdf.</li>
          <li>You agree to use PathPdf only for lawful purposes.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. Notion Integration</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>By connecting your Notion account, you grant PathPdf permission to access your Notion pages and databases as authorized by you.</li>
          <li>You may disconnect your Notion account at any time.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. Intellectual Property</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>All content generated by PathPdf (excluding your original Notion or PDF content) is the property of PathPdf.</li>
          <li>You retain ownership of your original content.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Limitation of Liability</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>PathPdf is provided "as is" without warranties of any kind.</li>
          <li>We are not liable for any damages resulting from your use of our services.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Termination</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">We may terminate or suspend your access to PathPdf at our discretion.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to Terms</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">We may update these Terms of Use from time to time. Continued use of PathPdf constitutes acceptance of the new terms.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact</h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">For questions about these Terms, contact us at:</p>
        <p className="text-gray-700 dark:text-gray-300 font-semibold">Email: nacemohamed19@gmail.com</p>
      </div>
    </div>
  );
} 