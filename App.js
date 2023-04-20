import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import notifee, { EventType, AuthorizationStatus } from '@notifee/react-native';
import { categories } from './src/utils/categories';
import { Content } from './src/content';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  console.log(
    `[onBackgroundEvent] notification id: ${notification?.id},  event type: ${EventType[type]}, press action: ${pressAction?.id}`
  );
  // Check if the user pressed the "Mark as read" action
  if (
    type === EventType.ACTION_PRESS &&
    pressAction?.id === 'first_action_reply'
  ) {
    //here should 
    console.log('[onBackgroundEvent] ACTION_PRESS: first_action_reply');

    // Remove the notification
    if (notification?.id) {
      await notifee.cancelNotification(notification?.id);
    }
  }
});

export default function App() {
  const requestUserPermission = async () => {
    const settings = await notifee.requestPermission();

    if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
      console.log('permission granted');
      // console.log('Permission settings:', settings);
    } else {
      console.log('User declined permissions');
    }
  };

  // Subscribe to events
  useEffect(() => {
    notifee.setNotificationCategories(categories);
    return notifee.onForegroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail;
      const pressActionLabel = pressAction
        ? `, press action: ${pressAction?.id}`
        : '';
      console.log(
        `[onForegroundEvent] notification id: ${notification?.id},  event type: ${EventType[type]}${pressActionLabel}`
      );

      switch (type) {
        case EventType.DISMISSED:
          console.log(
            '[onForegroundEvent] User dismissed notification',
            notification
          );
          break;
        case EventType.PRESS:
          console.log(
            '[onForegroundEvent] User pressed notification',
            notification
          );
          break;
        case EventType.ACTION_PRESS:
          console.log(
            '[onForegroundEvent] User pressed an action',
            notification,
            detail.pressAction
          );

          if (detail.pressAction?.id === 'first_action_reply') {
            // perform any server calls here and cancel notification
            if (notification?.id) {
              await notifee.cancelDisplayedNotification(notification.id);
            }
          }
          break;
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      await requestUserPermission();
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
      <Content />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
