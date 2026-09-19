import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Organization, NotificationItem, UserRole, Feedback, RolePermissionMatrix, PermissionKey } from '../types.js';
import { ApiService } from '../services/api.js';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
}

interface AppContextType {
  currentUser: User | null;
  organization: Organization | null;
  users: User[];
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => Promise<void>;
  permissions: RolePermissionMatrix | null;
  hasPermission: (perm: PermissionKey) => boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedFeedbackId: string | null;
  setSelectedFeedbackId: (id: string | null) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isManualModalOpen: boolean;
  setIsManualModalOpen: (open: boolean) => void;
  isCSVModalOpen: boolean;
  setIsCSVModalOpen: (open: boolean) => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  liveFeedbacks: Feedback[];
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentRole, setCurrentRoleState] = useState<UserRole>('ADMIN');
  const [permissions, setPermissions] = useState<RolePermissionMatrix | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('app_theme') as 'light' | 'dark') || 'light';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('ALL');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [liveFeedbacks, setLiveFeedbacks] = useState<Feedback[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Helper for RBAC check
  const hasPermission = (perm: PermissionKey): boolean => {
    if (permissions && permissions[currentRole]) {
      return permissions[currentRole].includes(perm);
    }
    // Default fallback
    if (currentRole === 'ADMIN') return true;
    if (currentRole === 'MANAGER') {
      return !['feedback.delete', 'user.manage', 'role.manage', 'system.configure'].includes(perm);
    }
    if (currentRole === 'ANALYST') {
      return ['feedback.view', 'feedback.create', 'feedback.edit', 'analytics.view', 'analytics.export', 'ai.analyze', 'ai.recommend', 'ai.simulate'].includes(perm);
    }
    return ['feedback.view', 'analytics.view'].includes(perm);
  };

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, ...toast };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch initial auth session and RBAC permissions
  useEffect(() => {
    async function loadSession() {
      try {
        const [meRes, rbacRes] = await Promise.all([
          ApiService.getMe(),
          ApiService.getRolePermissions().catch(() => null)
        ]);
        setCurrentUser(meRes.user);
        setOrganization(meRes.organization);
        setUsers(meRes.users);
        setCurrentRoleState(meRes.user.role);
        ApiService.setUserEmail(meRes.user.email);
        if (rbacRes?.data) {
          setPermissions(rbacRes.data);
        }
      } catch (e) {
        console.warn('Initial session fetch fallback:', e);
      }
    }
    loadSession();
  }, []);


  // Fetch notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await ApiService.getNotifications();
        setNotifications(res.notifications);
      } catch (e) {
        // ignore
      }
    }
    loadNotifications();
  }, [refreshTrigger]);

  // Connect SSE real-time stream
  useEffect(() => {
    const eventSource = new EventSource('/api/v1/stream');

    eventSource.addEventListener('feedback_created', (e) => {
      try {
        const fb: Feedback = JSON.parse(e.data);
        setLiveFeedbacks(prev => [fb, ...prev.slice(0, 19)]);
        triggerRefresh();
        if (fb.analysis?.priority === 'CRITICAL') {
          addToast({
            title: `🚨 Critical Feedback Received`,
            message: `${fb.customerName} reported critical friction on ${fb.productName}`,
            type: 'critical'
          });
        }
      } catch (err) {}
    });

    eventSource.addEventListener('notification', (e) => {
      try {
        const notif: NotificationItem = JSON.parse(e.data);
        setNotifications(prev => [notif, ...prev]);
        addToast({
          title: notif.title,
          message: notif.message,
          type: notif.severity === 'critical' ? 'critical' : notif.severity === 'high' ? 'warning' : 'info'
        });
      } catch (err) {}
    });

    eventSource.addEventListener('issue_created', () => {
      triggerRefresh();
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const setCurrentRole = async (role: UserRole) => {
    setCurrentRoleState(role);
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, role } : null);
      try {
        await ApiService.switchRole(role, currentUser.id);
        addToast({
          title: 'Role Switched',
          message: `Switched active authorization scope to ${role}`,
          type: 'info'
        });
      } catch (e) {
        // ignore
      }
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await ApiService.markNotificationRead(id);
    } catch (e) {}
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await ApiService.markAllNotificationsRead();
    } catch (e) {}
  };

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Keyboard shortcut for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        organization,
        users,
        currentRole,
        setCurrentRole,
        permissions,
        hasPermission,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedFeedbackId,
        setSelectedFeedbackId,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        addToast,
        removeToast,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isManualModalOpen,
        setIsManualModalOpen,
        isCSVModalOpen,
        setIsCSVModalOpen,
        refreshTrigger,
        triggerRefresh,
        liveFeedbacks,
        globalSearch,
        setGlobalSearch,
        selectedProductId,
        setSelectedProductId
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
