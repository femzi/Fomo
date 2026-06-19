import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color }: { name: IconName; color: string }) {
  return <Ionicons name={name} size={20} color={color} />;
}

export default function TabLayout() {
  const { userRole } = useApp();
  const isPromoter = userRole === 'promoter';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopColor: '#272727',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#CC2929',
        tabBarInactiveTintColor: '#5C5A56',
        tabBarLabelStyle: {
          fontSize: 8,
          fontFamily: Fonts.bodyBold,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Tonight', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="map"
        options={{ title: 'Map', tabBarIcon: ({ color }) => <TabIcon name="location" color={color} /> }}
      />
      <Tabs.Screen
        name="discover"
        options={{ title: 'Clips', tabBarIcon: ({ color }) => <TabIcon name="videocam" color={color} /> }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabIcon name="stats-chart" color={color} />,
          href: isPromoter ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{ title: 'Tickets', tabBarIcon: ({ color }) => <TabIcon name="ticket" color={color} /> }}
      />
      <Tabs.Screen
        name="squad"
        options={{ title: 'Chats', tabBarIcon: ({ color }) => <TabIcon name="chatbubbles" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Me', tabBarIcon: ({ color }) => <TabIcon name="person" color={color} /> }}
      />
    </Tabs>
  );
}
