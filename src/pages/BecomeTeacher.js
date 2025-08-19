import React, { useState } from 'react';
import { useAuth } from '../contexts/Auth0Context';
import { ChevronLeft, Upload, CheckCircle, AlertCircle, User, FileText, Link as LinkIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const BecomeTeacher = () => {
  const { user, profile, getSupabaseClient } = useAuth();
  const navigate = useNavigate();
  const supabase = getSupabaseClient();
  
  const [formData, setFormData] = useState({
    reason: '',
    qualifications: '',
    portfolio_url: '',
    additional_info: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.reason.trim() || !formData.qualifications.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from('role_requests')
        .select('*')
        .eq('user_id', profile.id)
        .eq('requested_role', 'teacher')
        .in('status', ['pending', 'under_review'])
        .single();

      if (existingRequest) {
        setError('You already have a pending teacher application. Please wait for admin review.');
        return;
      }

      // Create role request
      const { error: insertError } = await supabase
        .from('role_requests')
        .insert([{
          user_id: profile.id,
          requested_role: 'teacher',
          current_role: profile.role,
          reason: formData.reason.trim(),
          qualifications: formData.qualifications.trim(),
          portfolio_url: formData.portfolio_url.trim() || null,
          additional_info: {
            additional_info: formData.additional_info.trim(),
            application_date: new Date().toISOString(),
            user_email: user.email,
            user_name: user.name
          }
        }]);

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/student');
      }, 3000);

    } catch (err) {
      console.error('Error submitting teacher application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">
                Application Submitted Successfully! 🎉
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Thank you for applying to become a teacher on Lynck Academy. Our admin team will review your application and get back to you soon.
              </p>
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-300 mb-2">What happens next?</h3>
                <ul className="text-blue-200 text-sm space-y-1 text-left">
                  <li>• Admin review (usually within 2-3 business days)</li>
                  <li>• Email verification may be required</li>
                  <li>• You'll receive a notification with the decision</li>
                  <li>• If approved, you'll gain access to teacher features</li>
                </ul>
              </div>
              <p className="text-gray-400 text-sm">
                Redirecting to dashboard in a few seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link 
              to="/student" 
              className="flex items-center text-white hover:text-blue-400 transition-colors mr-4"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </Link>
          </div>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Information */}
            <div className="space-y-6">
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <h1 className="text-3xl font-bold text-white mb-4">
                  Become a Teacher 👩‍🏫
                </h1>
                <p className="text-gray-300 mb-6">
                  Join our community of educators and share your knowledge with students worldwide. 
                  Create engaging courses and help others learn new skills.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Benefits of Teaching:</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      Create and manage your own courses
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      Earn revenue from course sales
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      Build your professional reputation
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      Access to teacher analytics
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                      Connect with students globally
                    </li>
                  </ul>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Application Process:</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">1</div>
                    <div>
                      <strong>Submit Application</strong>
                      <p className="text-sm text-gray-400">Fill out the form with your qualifications and teaching goals</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">2</div>
                    <div>
                      <strong>Admin Review</strong>
                      <p className="text-sm text-gray-400">Our team reviews your application (2-3 business days)</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">3</div>
                    <div>
                      <strong>Verification</strong>
                      <p className="text-sm text-gray-400">Email verification and possible additional requirements</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">4</div>
                    <div>
                      <strong>Approval</strong>
                      <p className="text-sm text-gray-400">Get approved and start creating courses!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Application Form */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Teacher Application</h2>
              
              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <span className="text-red-300">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Reason */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Why do you want to become a teacher? *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Tell us about your passion for teaching and what motivates you to share knowledge..."
                    className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none"
                    rows="4"
                    required
                  />
                </div>

                {/* Qualifications */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Your Qualifications & Experience *
                  </label>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    placeholder="Describe your educational background, work experience, certifications, and expertise in your field..."
                    className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none"
                    rows="4"
                    required
                  />
                </div>

                {/* Portfolio URL */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Portfolio/CV URL (optional)
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="portfolio_url"
                      value={formData.portfolio_url}
                      onChange={handleInputChange}
                      placeholder="https://your-portfolio.com or LinkedIn profile"
                      className="w-full pl-10 pr-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-white font-medium mb-2">
                    Additional Information (optional)
                  </label>
                  <textarea
                    name="additional_info"
                    value={formData.additional_info}
                    onChange={handleInputChange}
                    placeholder="Any other information you'd like to share about your teaching approach, course ideas, or background..."
                    className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none resize-none"
                    rows="3"
                  />
                </div>

                {/* Current Profile Info */}
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-300 mb-2">Application will be submitted for:</h4>
                  <div className="flex items-center text-blue-200">
                    <User className="w-4 h-4 mr-2" />
                    {user?.name} ({user?.email})
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Submitting Application...' : 'Submit Teacher Application'}
                </button>

                <p className="text-gray-400 text-sm text-center">
                  By submitting this application, you agree that all information provided is accurate and complete.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeTeacher;