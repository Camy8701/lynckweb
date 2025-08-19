import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCreationWizard from '../components/CourseCreationWizard';
import { useAuth } from '../contexts/Auth0Context';
import { coursesService } from '../services/coursesService';
import { messagingService } from '../services/messagingService';
import { 
  LayoutDashboard, 
  BookOpen, 
  Plus, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Settings, 
  Menu,
  X,
  DollarSign,
  TrendingUp,
  Award,
  Play,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Copy,
  MoreVertical,
  Star,
  Calendar,
  Clock,
  Send,
  Home,
  ArrowLeft
} from 'lucide-react';

const TeacherDashboard = () => {
  const { user, profile, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCourseWizard, setShowCourseWizard] = useState(false);
  
  // Memoize the close callback to prevent CourseCreationWizard re-renders
  const handleCloseCourseWizard = useCallback(() => {
    setShowCourseWizard(false);
  }, []);
  
  // Data states
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Development mode - bypass auth temporarily
  const [devMode, setDevMode] = useState(true);
  const [mockUser] = useState({
    id: 'dev-user',
    name: 'Development Teacher',
    email: 'teacher@dev.com',
    role: 'teacher',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
  });

  useEffect(() => {
    if (devMode) {
      // In dev mode, skip database calls and set default empty data
      setLoading(false);
      setCourses([]);
      setAnalytics({
        totalRevenue: 0,
        totalStudents: 0,
        averageCompletion: 0,
        coursesCount: 0
      });
      setConversations([]);
      setUnreadCount(0);
    } else if (user && profile) {
      // Allow access if user exists, even if not confirmed as teacher yet
      if (isTeacher || profile.user_type === 'teacher' || user.role === 'teacher') {
        loadTeacherData();
      }
    } else if (user && !profile) {
      // User exists but profile not loaded yet, still allow access with defaults
      setLoading(false);
      setCourses([]);
      setAnalytics({
        totalRevenue: 0,
        totalStudents: 0,
        averageCompletion: 0,
        coursesCount: 0
      });
      setConversations([]);
      setUnreadCount(0);
    }
  }, [user, profile, isTeacher, devMode]);

  const loadTeacherData = async () => {
    setLoading(true);
    try {
      // Load courses with fallback
      const { data: coursesData, error: coursesError } = await coursesService.getCoursesByTeacher(user.id);
      if (coursesData) {
        setCourses(coursesData);
      } else if (coursesError) {
        console.log('Courses table not ready yet, using empty state');
        setCourses([]);
      }

      // Load analytics with fallback
      const { data: analyticsData, error: analyticsError } = await coursesService.getCourseAnalytics(user.id);
      if (analyticsData) {
        setAnalytics(analyticsData);
      } else if (analyticsError) {
        console.log('Analytics not available yet, using defaults');
        setAnalytics({
          totalRevenue: 0,
          totalStudents: 0,
          averageCompletion: 0,
          coursesCount: 0
        });
      }

      // Load conversations with fallback
      const { data: conversationsData, error: conversationsError } = await messagingService.getConversations(user.id);
      if (conversationsData) {
        setConversations(conversationsData);
      } else if (conversationsError) {
        console.log('Conversations table not ready yet, using empty state');
        setConversations([]);
      }

      // Load unread count with fallback
      const { data: unreadData, error: unreadError } = await messagingService.getUnreadCount(user.id);
      if (typeof unreadData === 'number') {
        setUnreadCount(unreadData);
      } else if (unreadError) {
        console.log('Messages table not ready yet, setting unread count to 0');
        setUnreadCount(0);
      }
    } catch (error) {
      console.log('Database not ready yet, using fallback data:', error.message);
      // Set fallback data so dashboard still works
      setCourses([]);
      setAnalytics({
        totalRevenue: 0,
        totalStudents: 0,
        averageCompletion: 0,
        coursesCount: 0
      });
      setConversations([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const sidebarItems = [
    { id: 'home', label: 'Back to Home', icon: Home, isNavigation: true, href: '/' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'create', label: 'Create Course', icon: Plus },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const DashboardOverview = () => {
    const metrics = [
      { 
        label: 'Total Revenue', 
        value: analytics ? `$${analytics.totalRevenue.toLocaleString()}` : '$0', 
        change: '+12%', 
        icon: DollarSign, 
        color: 'green' 
      },
      { 
        label: 'Active Students', 
        value: analytics ? analytics.totalStudents.toString() : '0', 
        change: '+8%', 
        icon: Users, 
        color: 'blue' 
      },
      { 
        label: 'Course Completion Rate', 
        value: analytics ? `${analytics.averageCompletion}%` : '0%', 
        change: '+5%', 
        icon: Award, 
        color: 'purple' 
      },
      { 
        label: 'Unread Messages', 
        value: unreadCount.toString(), 
        change: unreadCount > 0 ? '+' + unreadCount : '0', 
        icon: MessageSquare, 
        color: 'red' 
      },
    ];

    const recentActivity = [
      { type: 'enrollment', student: 'Sarah Chen', course: 'Web Development Mastery', time: '2 hours ago', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b25b3c55?w=32&h=32&fit=crop&crop=face' },
      { type: 'message', student: 'Marcus Rodriguez', course: 'Data Science with Python', time: '4 hours ago', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { type: 'completion', student: 'Emma Thompson', course: 'Digital Marketing Strategy', time: '6 hours ago', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
      { type: 'enrollment', student: 'David Park', course: 'Web Development Mastery', time: '1 day ago', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&crop=face' },
    ];

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={(devMode ? mockUser?.avatar : user?.avatar) || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face"} 
              alt="Teacher" 
              className="w-16 h-16 rounded-full border-3 border-white/30"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {(devMode ? mockUser?.name?.split(' ')[0] : user?.name?.split(' ')[0]) || 'Teacher'}!
              </h1>
              <p className="text-gray-300">Here's what's happening with your courses today.</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowCourseWizard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
            <button className="backdrop-blur-md bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors hover:bg-white/20 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>View Messages</span>
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="backdrop-blur-md bg-white/10 border border-white/20 p-6 rounded-xl shadow-sm hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-lg bg-${metric.color}-500/20`}>
                      <Icon className={`w-6 h-6 text-${metric.color}-400`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300">{metric.label}</p>
                      <p className="text-2xl font-bold text-white">{metric.value}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${
                    metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Chart Placeholder */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Revenue Overview</h3>
              <select className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1 text-sm">
                <option value="6months">Last 6 Months</option>
                <option value="3months">Last 3 Months</option>
                <option value="1month">Last Month</option>
              </select>
            </div>
            <div className="h-64 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-white/50 mx-auto mb-2" />
                <p className="text-white/70">Revenue Chart</p>
                <p className="text-white/50 text-sm">Chart visualization will appear here</p>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const getActivityText = () => {
                  switch (activity.type) {
                    case 'enrollment':
                      return `enrolled in ${activity.course}`;
                    case 'message':
                      return `sent you a message about ${activity.course}`;
                    case 'completion':
                      return `completed ${activity.course}`;
                    default:
                      return 'had activity';
                  }
                };

                const getActivityIcon = () => {
                  switch (activity.type) {
                    case 'enrollment': return <Users className="w-4 h-4 text-blue-400" />;
                    case 'message': return <MessageSquare className="w-4 h-4 text-yellow-400" />;
                    case 'completion': return <Award className="w-4 h-4 text-green-400" />;
                    default: return <Bell className="w-4 h-4 text-gray-400" />;
                  }
                };

                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <img src={activity.avatar} alt={activity.student} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        <span className="font-medium">{activity.student}</span>
                        <span className="text-gray-300 ml-1">{getActivityText()}</span>
                      </p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getActivityIcon()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowCourseWizard(true)}
              className="flex items-center space-x-3 p-4 rounded-lg bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-colors text-left">
              <Plus className="w-6 h-6 text-blue-400" />
              <div>
                <p className="font-medium text-white">Create New Course</p>
                <p className="text-sm text-gray-300">Start building your next course</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 rounded-lg bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition-colors text-left">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              <div>
                <p className="font-medium text-white">View Messages</p>
                <p className="text-sm text-gray-300">Respond to student inquiries</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 rounded-lg bg-green-600/20 border border-green-500/30 hover:bg-green-600/30 transition-colors text-left">
              <BarChart3 className="w-6 h-6 text-green-400" />
              <div>
                <p className="font-medium text-white">Check Analytics</p>
                <p className="text-sm text-gray-300">View detailed performance data</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MyCourses = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">My Courses</h2>
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Loading your courses...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">My Courses</h2>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button 
              onClick={() => setShowCourseWizard(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
              <Plus className="w-4 h-4" />
              <span>New Course</span>
            </button>
          </div>
        </div>

        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/20">
                <tr>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Course</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Status</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Students</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Revenue</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Rating</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Last Updated</th>
                  <th className="text-left py-4 px-6 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length > 0 ? courses.map((course) => (
                  <tr key={course.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={course.thumbnail_url || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=150&h=100&fit=crop'} 
                          alt={course.title}
                          className="w-16 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-white">{course.title}</p>
                          <p className="text-sm text-gray-400">{course.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        course.status === 'published' 
                          ? 'bg-green-600/20 text-green-400' 
                          : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white">{course.students || 0}</td>
                    <td className="py-4 px-6 text-white">${Math.round(course.revenue || 0)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white">{course.rating ? course.rating.toFixed(1) : '0.0'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {new Date(course.updated_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-300" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-300" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <BookOpen className="w-16 h-16 text-gray-400" />
                        <div>
                          <p className="text-xl font-semibold text-white mb-2">No courses yet</p>
                          <p className="text-gray-400 mb-4">Create your first course to get started</p>
                          <button 
                            onClick={() => setShowCourseWizard(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                          >
                            Create Course
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const Analytics = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <div className="flex items-center space-x-3">
            <select className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white">
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Revenue Analytics */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Revenue Analytics</h3>
            <div className="h-64 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-white/50 mx-auto mb-2" />
                <p className="text-white/70">Revenue Chart</p>
                <p className="text-white/50 text-sm">Monthly revenue trends</p>
              </div>
            </div>
          </div>

          {/* Student Analytics */}
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Student Analytics</h3>
            <div className="h-64 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 text-white/50 mx-auto mb-2" />
                <p className="text-white/70">Student Distribution</p>
                <p className="text-white/50 text-sm">Geographic and engagement data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Course Completion</h3>
            <p className="text-3xl font-bold text-green-400 mb-1">87%</p>
            <p className="text-sm text-gray-300">Average completion rate</p>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Average Rating</h3>
            <p className="text-3xl font-bold text-blue-400 mb-1">4.8</p>
            <p className="text-sm text-gray-300">Across all courses</p>
          </div>

          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Avg Watch Time</h3>
            <p className="text-3xl font-bold text-purple-400 mb-1">24m</p>
            <p className="text-sm text-gray-300">Per lesson</p>
          </div>
        </div>
      </div>
    );
  };

  const Messages = () => {
    if (loading) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Messages</h2>
          </div>
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Loading conversations...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Messages</h2>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
              <Send className="w-4 h-4" />
              <span>Bulk Message</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversation List */}
          <div className="lg:col-span-1 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/20">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {conversations.length > 0 ? conversations.map((conv) => (
                <div key={conv.id} className={`p-4 border-b border-white/10 hover:bg-white/5 cursor-pointer transition-colors ${conv.unreadCount > 0 ? 'bg-blue-600/10' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <img 
                        src={conv.otherUser?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'} 
                        alt={conv.otherUser?.full_name} 
                        className="w-10 h-10 rounded-full" 
                      />
                      {conv.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white truncate">{conv.otherUser?.full_name}</p>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-600/20 text-blue-400">
                          Student
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">{conv.courses?.title || 'General'}</p>
                      <p className="text-sm text-gray-300 truncate">
                        {conv.latestMessage?.content || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {conv.latestMessage ? new Date(conv.latestMessage.created_at).toLocaleString() : 'No activity'}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">No conversations yet</p>
                  <p className="text-gray-400">Students will appear here when they message you</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl flex flex-col">
            <div className="p-4 border-b border-white/20">
              <p className="text-gray-300">Select a conversation to start messaging</p>
            </div>
            <div className="flex-1 p-4 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'courses':
        return <MyCourses />;
      case 'create':
        return (
          <div className="text-center py-12">
            <Plus className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-4">Create a New Course</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              Start building your next course with our AI-powered creation wizard
            </p>
            <button 
              onClick={() => setShowCourseWizard(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Launch Course Wizard</span>
            </button>
          </div>
        );
      case 'students':
        return <div className="text-white">Students - Coming Soon</div>;
      case 'analytics':
        return <Analytics />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <div className="text-white">Settings - Coming Soon</div>;
      default:
        return <DashboardOverview />;
    }
  };

  // In development mode, skip authentication
  if (devMode) {
    // Use mock user for development
    const currentUser = mockUser;
    
    return (
      <>
        {showCourseWizard && (
          <CourseCreationWizard onClose={handleCloseCourseWizard} />
        )}
        
        <div className="min-h-screen bg-zinc-950 flex">
          {/* Development Mode Banner */}
          <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-black px-4 py-2 z-50 text-center text-sm font-medium">
            🔧 Development Mode - Database setup not required | 
            <button 
              onClick={() => setDevMode(false)} 
              className="ml-2 underline hover:no-underline"
            >
              Switch to Production Mode
            </button>
          </div>
          
          {/* Sidebar with dev mode adjustments */}
          <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 backdrop-blur-md bg-white/5 border-r border-white/20 flex flex-col mt-10`}>
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                {!sidebarCollapsed && (
                  <button 
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-3 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                    <span className="text-xl font-bold text-white">Lynck Academy</span>
                  </button>
                )}
                {sidebarCollapsed && (
                  <button 
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Go to Homepage"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                  </button>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  {sidebarCollapsed ? <Menu className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
                </button>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'courses', label: 'My Courses', icon: BookOpen },
                { id: 'create', label: 'Create Course', icon: Plus },
                { id: 'students', label: 'Students', icon: Users },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : null },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                  if (item.isNavigation) {
                    navigate(item.href);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative ${
                      isActive && !item.isNavigation
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                        : item.isNavigation
                          ? 'text-gray-400 hover:bg-green-600/20 hover:text-green-400 border-t border-white/20 mt-2 pt-4'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {!sidebarCollapsed && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {sidebarCollapsed && item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/20">
              <div className="flex items-center space-x-3">
                <img 
                  src={currentUser.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
                {!sidebarCollapsed && (
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{currentUser.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col mt-10">
            <header className="backdrop-blur-md bg-white/5 border-b border-white/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm">Back to Home</span>
                  </button>
                  <h2 className="text-2xl font-semibold text-white capitalize">{activeTab}</h2>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <Bell className="w-5 h-5 text-white" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
                  </button>
                </div>
              </div>
            </header>

            <main className="flex-1 p-6 overflow-auto">
              {renderContent()}
            </main>
          </div>
        </div>
      </>
    );
  }

  // Production mode authentication checks
  if (loading && !user && !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Please Sign In</h2>
          <p className="text-gray-300 mb-6">You need to sign in to access the teacher dashboard.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {showCourseWizard && (
        <CourseCreationWizard onClose={handleCloseCourseWizard} />
      )}
      
      <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 backdrop-blur-md bg-white/5 border-r border-white/20 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-3 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                <span className="text-xl font-bold text-white">Lynck Academy</span>
              </button>
            )}
            {sidebarCollapsed && (
              <button 
                onClick={() => navigate('/')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Go to Homepage"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              </button>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5 text-white" /> : <X className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isNavigation) {
                    navigate(item.href);
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors relative ${
                  isActive && !item.isNavigation
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                    : item.isNavigation
                      ? 'text-gray-400 hover:bg-green-600/20 hover:text-green-400 border-t border-white/20 mt-2 pt-4'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && (
                  <>
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {sidebarCollapsed && item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center space-x-3">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"} 
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
            {!sidebarCollapsed && (
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.name || 'Teacher'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || 'Teacher'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="backdrop-blur-md bg-white/5 border-b border-white/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 px-3 py-1 rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Home</span>
              </button>
              <h2 className="text-2xl font-semibold text-white capitalize">{activeTab}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="relative p-2 rounded-lg hover:bg-white/10 transition-colors">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">3</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
    </>
  );
};

export default TeacherDashboard;