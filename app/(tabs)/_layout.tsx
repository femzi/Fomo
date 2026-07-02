import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text style={styles.iconEmoji}>{emoji}</Text>
      <Text style={[styles.iconLabel, focused && styles.iconLabelOn]}>{label}</Text>
    </View>
  );
}

function BellIcon({ focused }: { focused: boolean }) {
  const { unreadNotifCount } = useApp();
  return (
    <View style={styles.iconWrap}>
      <View>
        <Text style={styles.iconEmoji}>🔔</Text>
        {unreadNotifCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.iconLabel, focused && styles.iconLabelOn]}>ALERTS</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { userRole } = useApp();

  // IMPORTANT: All <Tabs.Screen> must always be rendered — never wrap them in
  // conditionals. Use href: null to hide a tab instead of unmounting it, or
  // Expo Router throws "Layout children must be of type Screen" repeatedly.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.bg,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen name="index"    options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌙" label="TONIGHT"  focused={focused} /> }} />
      <Tabs.Screen name="discover" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎬" label="CLIPS"    focused={focused} /> }} />
      <Tabs.Screen name="map"      options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="📍" label="MAP"      focused={focused} /> }} />
      <Tabs.Screen name="squad"    options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💬" label="CHATS"    focused={focused} /> }} />
      <Tabs.Screen name="tickets"  options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🎟️" label="TICKETS"  focused={focused} /> }} />
      <Tabs.Screen name="profile"  options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="ME"       focused={focused} /> }} />

      {/* Dashboard: always rendered as a Screen — href: null hides it from the
          tab bar when the user is an attendee. This avoids the repeated warning
          about non-Screen children in a Tabs layout. */}
      <Tabs.Screen
        name="dashboard"
        options={{
          href: userRole === 'promoter' ? undefined : null,
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" label="DASH" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const S = StyleSheet.create;
const styles = S({
  iconWrap:     { alignItems: 'center', gap: 2, paddingTop: 4 },
  iconEmoji:    { fontSize: 20 },
  iconLabel:    { fontSize: 7, fontWeight: '700', color: '#5C5A56', letterSpacing: 0.5 },
  iconLabelOn:  { color: '#CC2929' },
  badge:        { position: 'absolute', top: -4, right: -6, backgroundColor: '#CC2929', borderRadius: 8, minWidth: 15, height: 15, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 },
  badgeTxt:     { fontSize: 8, fontWeight: '700', color: '#fff' },
});
