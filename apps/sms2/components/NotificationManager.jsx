import React, { createContext, useState, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import Notification from './Notification';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, categories) => {
    const id = Date.now();
    setNotifications((prev) => [
      ...prev,
      { id, message, categories },
    ]);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <View style={styles.container}>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            categories={notification.categories}
            onDismiss={() => dismissNotification(notification.id)}
          />
        ))}
      </View>
    </NotificationContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});
