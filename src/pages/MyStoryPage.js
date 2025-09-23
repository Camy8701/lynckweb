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
import { ArrowRight, TrendingUp, Award, Users, Euro } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MyStoryPage = () => {
  return (
    <EditSystemProvider>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-900">
        <Header />
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <EditableCard
            elementId="story-hero-card"
            className="inline-block mb-8"
            allowImageEdit={false}
          >
            <EditableText
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6"
              elementId="story-hero-title"
            >
              📖 From Lost Graduate to €100K at 24
            </EditableText>
          </EditableCard>

          <EditableCard
            elementId="story-hero-subtitle-card"
            className="inline-block mb-12"
            allowImageEdit={false}
          >
            <EditableText
              className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto"
              elementId="story-hero-subtitle"
            >
              The true story of how I went from €12K debt and zero direction to building a €100K career at Google + freelancing. If I can do it, you can too.
            </EditableText>
          </EditableCard>

          {/* CTA Button */}
          <Link 
            to="/courses"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            🔥 Start Your Transformation
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <EditableCard
            elementId="timeline-title-card"
            className="text-center mb-16"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              elementId="timeline-title"
            >
              ⏱️ The Complete Journey
            </EditableText>
            <EditableText
              className="text-xl text-gray-400"
              elementId="timeline-subtitle"
            >
              Every milestone, struggle, and breakthrough
            </EditableText>
          </EditableCard>

          {/* Timeline Items */}
          <div className="space-y-12">
            {/* 2022 - The Struggle */}
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">2022</span>
              </div>
              <EditableCard
                elementId="timeline-2022-card"
                className="flex-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8"
              >
                <EditableText
                  className="text-2xl font-bold text-white mb-4"
                  elementId="timeline-2022-title"
                >
                  💸 Rock Bottom: €12K in Debt
                </EditableText>
                <EditableText
                  className="text-gray-300 leading-relaxed mb-6"
                  elementId="timeline-2022-content"
                >
                  Fresh graduate with a social work degree and zero career direction. Spent €12,000 on a business degree that gave me theory but no practical skills. Living at home, confused, and watching friends get jobs while I had nothing to show for years of studying.
                </EditableText>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">Confused</span>
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">Debt</span>
                  <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">No Direction</span>
                </div>
              </EditableCard>
            </div>

            {/* 2023 - Discovery */}
            <div className="flex flex-col md:flex-row-reverse items-start space-y-6 md:space-y-0 md:space-x-reverse md:space-x-8">
              <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">2023</span>
              </div>
              <EditableCard
                elementId="timeline-2023-card"
                className="flex-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8"
              >
                <EditableText
                  className="text-2xl font-bold text-white mb-4"
                  elementId="timeline-2023-title"
                >
                  💡 The Discovery: Google Ads
                </EditableText>
                <EditableText
                  className="text-gray-300 leading-relaxed mb-6"
                  elementId="timeline-2023-content"
                >
                  Found Google's official training resources and started learning Google Ads. Spent 6 months studying, testing, and failing. First campaign lost €200. Second campaign broke even. Third campaign made €50 profit. I was hooked.
                </EditableText>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Learning</span>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Testing</span>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">First Profits</span>
                </div>
              </EditableCard>
            </div>

            {/* 2024 - Breakthrough */}
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">2024</span>
              </div>
              <EditableCard
                elementId="timeline-2024-card"
                className="flex-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8"
              >
                <EditableText
                  className="text-2xl font-bold text-white mb-4"
                  elementId="timeline-2024-title"
                >
                  🚀 The Breakthrough: Google + €100K
                </EditableText>
                <EditableText
                  className="text-gray-300 leading-relaxed mb-6"
                  elementId="timeline-2024-content"
                >
                  Landed a role at Google in Barcelona. Suddenly managing million-euro ad accounts and learning from the best. Started freelancing on the side: €25/hour → €50/hour → €75/hour. Combined income: close to €100K annually. Life completely transformed.
                </EditableText>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Google</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">€100K</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Freelancing</span>
                </div>
              </EditableCard>
            </div>
          </div>
        </div>
      </section>

      {/* Key Lessons Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <EditableCard
            elementId="lessons-title-card"
            className="text-center mb-16"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              elementId="lessons-title"
            >
              🎯 What I Learned the Hard Way
            </EditableText>
            <EditableText
              className="text-xl text-gray-400"
              elementId="lessons-subtitle"
            >
              The lessons that changed everything
            </EditableText>
          </EditableCard>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Lesson 1 */}
            <EditableCard
              elementId="lesson-1-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-xl font-bold text-white mb-4"
                elementId="lesson-1-title"
              >
                Skills > Degrees
              </EditableText>
              <EditableText
                className="text-gray-300 leading-relaxed"
                elementId="lesson-1-content"
              >
                My €12K business degree got me nowhere. 6 months of practical Google Ads skills got me a job at Google. The market rewards results, not certificates.
              </EditableText>
            </EditableCard>

            {/* Lesson 2 */}
            <EditableCard
              elementId="lesson-2-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-xl font-bold text-white mb-4"
                elementId="lesson-2-title"
              >
                Learn from the Source
              </EditableText>
              <EditableText
                className="text-gray-300 leading-relaxed"
                elementId="lesson-2-content"
              >
                I learned directly from Google's training materials, not some random course. Go to the source. Learn from companies that actually use these skills.
              </EditableText>
            </EditableCard>

            {/* Lesson 3 */}
            <EditableCard
              elementId="lesson-3-card"
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-6">
                <Euro className="w-8 h-8 text-white" />
              </div>
              <EditableText
                className="text-xl font-bold text-white mb-4"
                elementId="lesson-3-title"
              >
                Test with Real Money
              </EditableText>
              <EditableText
                className="text-gray-300 leading-relaxed"
                elementId="lesson-3-content"
              >
                Theory means nothing. I lost €200 on my first campaign but learned more than any course taught me. Real testing = real learning.
              </EditableText>
            </EditableCard>
          </div>
        </div>
      </section>

      {/* The Numbers Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <EditableCard
            elementId="numbers-card"
            className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20 rounded-2xl p-8 md:p-12"
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
              elementId="numbers-title"
            >
              📊 The Real Numbers
            </EditableText>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <EditableText
                  className="text-4xl md:text-5xl font-bold text-green-400 mb-2"
                  elementId="income-before"
                >
                  €0
                </EditableText>
                <EditableText
                  className="text-gray-300 text-lg"
                  elementId="income-before-label"
                >
                  Monthly Income (Before)
                </EditableText>
              </div>
              
              <div className="text-center">
                <EditableText
                  className="text-4xl md:text-5xl font-bold text-green-400 mb-2"
                  elementId="income-after"
                >
                  €8,300
                </EditableText>
                <EditableText
                  className="text-gray-300 text-lg"
                  elementId="income-after-label"
                >
                  Monthly Income (Now)
                </EditableText>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <EditableText
                  className="text-2xl font-bold text-blue-400 mb-1"
                  elementId="stat-campaigns"
                >
                  200+
                </EditableText>
                <EditableText
                  className="text-gray-400 text-sm"
                  elementId="stat-campaigns-label"
                >
                  Campaigns
                </EditableText>
              </div>
              
              <div>
                <EditableText
                  className="text-2xl font-bold text-purple-400 mb-1"
                  elementId="stat-spend"
                >
                  €2M+
                </EditableText>
                <EditableText
                  className="text-gray-400 text-sm"
                  elementId="stat-spend-label"
                >
                  Ad Spend
                </EditableText>
              </div>
              
              <div>
                <EditableText
                  className="text-2xl font-bold text-pink-400 mb-1"
                  elementId="stat-clients"
                >
                  50+
                </EditableText>
                <EditableText
                  className="text-gray-400 text-sm"
                  elementId="stat-clients-label"
                >
                  Clients
                </EditableText>
              </div>
              
              <div>
                <EditableText
                  className="text-2xl font-bold text-green-400 mb-1"
                  elementId="stat-rate"
                >
                  €75/hr
                </EditableText>
                <EditableText
                  className="text-gray-400 text-sm"
                  elementId="stat-rate-label"
                >
                  Rate
                </EditableText>
              </div>
            </div>
          </EditableCard>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <EditableCard
            elementId="final-cta-card"
            className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 md:p-12"
            allowImageEdit={false}
          >
            <EditableText
              className="text-3xl md:text-4xl font-bold text-white mb-6"
              elementId="final-cta-title"
            >
              🚀 Your Turn to Transform
            </EditableText>
            
            <EditableText
              className="text-xl text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto"
              elementId="final-cta-content"
            >
              I went from €12K debt to €100K income in 2 years. Not because I'm special, but because I learned skills that businesses desperately need. The same path is open to you.
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
                to="/about"
                className="inline-flex items-center px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-all duration-300"
              >
                Learn About Our Method
              </Link>
            </div>
            
            <EditableText
              className="text-sm text-gray-400 mt-6"
              elementId="final-cta-guarantee"
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

export default MyStoryPage;