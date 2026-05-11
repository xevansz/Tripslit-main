import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../src/theme";

export default function SOS() {
  const router = useRouter();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true })).start();
  }, []);

  const ring1 = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const opacity1 = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  const contacts = [
    { name: "Mom", phone: "+1 (555) 123-4567", icon: "heart" as const, color: colors.danger },
    { name: "Sarah (Best friend)", phone: "+1 (555) 999-0011", icon: "star" as const, color: colors.warning },
    { name: "Local Police", phone: "112", icon: "shield" as const, color: colors.primary },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="sos-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.htitle}>Emergency</Text>
        <TouchableOpacity testID="sos-settings" style={styles.back}><Ionicons name="settings-outline" size={20} color={colors.text} /></TouchableOpacity>
      </View>

      <View style={styles.statusBar}>
        <View style={styles.statusItem}><Ionicons name="location" size={14} color={colors.success} /><Text style={styles.statusText}>Live location</Text></View>
        <View style={styles.statusItem}><Ionicons name="battery-half" size={14} color={colors.success} /><Text style={styles.statusText}>78%</Text></View>
        <View style={styles.statusItem}><Ionicons name="wifi" size={14} color={colors.success} /><Text style={styles.statusText}>Strong</Text></View>
      </View>

      <View style={styles.center}>
        <View style={{ width: 220, height: 220, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={[styles.ring, { transform: [{ scale: ring1 }], opacity: opacity1 }]} />
          <TouchableOpacity testID="sos-button" activeOpacity={0.85}>
            <LinearGradient colors={["#FF3B30", "#DC2626"]} style={styles.sosBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="alert" size={48} color="#fff" />
              <Text style={styles.sosLabel}>HOLD FOR SOS</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Text style={styles.help}>Hold the button for 3 seconds to alert your trusted contacts and share live location.</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <Text style={styles.section}>Trusted contacts</Text>
        <View style={{ gap: 10, marginTop: 10 }}>
          {contacts.map((c, i) => (
            <View key={i} style={styles.cRow}>
              <View style={[styles.cIcon, { backgroundColor: c.color + "1A" }]}><Ionicons name={c.icon} size={18} color={c.color} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cName}>{c.name}</Text>
                <Text style={styles.cPhone}>{c.phone}</Text>
              </View>
              <TouchableOpacity testID={`sos-call-${c.name}`} style={styles.callBtn}><Ionicons name="call" size={16} color="#fff" /></TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  statusBar: { flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 18, paddingVertical: 12, marginHorizontal: 20, borderRadius: 14, backgroundColor: colors.successSoft },
  statusItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  statusText: { fontSize: 12, fontWeight: "700", color: colors.success },
  center: { alignItems: "center", marginTop: 28, paddingHorizontal: 24 },
  ring: { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,59,48,0.4)" },
  sosBtn: { width: 200, height: 200, borderRadius: 100, alignItems: "center", justifyContent: "center", shadowColor: "#FF3B30", shadowOpacity: 0.5, shadowRadius: 30, shadowOffset: { width: 0, height: 10 } },
  sosLabel: { color: "#fff", fontSize: 14, fontWeight: "800", letterSpacing: 1.5, marginTop: 8 },
  help: { color: colors.textMuted, fontSize: 13, textAlign: "center", marginTop: 28, lineHeight: 19 },
  section: { fontSize: 15, fontWeight: "800", color: colors.text },
  cRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cName: { fontWeight: "700", color: colors.text, fontSize: 14 },
  cPhone: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  callBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
});
