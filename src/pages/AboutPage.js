import React from 'react';
import { Link } from 'react-router-dom';
import {
  EditSystemProvider,
  EditableCard,
  EditableText,
  GlobalUploadModal,
  GlobalColorPicker,
  GlobalTextPositioner
} from '../components/EditSystem';
import { ArrowRight, Award, TrendingUp, Users, Globe, CheckCircle, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <EditSystemProvider>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
        <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <EditableCard
            elementId="about-hero-card"
            className="inline-block mb-8"
            allowImageEdit={false}
          >
            <EditableText
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6"
              elementId="about-hero-title"
            >
              🌍 Who We Are
            </EditableText>
          </EditableCard>

          <EditableCard
            elementId="about-hero-subtitle-card"
            className="inline-block mb-12"
            allowImageEdit={false}
          >
            <EditableText
              className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              elementId="about-hero-subtitle"
            >
              We're an online learning platform teaching digital marketing with a sharp focus on Google Ads, AI, and digital products. Unlike massive academies that push theory, we teach only what we've proven in real campaigns.
            </EditableText>
          </EditableCard>

          {/* CTA Button */}
          <Link
            to="/courses"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            🔥 Start Learning Today
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Our Differentiation Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <EditableCard
            elementId="differentiation-title-card"
            className="text-center mb-16"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              elementId="differentiation-title"
            >
              🎯 Why Lynck is Different
            </EditableText>
            <EditableText
              className="text-xl text-gray-400"
              elementId="differentiation-subtitle"
            >
              Real experience. Real results. Real skills.
            </EditableText>
          </EditableCard>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Ex-Google Team */}
            <EditableCard
              elementId="diff-1-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-xl font-bold text-white mb-4"
                elementId="diff-1-title"
              >
                Ex-Google Specialists
              </EditableText>
              <EditableText
                className="text-gray-300 leading-relaxed"
                elementId="diff-1-content"
              >
                Our team is made up of ex-Google specialists who've managed millions in ad spend and generated millions in revenue for clients. We've been rewarded as top performers at Google.
              </EditableText>
            </EditableCard>

            {/* Practical Focus */}
            <EditableCard
              elementId="diff-2-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-xl font-bold text-white mb-4"
                elementId="diff-2-title"
              >
                No Theory, Just Results
              </EditableText>
              <EditableText
                className="text-gray-300 leading-relaxed"
                elementId="diff-2-content"
              >
                This isn't just another course. It's a practical, tested foundation for a digital career. We teach only what we've proven in real campaigns with real money.
              </EditableText>
            </EditableCard>

            {/* Proven Track Record */}
            <EditableCard
              elementId="diff-3-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-xl font-bold text-white mb-4"
                elementId="diff-3-title"
              >
                Thriving Freelance Network
              </EditableText>
              <EditableText
                className="text-gray-300 leading-relaxed"
                elementId="diff-3-content"
              >
                We've built thriving freelance businesses outside of Google, helping students reach €40-75/hour rates. Our methods work in the real world.
              </EditableText>
            </EditableCard>
          </div>
        </div>
      </section>

      {/* Proof & Receipts Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <EditableCard
            elementId="proof-title-card"
            className="text-center mb-16"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              elementId="proof-title"
            >
              💡 Why Trust Us?
            </EditableText>
            <EditableText
              className="text-xl text-gray-400 mb-8"
              elementId="proof-subtitle"
            >
              A lot of people can talk about digital marketing. Fewer have the receipts.
            </EditableText>
          </EditableCard>

          <EditableCard
            elementId="proof-stats-card"
            className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20 rounded-2xl p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <EditableText
                    className="text-lg text-gray-300"
                    elementId="proof-1"
                  >
                    Managed €millions in ad campaigns at Google
                  </EditableText>
                </div>

                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <EditableText
                    className="text-lg text-gray-300"
                    elementId="proof-2"
                  >
                    Generated millions in revenue for clients worldwide
                  </EditableText>
                </div>

                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                  <EditableText
                    className="text-lg text-gray-300"
                    elementId="proof-3"
                  >
                    Freelance earnings: €0 → €75/hour within 12 months
                  </EditableText>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Award className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <EditableText
                    className="text-lg text-gray-300"
                    elementId="proof-4"
                  >
                    Multiple awards inside Google: Best Teammate, Best Employee
                  </EditableText>
                </div>

                <div className="flex items-center space-x-4">
                  <Star className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  <EditableText
                    className="text-lg text-gray-300"
                    elementId="proof-5"
                  >
                    500+ successful students building careers
                  </EditableText>
                </div>

                <div className="flex items-center space-x-4">
                  <Globe className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <EditableText
                    className="text-lg text-gray-300"
                    elementId="proof-6"
                  >
                    Working with clients across Europe and beyond
                  </EditableText>
                </div>
              </div>
            </div>

            <EditableText
              className="text-center text-gray-300 text-lg font-medium"
              elementId="proof-conclusion"
            >
              We don't just teach — we show you what we've done, and how you can do it too.
            </EditableText>
          </EditableCard>
        </div>
      </section>

      {/* Our Method Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <EditableCard
            elementId="method-title-card"
            className="text-center mb-16"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              elementId="method-title"
            >
              🚀 Our Teaching Method
            </EditableText>
            <EditableText
              className="text-xl text-gray-400"
              elementId="method-subtitle"
            >
              Learn. Test. Earn. Repeat.
            </EditableText>
          </EditableCard>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <EditableCard
              elementId="method-1-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <EditableText
                className="text-lg font-bold text-white mb-3"
                elementId="method-1-title"
              >
                Learn Real Skills
              </EditableText>
              <EditableText
                className="text-gray-300 text-sm leading-relaxed"
                elementId="method-1-content"
              >
                Master Google Ads and AI tools using the exact workflows we use at Google.
              </EditableText>
            </EditableCard>

            {/* Step 2 */}
            <EditableCard
              elementId="method-2-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <EditableText
                className="text-lg font-bold text-white mb-3"
                elementId="method-2-title"
              >
                Test with Real Money
              </EditableText>
              <EditableText
                className="text-gray-300 text-sm leading-relaxed"
                elementId="method-2-content"
              >
                Practice with actual campaigns. Theory means nothing - real testing = real learning.
              </EditableText>
            </EditableCard>

            {/* Step 3 */}
            <EditableCard
              elementId="method-3-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <EditableText
                className="text-lg font-bold text-white mb-3"
                elementId="method-3-title"
              >
                Start Earning
              </EditableText>
              <EditableText
                className="text-gray-300 text-sm leading-relaxed"
                elementId="method-3-content"
              >
                Land freelance clients or get hired. Start charging €40-75/hour for your skills.
              </EditableText>
            </EditableCard>

            {/* Step 4 */}
            <EditableCard
              elementId="method-4-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">4</span>
              </div>
              <EditableText
                className="text-lg font-bold text-white mb-3"
                elementId="method-4-title"
              >
                Scale & Grow
              </EditableText>
              <EditableText
                className="text-gray-300 text-sm leading-relaxed"
                elementId="method-4-content"
              >
                Build your reputation, increase rates, create digital products for passive income.
              </EditableText>
            </EditableCard>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <EditableCard
            elementId="about-final-cta-card"
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 md:p-12"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              elementId="about-final-cta-title"
            >
              🎯 Ready to Join Our Success Stories?
            </EditableText>

            <EditableText
              className="text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto"
              elementId="about-final-cta-content"
            >
              This isn't just another course. It's a practical, tested foundation for a digital career. Learn from people who've actually done what they teach.
            </EditableText>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/courses"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                🔥 Start Learning Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>

              <Link
                to="/my-story"
                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Read My Full Story
              </Link>
            </div>

            <EditableText
              className="text-sm text-gray-400 mt-6"
              elementId="about-final-cta-guarantee"
            >
              💰 30-day money-back guarantee • ⭐ 500+ successful students
            </EditableText>
          </EditableCard>
        </div>
      </section>

      <Footer />
      </div>

      {/* Global Edit System Components */}
      <GlobalUploadModal />
      <GlobalColorPicker />
      <GlobalTextPositioner />
    </EditSystemProvider>
  );
};

export default AboutPage;