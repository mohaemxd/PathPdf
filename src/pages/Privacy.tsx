import React from "react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-950 rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4 text-pathpdf-700 dark:text-white">Privacy Policy</h1>
        <p className="mb-2 text-gray-700 dark:text-gray-300"><strong>Effective Date:</strong> [Insert Date]</p>
        <p className="mb-4 text-gray-700 dark:text-gray-300">PathPdf ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and services, including our Notion integration.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li><strong>Personal Information:</strong> When you sign up or use our services, we may collect your name, email address, and other contact details.</li>
          <li><strong>Notion Integration Data:</strong> If you connect your Notion account, we access your Notion pages and databases only with your explicit permission. We use OAuth 2.0 for secure authentication and only request the minimum permissions necessary (<code>pages.read</code>, <code>databases.read</code>).</li>
          <li><strong>Usage Data:</strong> We may collect information about how you use our website and services for analytics and improvement.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>To provide and improve our services.</li>
          <li>To generate roadmaps from your Notion pages or PDF files.</li>
          <li>To communicate with you about updates or support.</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">3. How We Share Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li><strong>Third-Party Services:</strong> We may use third-party services (such as Notion and AI providers) to process your data, but we do not sell or share your personal information with advertisers.</li>
          <li><strong>Legal Requirements:</strong> We may disclose your information if required by law.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">4. Data Security</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">We use industry-standard security measures to protect your data, including encryption of sensitive information.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">5. Your Choices</h2>
        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 mb-4">
          <li>You can disconnect your Notion account at any time.</li>
          <li>You may request deletion of your data by contacting us at nacemohamed19@gmail.com.</li>
        </ul>
        <h2 className="text-xl font-semibold mt-6 mb-2">6. Changes to This Policy</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">We may update this Privacy Policy from time to time. We will notify you of any significant changes.</p>
        <h2 className="text-xl font-semibold mt-6 mb-2">7. Contact Us</h2>
        <p className="mb-2 text-gray-700 dark:text-gray-300">If you have questions about this Privacy Policy, contact us at:</p>
        <p className="text-gray-700 dark:text-gray-300 font-semibold">Email: nacemohamed19@gmail.com</p>
      </div>
    </div>
  );
} 