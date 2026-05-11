import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme";
import { useAuth } from "../../src/auth";

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const sections: any = [
    { title: "Account", items: [
      { icon: "wallet-outline", label: "Wallet & payments", color: colors.primary, go: "/wallet" },
      { icon: "card-outline", label: "Payment methods", color: colors.teal, k: "payments" },
      { icon: "trophy-outline", label: "Achievements & XP", color: colors.warning, k: "achievements" },
      { icon: "globe-outline", label: "Language & currency", color: colors.success, k: "language" },
      { icon: "notifications-outline", label: "Notification preferences", color: "#EC4899", k: "notifications" },
    ]},
    { title: "Security", items: [
      { icon: "shield-checkmark-outline", label: "Security & permissions", color: colors.primary, k: "security" },
      { icon: "eye-off-outline", label: "Privacy controls", color: colors.text, k: "privacy" },
      { icon: "lock-closed-outline", label: "Document vault", color: "#8B5CF6", k: "vault" },
      { icon: "people-outline", label: "Parental tracking", color: colors.danger, k: "parental" },
    ]},
    { title: "Support", items: [
      { icon: "help-circle-outline", label: "Help center", color: colors.primary, k: "help" },
      { icon: "compass-outline", label: "Discover popular trips", color: colors.teal, go: "/discover" },
    ]},
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <Text style={styles.h1}>Profile</Text>

        <View style={styles.userCard}>
          <View style={styles.avatar}><Text style={styles.avatarT}>{(user?.name || "U").charAt(0).toUpperCase()}</Text></View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={styles.name}>{user?.name || "Traveler"}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
          <TouchableOpacity testID="profile-edit" style={styles.editBtn}><Ionicons name="pencil" size={16} color={colors.primary} /></TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <Stat label="Trips" value="12" />
          <View style={styles.statDiv} />
          <Stat label="Friends" value="48" />
          <View style={styles.statDiv} />
          <Stat label="Saved" value="$2.4k" />
        </View>

        <TouchableOpacity testID="profile-premium" onPress={() => router.push("/premium")} style={{ marginHorizontal: 20, marginTop: 18 }}>
          <LinearGradient colors={["#F59E0B", "#FB923C"]} style={styles.premium} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.premLabel}>TRIPSPLIT PREMIUM</Text>
              <Text style={styles.premTitle}>Unlock unlimited AI & advanced reports</Text>
            </View>
            <View style={styles.premBadge}><Ionicons name="sparkles" size={20} color="#fff" /></View>
          </LinearGradient>
        </TouchableOpacity>

        {sections.map((sec: any) => (
          <View key={sec.title} style={{ marginTop: 22 }}>
            <Text style={styles.secTitle}>{sec.title}</Text>
            <View style={styles.secCard}>
              {sec.items.map((it: any, i: number) => (
                <TouchableOpacity key={it.label} testID={`profile-row-${it.k || it.go || it.label}`}
                  onPress={() => it.go ? router.push(it.go) : router.push({ pathname: "/profile/[k]", params: { k: it.k } })}
                  style={[styles.row, i < sec.items.length - 1 && styles.rowBorder]}>
                  <View style={[styles.rowIcon, { backgroundColor: it.color + "1A" }]}>
                    <Ionicons name={it.icon} size={18} color={it.color} />
                  </View>
                  <Text style={styles.rowLabel}>{it.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity testID="profile-logout" onPress={async () => { await signOut(); router.replace("/(auth)/login"); }} style={styles.logout}>
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        <Text style={styles.version}>TripSplit v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: any) {
  return (<View style={{ flex: 1, alignItems: "center" }}><Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{value}</Text><Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{label}</Text></View>);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  h1: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5, paddingHorizontal: 20, paddingTop: 8 },
  userCard: { marginHorizontal: 20, marginTop: 14, padding: 14, borderRadius: 22, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, flexDirection: "row", alignItems: "center" },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  avatarT: { color: "#fff", fontSize: 22, fontWeight: "800" },
  name: { fontSize: 17, fontWeight: "800", color: colors.text },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  editBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  statsRow: { marginHorizontal: 20, marginTop: 14, flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 18, backgroundColor: colors.surface },
  statDiv: { width: 1, height: 30, backgroundColor: colors.border },
  premium: { borderRadius: 22, padding: 18, flexDirection: "row", alignItems: "center" },
  premLabel: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  premTitle: { color: "#fff", fontSize: 16, fontWeight: "800", marginTop: 4 },
  premBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  secTitle: { paddingHorizontal: 20, fontSize: 12, fontWeight: "800", color: colors.textFaint, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 },
  secCard: { marginHorizontal: 20, backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: "600" },
  logout: { marginHorizontal: 20, marginTop: 22, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, backgroundColor: colors.dangerSoft },
  logoutText: { color: colors.danger, fontWeight: "700", fontSize: 14 },
  version: { textAlign: "center", marginTop: 18, fontSize: 12, color: colors.textFaint },
});
