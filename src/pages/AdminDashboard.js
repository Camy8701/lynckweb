import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/Auth0Context';
import { 
  Users, 
  UserCheck, 
  UserX, 
  BookOpen, 
  TrendingUp, 
  Activity, 
  Shield, 
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  AlertTriangle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, profile, getSupabaseClient } = useAuth();
  const supabase = getSupabaseClient();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_admins: 0,
    pending_teacher_requests: 0,
    new_users_today: 0,
    new_users_this_week: 0,
    new_users_this_month: 0
  });
  
  const [roleRequests, setRoleRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [adminActivities, setAdminActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load platform statistics
      const { data: statsData } = await supabase
        .from('platform_stats')
        .select('*')
        .single();

      if (statsData) {
        setStats(statsData);
      }

      // Load pending role requests
      const { data: requestsData } = await supabase
        .from('role_requests')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      setRoleRequests(requestsData || []);

      // Load recent users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setUsers(usersData || []);

      // Load recent admin activities
      const { data: activitiesData } = await supabase
        .from('admin_activities')
        .select(`
          *,
          profiles:admin_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      setAdminActivities(activitiesData || []);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveTeacherRequest = async (requestId, adminNotes = '') => {
    try {
      // Call the stored procedure
      const { data, error } = await supabase
        .rpc('approve_teacher_request', {
          request_id: requestId,
          admin_id: profile.id,
          admin_notes_text: adminNotes
        });

      if (error) throw error;

      // Reload data
      loadDashboardData();
      alert('Teacher request approved successfully!');
    } catch (error) {
      console.error('Error approving teacher request:', error);
      alert('Failed to approve request. Please try again.');
    }
  };

  const rejectTeacherRequest = async (requestId, rejectionReason) => {
    try {
      const { error } = await supabase
        .from('role_requests')
        .update({
          status: 'rejected',
          reviewed_by: profile.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason
        })
        .eq('id', requestId);

      if (error) throw error;

      // Log admin activity
      await supabase
        .from('admin_activities')
        .insert([{
          admin_id: profile.id,
          action: 'reject_teacher_request',
          target_type: 'role_request',
          target_id: requestId,
          details: { rejection_reason: rejectionReason }
        }]);

      loadDashboardData();
      alert('Teacher request rejected.');
    } catch (error) {
      console.error('Error rejecting teacher request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const createNewAdmin = async (userEmail) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', userEmail);

      if (error) throw error;

      // Log admin activity
      await supabase
        .from('admin_activities')
        .insert([{
          admin_id: profile.id,
          action: 'create_admin',
          details: { promoted_user_email: userEmail }
        }]);

      loadDashboardData();
      alert('User promoted to admin successfully!');
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin. Please try again.');
    }
  };

  // Filter functions
  const filteredRequests = roleRequests.filter(request => {
    const matchesSearch = request.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden flex items-center justify-center">
        <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-xl p-8 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300">You need admin privileges to access this page.</p>
          <Link to="/" className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm">{title}</p>
          <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
        </div>
        <Icon className={`w-8 h-8 text-${color}-400`} />
      </div>
    </div>
  );

  const Overview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.total_users}
          subtitle={`+${stats.new_users_today} today`}
        />
        <StatCard
          icon={UserCheck}
          title="Students"
          value={stats.total_students}
          color="green"
        />
        <StatCard
          icon={BookOpen}
          title="Teachers"
          value={stats.total_teachers}
          color="purple"
        />
        <StatCard
          icon={Clock}
          title="Pending Requests"
          value={stats.pending_teacher_requests}
          subtitle="Teacher applications"
          color="orange"
        />
      </div>

      {/* Growth Stats */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">User Growth</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.new_users_today}</div>
            <div className="text-gray-300">New Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.new_users_this_week}</div>
            <div className="text-gray-300">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.new_users_this_month}</div>
            <div className="text-gray-300">This Month</div>
          </div>
        </div>
      </div>

      {/* Recent Admin Activities */}
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Recent Admin Activities</h3>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {adminActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-black/20 rounded-lg">
              <Activity className="w-5 h-5 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-white text-sm">
                  <span className="font-medium">{activity.profiles?.full_name}</span>
                  {' '}performed{' '}
                  <span className="text-blue-400">{activity.action.replace('_', ' ')}</span>
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {new Date(activity.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RoleRequests = () => (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-white">Teacher Applications</h2>
        
        <div className="flex space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
            />
          </div>
          
          {/* Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-black/30 border border-white/20 rounded-lg text-white focus:border-blue-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <img
                  src={request.profiles?.avatar_url || '/default-avatar.svg'}
                  alt={request.profiles?.full_name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {request.profiles?.full_name}
                  </h3>
                  <p className="text-gray-300 text-sm">{request.profiles?.email}</p>
                  <p className="text-gray-400 text-xs">
                    Applied: {new Date(request.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                  request.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                  request.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-white mb-2">Reason for Teaching:</h4>
                <p className="text-gray-300 text-sm">{request.reason}</p>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Qualifications:</h4>
                <p className="text-gray-300 text-sm">{request.qualifications}</p>
              </div>
            </div>

            {request.portfolio_url && (
              <div className="mb-4">
                <h4 className="font-medium text-white mb-2">Portfolio:</h4>
                <a
                  href={request.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  {request.portfolio_url}
                </a>
              </div>
            )}

            {request.status === 'pending' && (
              <div className="flex space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => approveTeacherRequest(request.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Reason for rejection:');
                    if (reason) rejectTeacherRequest(request.id, reason);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        ))}
        
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No applications found</h3>
            <p className="text-gray-400">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'No teacher applications yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const UserManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <button
          onClick={() => {
            const email = prompt('Enter email address to promote to admin:');
            if (email) createNewAdmin(email);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Admin</span>
        </button>
      </div>

      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 text-white">User</th>
                <th className="text-left py-3 text-white">Role</th>
                <th className="text-left py-3 text-white">Joined</th>
                <th className="text-left py-3 text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 20).map((user) => (
                <tr key={user.id} className="border-b border-white/5">
                  <td className="py-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar_url || '/default-avatar.svg'}
                        alt={user.full_name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <div className="text-white text-sm">{user.full_name}</div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                      user.role === 'teacher' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-300 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.account_status === 'active' ? 'bg-green-500/20 text-green-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {user.account_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-red-600/20"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Welcome back, {user?.name} 👋</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-black/20 p-1 rounded-lg w-fit">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'requests', label: 'Teacher Requests', icon: UserCheck },
            { id: 'users', label: 'User Management', icon: Users },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-white mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <Overview />}
            {activeTab === 'requests' && <RoleRequests />}
            {activeTab === 'users' && <UserManagement />}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;