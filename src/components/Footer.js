import React, { useState } from 'react';
import { Instagram, Facebook, Mail, Phone, MapPin, Send, X } from 'lucide-react';

const Footer = () => {
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission (you can integrate with your backend later)
    setTimeout(() => {
      alert('Thank you for your message! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setShowContactForm(false);
      setIsSubmitting(false);
    }, 1000);
  };

  const ContactForm = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Get in Touch</h3>
          <button
            onClick={() => setShowContactForm(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="your.email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors"
              placeholder="What's this about?"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none transition-colors resize-none"
              placeholder="Tell us more about your inquiry..."
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <footer className="relative mt-auto">
        {/* Main Footer */}
        <div className="backdrop-blur-md bg-white/10 border-t border-white/20 mx-4 mb-4 rounded-xl hover:bg-white/15 transition-all">
          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Company Info */}
              <div className="lg:col-span-1">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Let's Learn Together
                </h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Ready to transform your skills with our next-generation learning platform? 
                  Join thousands of learners building their future with LYNCK Academy.
                </p>
                <p className="text-gray-400 text-sm">
                  © 2024 LYNCK Academy. All rights reserved.
                </p>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Get in Touch</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Mail className="w-5 h-5 text-purple-400" />
                    <span>hello@lynckacademy.com</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Phone className="w-5 h-5 text-purple-400" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowContactForm(true)}
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Contact Us
                </button>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Explore</h4>
                <ul className="space-y-3">
                  <li>
                    <a href="/courses" className="text-gray-300 hover:text-purple-400 transition-colors">
                      Browse Courses
                    </a>
                  </li>
                  <li>
                    <a href="/become-teacher" className="text-gray-300 hover:text-purple-400 transition-colors">
                      Become a Teacher
                    </a>
                  </li>
                  <li>
                    <a href="/student" className="text-gray-300 hover:text-purple-400 transition-colors">
                      Student Dashboard
                    </a>
                  </li>
                  <li>
                    <a href="/teacher" className="text-gray-300 hover:text-purple-400 transition-colors">
                      Teacher Dashboard
                    </a>
                  </li>
                </ul>
              </div>

              {/* Connect */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
                <div className="flex space-x-4 mb-6">
                  <a
                    href="#"
                    className="bg-white/10 hover:bg-purple-600 p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow us on Instagram"
                  >
                    <Instagram className="w-6 h-6 text-white" />
                  </a>
                  <a
                    href="#"
                    className="bg-white/10 hover:bg-blue-600 p-3 rounded-lg transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow us on Facebook"
                  >
                    <Facebook className="w-6 h-6 text-white" />
                  </a>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-300 text-sm">Stay updated with our latest courses</p>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 bg-black/30 border border-white/20 rounded-l-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none"
                    />
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-4 py-2 rounded-r-lg transition-all duration-300">
                      <Send className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="backdrop-blur-md bg-white/10 border-t border-white/20 mx-4 mb-4 rounded-xl hover:bg-white/15 transition-all">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-purple-400 transition-colors">Cookie Policy</a>
              </div>
              <div className="text-sm text-gray-400">
                Made with ❤️ for learners worldwide
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Contact Form Modal */}
      {showContactForm && <ContactForm />}
    </>
  );
};

export default Footer;