'use client';

import Link from 'next/link';
import { Button } from '@/components/ui';
import { ArrowRight, BarChart3, Lightbulb, Target, Shield, Clock, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Discover Your Business{' '}
              <span className="text-blue-600">Energy Savings</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Get a free, personalized energy assessment in just 10 minutes.
              See how your business compares and find opportunities to save.
            </p>
            <Link href="/assessment">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Free Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="font-medium">100% Anonymous</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Zap className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Completely Free</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="font-medium">10-Minute Assessment</span>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What You&apos;ll Get
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Compare to Similar Businesses
              </h3>
              <p className="text-gray-600">
                See how your energy usage stacks up against similar businesses in your area and industry.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Identify Quick Wins
              </h3>
              <p className="text-gray-600">
                Discover no-cost and low-cost actions you can take today to start saving on energy bills.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Actionable Recommendations
              </h3>
              <p className="text-gray-600">
                Receive prioritized recommendations with estimated savings and payback periods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Enter Business Details
                </h3>
                <p className="text-gray-600">
                  Tell us about your business type, location, and square footage.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Add Your Utility Bills
                </h3>
                <p className="text-gray-600">
                  Upload a CSV or enter your monthly electricity and gas usage.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Get Your Report
                </h3>
                <p className="text-gray-600">
                  Receive instant insights, benchmarks, and savings recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Find Your Savings?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              No account needed. No email required. Just answers.
            </p>
            <Link href="/assessment">
              <Button size="lg" className="text-lg px-8 py-4">
                Start Free Assessment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
