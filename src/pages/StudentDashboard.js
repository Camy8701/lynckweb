import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/Auth0Context';
import { 
  BookOpen, 
  Trophy, 
  Flame, 
  Clock, 
  Play, 
  Star, 
  Award, 
  MessageCircle, 
  User,
  CheckCircle,
  LayoutDashboard,
  Target,
  Gift
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Student statistics - using real data
  const stats = {
    coursesEnrolled: 0,       // Will be fetched from enrollments table
    coursesCompleted: 0,      // Will be calculated from progress
    hoursLearned: 0,          // Will be calculated from lesson completions
    learningStreak: 0,        // Will be calculated from daily activity
    certificatesEarned: 0,    // Will be fetched from certificates table
    currentLevel: 'Beginner', // Default level for new users
    xpPoints: 100,            // Starting points for new users
    nextLevelXP: 500          // Next level threshold
  };

  // Real course data - fetch from Supabase in the future
  // For now, showing empty state since no courses are enrolled yet
  const courses = [];

  // Achievements data - available achievements for students
  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first lesson', icon: '👶', earned: false },
    { id: 2, title: 'Fast Learner', description: 'Complete 3 lessons in one day', icon: '🚀', earned: false },
    { id: 3, title: 'Consistent Student', description: '7-day learning streak', icon: '🔥', earned: false },
    { id: 4, title: 'Course Finisher', description: 'Complete your first course', icon: '🏆', earned: false },
    { id: 5, title: 'Night Owl', description: 'Learn after 10 PM', icon: '🦉', earned: false },
    { id: 6, title: 'Weekend Warrior', description: 'Learn on weekends', icon: '⚔️', earned: false }
  ];

  // Messages data - will be populated when student enrolls in courses
  const conversations = [];

  // Certificates - will be populated when student completes courses
  const certificates = [];

  const Dashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/20 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || profile?.full_name || 'Student'}! 👋
            </h1>
            <p className="text-gray-300">Ready to continue your learning journey?</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">Current Level</div>
            <div className="text-xl font-bold text-blue-400">{stats.currentLevel}</div>
            <div className="text-xs text-gray-400">{stats.xpPoints} / {stats.nextLevelXP} XP</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Progress to next level</span>
            <span>{Math.round((stats.xpPoints / stats.nextLevelXP) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
              style={{ width: `${(stats.xpPoints / stats.nextLevelXP) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Courses Enrolled</p>
              <p className="text-2xl font-bold text-white">{stats.coursesEnrolled}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Trophy className="w-6 h-6 text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Completed</p>
              <p className="text-2xl font-bold text-white">{stats.coursesCompleted}</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Learning Streak</p>
              <p className="text-2xl font-bold text-white">{stats.learningStreak} days</p>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl">
          <div className="flex items-center">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Hours Learned</p>
              <p className="text-2xl font-bold text-white">{stats.hoursLearned}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Continue Learning</h2>
        <div className="space-y-4">
          {courses.length > 0 ? (
            courses.map(course => (
              <div key={course.id} className="bg-black/20 border border-white/10 rounded-lg p-4 hover:bg-black/30 transition-colors">
                <div className="flex items-start space-x-4">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-20 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{course.title}</h3>
                        <p className="text-gray-300 text-sm">by {course.instructor}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-300">{course.progress}% complete</div>
                        <div className="text-xs text-gray-400">{course.completedLessons}/{course.totalLessons} lessons</div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm text-blue-400">Next: {course.nextLesson}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 mr-4">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        <Play className="w-4 h-4" />
                        <span>Continue</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
              <p className="text-gray-400 mb-6">Start your learning journey by exploring available courses</p>
              <button 
                onClick={() => window.location.href = '/courses'}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const Achievements = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Achievements & Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(achievement => (
            <div key={achievement.id} className={`p-4 rounded-lg border transition-all ${
              achievement.earned 
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30' 
                : 'bg-black/20 border-white/10 opacity-60'
            }`}>
              <div className="text-center">
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <h3 className="text-white font-semibold mb-1">{achievement.title}</h3>
                <p className="text-gray-300 text-sm">{achievement.description}</p>
                {achievement.earned && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Earned
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Certificates</h2>
        <div className="space-y-4">
          {certificates.map(cert => (
            <div key={cert.id} className="bg-black/20 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-500/20 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{cert.courseName}</h3>
                    <p className="text-gray-300 text-sm">by {cert.instructor}</p>
                    <p className="text-gray-400 text-xs">Issued: {new Date(cert.issuedDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Download
                  </button>
                  <p className="text-gray-400 text-xs mt-1">ID: {cert.certificateId}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Messages = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Conversations</h3>
        <div className="space-y-3">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setSelectedConversation(conv)}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedConversation?.id === conv.id 
                  ? 'bg-blue-600/20 border border-blue-500/30' 
                  : 'bg-black/20 border border-white/10 hover:bg-black/30'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <img 
                    src={conv.teacherAvatar} 
                    alt={conv.teacherName}
                    className="w-10 h-10 rounded-full"
                  />
                  {conv.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-white font-medium text-sm truncate">{conv.teacherName}</h4>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mb-1">{conv.courseName}</p>
                  <p className="text-gray-300 text-sm truncate">{conv.lastMessage}</p>
                  <p className="text-gray-500 text-xs mt-1">{conv.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <img 
                  src={selectedConversation.teacherAvatar} 
                  alt={selectedConversation.teacherName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="text-white font-semibold">{selectedConversation.teacherName}</h3>
                  <p className="text-gray-400 text-sm">{selectedConversation.courseName}</p>
                </div>
                <div className="ml-auto">
                  <div className={`flex items-center space-x-1 text-sm ${
                    selectedConversation.isOnline ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      selectedConversation.isOnline ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <span>{selectedConversation.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Start a conversation with {selectedConversation.teacherName}</p>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                  Send Message
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const Profile = () => (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Student Profile</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <img 
              src={user?.picture || profile?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face'} 
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h3 className="text-xl font-semibold text-white">{user?.name || profile?.full_name || 'Student Name'}</h3>
              <p className="text-gray-300">{user?.email || profile?.email || 'student@example.com'}</p>
              <p className="text-blue-400 text-sm">{stats.currentLevel} Level</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Learning Goals</label>
              <textarea 
                rows={3}
                placeholder="What do you want to achieve?"
                className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">Learning Statistics</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{stats.coursesCompleted}</div>
              <div className="text-sm text-gray-300">Courses Completed</div>
            </div>
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.hoursLearned}h</div>
              <div className="text-sm text-gray-300">Hours Learned</div>
            </div>
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-400">{stats.certificatesEarned}</div>
              <div className="text-sm text-gray-300">Certificates</div>
            </div>
            <div className="bg-black/20 border border-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{stats.learningStreak}</div>
              <div className="text-sm text-gray-300">Day Streak</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-white font-semibold">Premium Student</h5>
                <p className="text-gray-300 text-sm">Access to all courses + messaging</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-400">$29</div>
                <div className="text-xs text-gray-400">/month</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Manage Subscription
              </button>
            </div>
          </div>

          {/* Role Switching Section */}
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h5 className="text-white font-semibold">Want to Teach?</h5>
                <p className="text-gray-300 text-sm">Share your knowledge and earn money</p>
              </div>
              <div className="text-2xl">👩‍🏫</div>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Apply to become a teacher and create your own courses. Help others learn while building your reputation.
            </p>
            <Link 
              to="/become-teacher"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors inline-block text-center"
            >
              Apply to Become Teacher
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex space-x-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Save Changes
          </button>
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              
              <button
                onClick={() => setActiveTab('achievements')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'achievements'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Achievements</span>
              </button>
              
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'messages'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Messages</span>
              </button>
              
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'achievements' && <Achievements />}
          {activeTab === 'messages' && <Messages />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;