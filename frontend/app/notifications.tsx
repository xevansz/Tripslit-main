import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../src/theme";
import { api } from "../src/api";

const FILTERS = ["All", "Unread", "Wallet", "Vendors", "Safety"];

export default function Notifications() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => { api.notifications().then(setItems).catch(() => {}); }, []);
  const filtered = items.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    if (filter === "Wallet") return n.type === "wallet" || n.type === "expense";
    if (filter === "Vendors") return n.type === "vendor";
    if (filter === "Safety") return n.type === "sos";
    return true;
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="n-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <Text style={styles.htitle}>Notifications</Text>
        <TouchableOpacity testID="n-clear" style={styles.back}><Ionicons name="checkmark-done" size={20} color={colors.text} /></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fs}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} testID={`n-f-${f}`} onPress={() => setFilter(f)} style={[styles.fi, filter === f && styles.fia]}>
            <Text style={[styles.ft, filter === f && { color: "#fff" }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 8 }}>
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="notifications-off" size={42} color={colors.textFaint} />
            <Text style={styles.emptyT}>No notifications</Text>
            <Text style={styles.emptyS}>You're all caught up.</Text>
          </View>
        )}
        {filtered.map((n) => (
          <View key={n.id} style={[styles.row, !n.read && styles.unread]}>
            <View style={[styles.icon, { backgroundColor: typeColor(n.type) + "1A" }]}>
              <Ionicons name={n.icon as any} size={18} color={typeColor(n.type)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{n.title}</Text>
              <Text style={styles.time}>{n.time}</Text>
            </View>
            {!n.read && <View style={styles.dot} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function typeColor(t: string) {
  if (t === "expense") return colors.primary;
  if (t === "wallet") return colors.teal;
  if (t === "borrow") return colors.danger;
  if (t === "vendor") return colors.warning;
  if (t === "poll") return "#8B5CF6";
  if (t === "sos") return colors.success;
  return colors.text;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 8 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  fs: { paddingHorizontal: 20, gap: 8, paddingVertical: 14 },
  fi: { paddingHorizontal: 14, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, justifyContent: "center" },
  fia: { backgroundColor: colors.text, borderColor: colors.text },
  ft: { fontWeight: "700", color: colors.text, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  unread: { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "700", color: colors.text, fontSize: 14 },
  time: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyT: { fontSize: 18, fontWeight: "800", color: colors.text, marginTop: 12 },
  emptyS: { color: colors.textMuted, marginTop: 4 },
});
