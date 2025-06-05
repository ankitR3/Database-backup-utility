import { useState, useEffect } from 'react';
import { 
  Database, 
  Clock, 
  Settings, 
  User, 
  LogOut, 
  Play, 
  Download,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Calendar,
  HardDrive,
  Activity,
  Menu,
  X,
  UserPlus,
  Lock
} from 'lucide-react';

// Type definitions
interface User {
  username: string;
  email: string;
  uuid: string;
  apiKey: string;
  role?: string;
  mongoUri?: string;
  dbName?: string;
}

interface BackupStatus {
  schedulerRunning: boolean;
  initialized: boolean;
  backupDirectory: string;
  schedule: string;
  timestamp: string;
}

interface Backup {
  _id: string;
  dbName: string;
  status: 'completed' | 'failed' | 'pending';
  createdAt: string;
  backupSize?: number;
}

interface BackupStats {
  totalBackups: number;
  completedBackups: number;
  failedBackups: number;
  pendingBackups: number;
  totalSize: number;
  lastBackup: string | null;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface LoginData {
  token: string;
  user: User;
}

// Real API functions that connect to your backend
const api = {
  adminSignin: async (email: string, password: string): Promise<ApiResponse<LoginData>> => {
    try {
      const response = await fetch('/api/auth/admin/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }
      
      const data = await response.json();
      return { success: true, data: { token: data.token, user: data.user } };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  adminSignup: async (userData: {
    username: string;
    email: string;
    password: string;
    adminKey: string;
  }): Promise<ApiResponse<LoginData>> => {
    try {
      const response = await fetch('/api/auth/admin/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Signup failed');
      }
      
      const data = await response.json();
      return { success: true, data: { token: data.token, user: data.user } };
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  },

  userSignin: async (email: string, password: string): Promise<ApiResponse<LoginData>> => {
    try {
      const response = await fetch('http://localhost:1515/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid credentials');
      }
      
      const data = await response.json();
      return { success: true, data: { token: data.token, user: data.user } };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  userSignup: async (userData: {
    username: string;
    email: string;
    password: string;
    mongoUri: string;
    dbName: string;
  }): Promise<ApiResponse<LoginData>> => {
    try {
      const response = await fetch('http://localhost:1515/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Signup failed');
      }
      
      const data = await response.json();
      return { success: true, data: { token: data.token, user: data.user } };
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    }
  },
  
  getBackupStatus: async (): Promise<BackupStatus> => {
    try {
      const response = await fetch('/api/backup/status', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch backup status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching backup status:', error);
      return {
        schedulerRunning: false,
        initialized: false,
        backupDirectory: 'Not available',
        schedule: 'Not set',
        timestamp: new Date().toISOString()
      };
    }
  },
  
  getUserBackups: async (): Promise<Backup[]> => {
    try {
      const response = await fetch('/api/backups', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching backups:', error);
      return [];
    }
  },

  getBackupStats: async (): Promise<BackupStats> => {
    try {
      const response = await fetch('/api/backup/stats', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch backup stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching backup stats:', error);
      return {
        totalBackups: 0,
        completedBackups: 0,
        failedBackups: 0,
        pendingBackups: 0,
        totalSize: 0,
        lastBackup: null
      };
    }
  },

  createManualBackup: async (): Promise<any> => {
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create backup');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  },

  updateSchedule: async (schedule: string): Promise<any> => {
    try {
      const response = await fetch('/api/backup/schedule', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update schedule');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }
};

// Utility functions
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};

// Auth Component
const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [userType, setUserType] = useState<'admin' | 'user'>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [loginData, setLoginData] = useState({
    email: 'ankitraj28401@gmail.com',
    password: 'MscwHvw08gj4'
  });

  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    adminKey: '',
    mongoUri: '',
    dbName: ''
  });

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      let response;
      if (userType === 'admin') {
        response = await api.adminSignin(loginData.email, loginData.password);
      } else {
        response = await api.userSignin(loginData.email, loginData.password);
      }
      onLogin(response.data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    
    try {
      let response;
      if (userType === 'admin') {
        response = await api.adminSignup({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          adminKey: signupData.adminKey
        });
      } else {
        response = await api.userSignup({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
          mongoUri: signupData.mongoUri,
          dbName: signupData.dbName
        });
      }
      onLogin(response.data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <Database className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">MongoDB Backup</h1>
          <p className="text-blue-200">Secure Database Management</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-6 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'login' 
                ? 'bg-blue-600 text-white' 
                : 'text-blue-200 hover:bg-white/10'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'signup' 
                ? 'bg-blue-600 text-white' 
                : 'text-blue-200 hover:bg-white/10'
            }`}
          >
            <UserPlus className="w-4 h-4 inline mr-2" />
            Sign Up
          </button>
        </div>

        {/* User Type Toggle */}
        <div className="flex mb-6 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setUserType('admin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              userType === 'admin' 
                ? 'bg-purple-600 text-white' 
                : 'text-blue-200 hover:bg-white/10'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setUserType('user')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              userType === 'user' 
                ? 'bg-purple-600 text-white' 
                : 'text-blue-200 hover:bg-white/10'
            }`}
          >
            User
          </button>
        </div>
        
        <div className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          {mode === 'login' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Username</label>
                <input
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData({...signupData, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Email</label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Password</label>
                <input
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Create a password"
                  required
                />
              </div>

              {userType === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-blue-200 mb-2">Admin Key</label>
                  <input
                    type="password"
                    value={signupData.adminKey}
                    onChange={(e) => setSignupData({...signupData, adminKey: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter admin key"
                    required
                  />
                </div>
              )}

              {userType === 'user' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">MongoDB URI</label>
                    <input
                      type="text"
                      value={signupData.mongoUri}
                      onChange={(e) => setSignupData({...signupData, mongoUri: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="mongodb://localhost:27017"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Database Name</label>
                    <input
                      type="text"
                      value={signupData.dbName}
                      onChange={(e) => setSignupData({...signupData, dbName: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Enter database name"
                      required
                    />
                  </div>
                </>
              )}
              
              <button
                onClick={handleSignup}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [backupStats, setBackupStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSchedule, setNewSchedule] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statusData, backupsData, statsData] = await Promise.all([
        api.getBackupStatus(),
        api.getUserBackups(),
        api.getBackupStats()
      ]);
      setBackupStatus(statusData);
      setBackups(backupsData);
      setBackupStats(statsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      await api.createManualBackup();
      await loadDashboardData();
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!newSchedule.trim()) return;
    
    setLoading(true);
    try {
      await api.updateSchedule(newSchedule);
      await loadDashboardData();
      setNewSchedule('');
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'backups', label: 'Backups', icon: Database },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Database className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">MongoDB Backup</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                {user.username} ({user.role || 'User'})
              </div>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`lg:w-64 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <nav className="bg-white rounded-lg shadow p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <Database className="w-8 h-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Backups</p>
                        <p className="text-2xl font-bold text-gray-900">{backupStats?.totalBackups || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{backupStats?.completedBackups || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <XCircle className="w-8 h-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Failed</p>
                        <p className="text-2xl font-bold text-gray-900">{backupStats?.failedBackups || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <HardDrive className="w-8 h-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Size</p>
                        <p className="text-2xl font-bold text-gray-900">{formatBytes(backupStats?.totalSize || 0)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    System Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Scheduler Status</p>
                      <div className="flex items-center mt-1">
                        <div className={`w-3 h-3 rounded-full mr-2 ${backupStatus?.schedulerRunning ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm font-medium">{backupStatus?.schedulerRunning ? 'Running' : 'Stopped'}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Schedule</p>
                      <p className="text-sm font-medium mt-1">{backupStatus?.schedule || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Backup Directory</p>
                      <p className="text-sm font-medium mt-1">{backupStatus?.backupDirectory || 'Not configured'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Update</p>
                      <p className="text-sm font-medium mt-1">{backupStatus?.timestamp ? formatDate(backupStatus.timestamp) : 'Never'}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleCreateBackup}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Create Backup Now
                    </button>
                    <button
                      onClick={loadDashboardData}
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'backups' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Backup History</h2>
                  <button
                    onClick={handleCreateBackup}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Create Backup
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Database
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created At
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {backups.map((backup) => (
                          <tr key={backup._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(backup.status)}
                                <span className="ml-2 text-sm font-medium capitalize">{backup.status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {backup.dbName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(backup.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {backup.backupSize ? formatBytes(backup.backupSize) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {backup.status === 'completed' && (
                                <button className="text-blue-600 hover:text-blue-900 flex items-center">
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {backups.length === 0 && (
                    <div className="text-center py-12">
                      <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No backups found. Create your first backup to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Backup Schedule</h2>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Schedule</h3>
                  <div className="mb-6">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-2" />
                      <span className="text-gray-900">{backupStatus?.schedule || 'No schedule set'}</span>
                    </div>
                  </div>

                  <h4 className="text-md font-medium text-gray-900 mb-3">Update Schedule</h4>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newSchedule}
                      onChange={(e) => setNewSchedule(e.target.value)}
                      placeholder="e.g., 0 2 * * * (daily at 2 AM)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleUpdateSchedule}
                      disabled={loading || !newSchedule.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Use cron format: minute hour day month weekday
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Schedules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Daily at 2 AM', cron: '0 2 * * *' },
                      { label: 'Weekly on Sunday at 3 AM', cron: '0 3 * * 0' },
                      { label: 'Every 6 hours', cron: '0 */6 * * *' },
                      { label: 'Monthly on 1st at 4 AM', cron: '0 4 1 * *' }
                    ].map((schedule) => (
                      <button
                        key={schedule.cron}
                        onClick={() => setNewSchedule(schedule.cron)}
                        className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300"
                      >
                        <div className="font-medium text-gray-900">{schedule.label}</div>
                        <div className="text-sm text-gray-500">{schedule.cron}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Username</label>
                      <p className="mt-1 text-sm text-gray-900">{user.username}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <p className="mt-1 text-sm text-gray-900">{user.role || 'User'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">UUID</label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">{user.uuid}</p>
                    </div>
                  </div>
                </div>

                {user.mongoUri && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">MongoDB URI</label>
                        <p className="mt-1 text-sm text-gray-900 font-mono break-all">{user.mongoUri}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Database Name</label>
                        <p className="mt-1 text-sm text-gray-900">{user.dbName}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">API Key</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Use this key for API access</p>
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm font-mono">{user.apiKey}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="App">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthScreen onLogin={handleLogin} />
      )}
    </div>
  );
};

export default App;