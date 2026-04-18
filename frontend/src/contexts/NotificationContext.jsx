import { createContext, useContext, useState, useEffect } from "react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Request notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      read: false,
      timestamp: new Date(),
      ...notification,
    };
    setNotifications(prev => [newNotification, ...prev]);

    // Trigger browser notification for high priority
    if (notification.priority === "high" && "Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title || "DevTrackr", {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.type || "general",
      });
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Daily goal reminder
  const triggerDailyGoalReminder = () => {
    addNotification({
      type: "daily_goal",
      title: "🎯 Daily Goal Reminder",
      message: "Don't forget to log your study hours today!",
      priority: "medium",
    });
  };

  // Timer completion notification
  const triggerTimerComplete = () => {
    addNotification({
      type: "timer",
      title: "⏰ Timer Complete!",
      message: "Your study session has ended. Take a break!",
      priority: "high",
    });
  };

  // XP earned notification
  const triggerXPEarned = (xp, source) => {
    addNotification({
      type: "xp",
      title: `🎉 +${xp} XP Earned!`,
      message: `You earned ${xp} XP for ${source}. Keep it up!`,
      priority: "medium",
    });
  };

  // Level up notification
  const triggerLevelUp = (newLevel) => {
    addNotification({
      type: "level",
      title: `🚀 Level Up!`,
      message: `Congratulations! You've reached Level ${newLevel}!`,
      priority: "high",
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAll,
        triggerDailyGoalReminder,
        triggerTimerComplete,
        triggerXPEarned,
        triggerLevelUp,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
