import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme";

const ICONS: Record<string, [any, any]> = {
  home: ["home-outline", "home"],
  trips: ["airplane-outline", "airplane"],
  tripbuddy: ["sparkles-outline", "sparkles"],
  vendors: ["storefront-outline", "storefront"],
  profile: ["person-outline", "person"],
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 86, paddingTop: 10, paddingBottom: 24, borderTopColor: colors.border,
          backgroundColor: "#fff",
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarIcon: ({ focused, color }) => {
          const [outline, filled] = ICONS[route.name] || ICONS.home;
          if (route.name === "tripbuddy") {
            return (
              <View style={styles.aiWrap}>
                <LinearGradient colors={colors.blueGrad as any} style={styles.aiBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </LinearGradient>
              </View>
            );
          }
          return <Ionicons name={focused ? filled : outline} size={24} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="trips" options={{ title: "Trips" }} />
      <Tabs.Screen name="tripbuddy" options={{ title: "TripBuddy" }} />
      <Tabs.Screen name="vendors" options={{ title: "Vendors" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  aiWrap: { width: 56, height: 56, alignItems: "center", justifyContent: "center", marginTop: -16 },
  aiBtn: {
    width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center",
    shadowColor: "#0066FF", shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
    borderWidth: 4, borderColor: "#fff",
  },
});
