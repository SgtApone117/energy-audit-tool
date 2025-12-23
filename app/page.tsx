'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { 
  ArrowRight, 
  Building2, 
  ClipboardCheck, 
  BarChart3, 
  Camera,
  FileText,
  Zap,
  Users,
  Shield
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Energy Audit Tool</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Energy Assessment{' '}
              <span className="text-blue-600">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600">
              Choose your role to get started with the right tools for your needs.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Customer View */}
            <Link href="/assessment" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Building2 className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Business Owner</h2>
                    <p className="text-blue-600 font-medium">Self-Assessment Tool</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Get a free, personalized energy assessment in just 10 minutes. 
                  See how your business compares and find opportunities to save.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-700">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <span>Compare to similar businesses</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <Zap className="w-5 h-5 text-blue-500" />
                    <span>Identify quick wins & savings</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span>Get actionable recommendations</span>
                  </li>
                </ul>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="w-4 h-4" />
                    <span>No account required</span>
                  </div>
                  <Button className="group-hover:bg-blue-700">
                    Start Assessment
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Link>

            {/* Auditor View */}
            <Link href="/auditor" className="group">
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100 hover:border-green-500 hover:shadow-xl transition-all h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                    <ClipboardCheck className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Energy Auditor</h2>
                    <p className="text-green-600 font-medium">On-Site Audit Tool</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Professional on-site audit tool for energy auditors and contractors. 
                  Document equipment, capture photos, and generate reports.
                </p>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-700">
                    <Camera className="w-5 h-5 text-green-500" />
                    <span>Photo documentation with categories</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <ClipboardCheck className="w-5 h-5 text-green-500" />
                    <span>Equipment inventory tracking</span>
                  </li>
                  <li className="flex items-center gap-3 text-gray-700">
                    <FileText className="w-5 h-5 text-green-500" />
                    <span>Professional audit reports</span>
                  </li>
                </ul>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>For professionals</span>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Open Auditor
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Choose the Right Tool for You
          </h2>
          
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-blue-600">Business Owner</th>
                  <th className="text-center py-4 px-4 font-semibold text-green-600">Energy Auditor</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Energy benchmarking</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Savings recommendations</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Utility bill analysis</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Photo documentation</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Detailed equipment inventory</td>
                  <td className="py-3 px-4 text-center">Basic</td>
                  <td className="py-3 px-4 text-center">Detailed</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Multiple audit management</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">Export/Import audits</td>
                  <td className="py-3 px-4 text-center">—</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">AI-powered summary</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">Coming Soon</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>Energy Audit Tool — Free energy assessment for businesses</p>
        </div>
      </footer>
    </div>
  );
}
