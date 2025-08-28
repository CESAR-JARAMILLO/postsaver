"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Notification } from "./Notification";

interface NotificationData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface NotificationContextType {
  showNotification: (
    message: string,
    type: "success" | "error" | "info",
    duration?: number
  ) => void;
  hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info", duration = 3000) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: NotificationData = { id, message, type, duration };

      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showNotification, hideNotification }}
    >
      {children}
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          isVisible={true}
          onClose={() => hideNotification(notification.id)}
          duration={notification.duration}
        />
      ))}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
