import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../src/theme";
import { api } from "../../src/api";

const SECTIONS: Record<string, { t: string; sub: string; icon: any }> = {
  achievements: { t: "Achievements", sub: "Travel badges & milestones", icon: "trophy" },
  vault: { t: "Document Vault", sub: "Passports, IDs, tickets — encrypted", icon: "lock-closed" },
  privacy: { t: "Privacy controls", sub: "Custom visibility & data", icon: "eye-off" },
  parental: { t: "Parental Tracking", sub: "Live location with trusted adults", icon: "people" },
  security: { t: "Security & permissions", sub: "Biometrics · 2FA · device access", icon: "shield-checkmark" },
  notifications: { t: "Notifications", sub: "Smart alerts & quiet hours", icon: "notifications" },
  payments: { t: "Payment methods", sub: "Cards · UPI · linked banks", icon: "card" },
  language: { t: "Language & currency", sub: "30+ languages · multi-currency", icon: "globe" },
  help: { t: "Help center", sub: "FAQs · contact · status", icon: "help-circle" },
};

const DOCS = [
  { name: "Passport — US", icon: "document-text" as const, expires: "2030", color: colors.primary },
  { name: "Bali entry visa", icon: "airplane" as const, expires: "Mar 18", color: colors.warning },
  { name: "Travel insurance", icon: "shield-checkmark" as const, expires: "Mar 18", color: colors.success },
  { name: "Driver's license", icon: "car" as const, expires: "2028", color: colors.teal },
];

const CARDS = [
  { brand: "Visa", last4: "4429", primary: true, color: ["#0F172A", "#1E293B"] },
  { brand: "Mastercard", last4: "7821", primary: false, color: ["#7C2D12", "#EA580C"] },
];

const LANGS = [
  { k: "en", v: "English" }, { k: "es", v: "Español" }, { k: "fr", v: "Français" },
  { k: "hi", v: "हिन्दी" }, { k: "ja", v: "日本語" }, { k: "zh", v: "中文" },
];
const CURR = ["USD", "EUR", "GBP", "INR", "JPY", "IDR", "AUD"];

export default function ProfileSection() {
  const router = useRouter();
  const { k } = useLocalSearchParams<{ k: string }>();
  const meta = SECTIONS[k as string] || SECTIONS.achievements;
  const [achievements, setAchievements] = useState<any[]>([]);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    push: true, email: true, sms: false, quiet: true, profile_pub: false, share_stats: true, location_share: true,
    bio: true, twofa: false, parental_on: false, geofence: true,
  });
  const [lang, setLang] = useState("en");
  const [curr, setCurr] = useState("USD");

  useEffect(() => {
    if (k === "achievements") api.achievements().then(setAchievements).catch(() => {});
  }, [k]);

  function tog(key: string) { setToggles({ ...toggles, [key]: !toggles[key] }); }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="ps-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.htitle}>{meta.t}</Text>
          <Text style={styles.hsub}>{meta.sub}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}>

        {k === "achievements" && (
          <>
            <LinearGradient colors={["#F59E0B", "#FB923C"]} style={styles.statsBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>YOUR LEVEL</Text>
                <Text style={{ color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 4 }}>Globe Trotter · Lvl 4</Text>
                <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, marginTop: 4 }}>2,840 / 4,000 XP to next level</Text>
                <View style={styles.xpBar}><View style={[styles.xpFill, { width: "71%" }]} /></View>
              </View>
              <View style={styles.medal}><Ionicons name="medal" size={28} color="#fff" /></View>
            </LinearGradient>
            <View style={styles.gridA}>
              {achievements.map((a) => (
                <View key={a.id} style={[styles.badge, !a.earned && { opacity: 0.45 }]}>
                  <View style={[styles.badgeIcon, { backgroundColor: a.color + "1A" }]}><Ionicons name={a.icon} size={24} color={a.color} /></View>
                  <Text style={styles.badgeT}>{a.name}</Text>
                  <Text style={styles.badgeD}>{a.desc}</Text>
                  {a.earned && <View style={styles.earnedTag}><Ionicons name="checkmark" size={9} color="#fff" /><Text style={styles.earnedT}>EARNED</Text></View>}
                </View>
              ))}
            </View>
          </>
        )}

        {k === "vault" && (
          <>
            <View style={[styles.card, { backgroundColor: colors.successSoft, borderColor: colors.success + "33" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="lock-closed" size={20} color={colors.success} />
                <Text style={{ flex: 1, fontWeight: "700", color: colors.text }}>End-to-end encrypted</Text>
                <Text style={{ color: colors.success, fontWeight: "800", fontSize: 12 }}>{DOCS.length} ITEMS</Text>
              </View>
            </View>
            {DOCS.map((d, i) => (
              <TouchableOpacity key={i} testID={`doc-${i}`} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: d.color + "1A" }]}><Ionicons name={d.icon} size={20} color={d.color} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowT}>{d.name}</Text>
                  <Text style={styles.rowS}>Expires {d.expires}</Text>
                </View>
                <Ionicons name="eye-outline" size={20} color={colors.textFaint} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity testID="doc-add" onPress={() => Alert.alert("Add document", "Camera will open to scan")} style={[styles.row, { borderStyle: "dashed", justifyContent: "center" }]}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Add document</Text>
            </TouchableOpacity>
          </>
        )}

        {k === "privacy" && [
          ["profile_pub", "Public profile", "Visible to crew & search"],
          ["share_stats", "Share travel stats", "Show on shared profile"],
          ["location_share", "Live location with crew", "Only during active trips"],
        ].map(([key, t, s]) => (
          <ToggleRow key={key} testID={`pri-${key}`} title={t} sub={s} value={toggles[key]} onToggle={() => tog(key)} />
        ))}

        {k === "parental" && (
          <>
            <View style={[styles.card, { backgroundColor: colors.dangerSoft, borderColor: colors.danger + "33" }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Ionicons name="people" size={20} color={colors.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800", color: colors.text }}>Trusted adults can see your live location during trips</Text>
                </View>
              </View>
            </View>
            <ToggleRow testID="par-on" title="Enable parental tracking" sub="Live location during active trips" value={toggles.parental_on} onToggle={() => tog("parental_on")} />
            <ToggleRow testID="par-geo" title="Geofencing alerts" sub="Notify if I leave safe area" value={toggles.geofence} onToggle={() => tog("geofence")} />
            <Text style={styles.section}>Trusted adults</Text>
            {[{n: "Mom", p: "+1 555 123-4567"}, {n: "Dad", p: "+1 555 123-4569"}].map((p, i) => (
              <View key={i} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: colors.danger + "1A" }]}><Ionicons name="heart" size={18} color={colors.danger} /></View>
                <View style={{ flex: 1 }}><Text style={styles.rowT}>{p.n}</Text><Text style={styles.rowS}>{p.p}</Text></View>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              </View>
            ))}
          </>
        )}

        {k === "security" && (
          <>
            <ToggleRow testID="sec-bio" title="Face ID / Biometrics" sub="Unlock app & approve payments" value={toggles.bio} onToggle={() => tog("bio")} />
            <ToggleRow testID="sec-2fa" title="Two-factor authentication" sub="SMS or authenticator app" value={toggles.twofa} onToggle={() => tog("twofa")} />
            <Text style={styles.section}>Roles & permissions</Text>
            <View style={styles.card}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Trip-specific roles (Organizer, Treasurer, Member, Viewer) are managed inside each trip's Members tab.</Text>
            </View>
            <Text style={styles.section}>Active sessions</Text>
            {[{d: "iPhone 15 Pro", l: "Active now", c: colors.success}, {d: "MacBook Pro", l: "2 days ago", c: colors.textMuted}].map((s, i) => (
              <View key={i} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: s.c + "1A" }]}><Ionicons name="phone-portrait" size={18} color={s.c} /></View>
                <View style={{ flex: 1 }}><Text style={styles.rowT}>{s.d}</Text><Text style={styles.rowS}>{s.l}</Text></View>
                {i > 0 && <TouchableOpacity><Text style={{ color: colors.danger, fontWeight: "700", fontSize: 12 }}>Revoke</Text></TouchableOpacity>}
              </View>
            ))}
          </>
        )}

        {k === "notifications" && [
          ["push", "Push notifications", "Expense, payment, SOS alerts"],
          ["email", "Email summaries", "Weekly digest of trips"],
          ["sms", "SMS critical alerts", "Only for SOS & overdue"],
          ["quiet", "Quiet hours", "10 PM – 8 AM local time"],
        ].map(([key, t, s]) => (
          <ToggleRow key={key} testID={`not-${key}`} title={t} sub={s} value={toggles[key]} onToggle={() => tog(key)} />
        ))}

        {k === "payments" && (
          <>
            {CARDS.map((c, i) => (
              <LinearGradient key={i} colors={c.color as any} style={styles.payCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>{c.brand.toUpperCase()}</Text>
                  {c.primary && <View style={styles.primaryTag}><Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>PRIMARY</Text></View>}
                </View>
                <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: 4, marginTop: 24 }}>•••• {c.last4}</Text>
                <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 8 }}>Exp 12/28</Text>
              </LinearGradient>
            ))}
            <TouchableOpacity testID="add-method" onPress={() => Alert.alert("Add", "Card / UPI / Bank")} style={[styles.row, { borderStyle: "dashed", justifyContent: "center" }]}>
              <Ionicons name="add" size={20} color={colors.primary} />
              <Text style={{ color: colors.primary, fontWeight: "700" }}>Add payment method</Text>
            </TouchableOpacity>
          </>
        )}

        {k === "language" && (
          <>
            <Text style={styles.section}>Language</Text>
            <View style={styles.chipWrap}>
              {LANGS.map((l) => (
                <TouchableOpacity key={l.k} testID={`lang-${l.k}`} onPress={() => setLang(l.k)} style={[styles.chip, lang === l.k && styles.chipOn]}>
                  <Text style={[styles.chipT, lang === l.k && { color: "#fff" }]}>{l.v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.section}>Currency</Text>
            <View style={styles.chipWrap}>
              {CURR.map((c) => (
                <TouchableOpacity key={c} testID={`cur-${c}`} onPress={() => setCurr(c)} style={[styles.chip, curr === c && styles.chipOn]}>
                  <Text style={[styles.chipT, curr === c && { color: "#fff" }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {k === "help" && (
          <>
            {[
              { t: "How does Group Pay work?", icon: "qr-code" as const },
              { t: "Recover my account", icon: "key" as const },
              { t: "Currency conversion fees", icon: "swap-horizontal" as const },
              { t: "Refund a trip wallet contribution", icon: "refresh" as const },
              { t: "Contact human support", icon: "chatbubble-ellipses" as const },
            ].map((h, i) => (
              <TouchableOpacity key={i} testID={`help-${i}`} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: colors.primary + "1A" }]}><Ionicons name={h.icon} size={18} color={colors.primary} /></View>
                <Text style={[styles.rowT, { flex: 1 }]}>{h.t}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
              </TouchableOpacity>
            ))}
            <View style={styles.card}><Text style={{ color: colors.textMuted, fontSize: 12, textAlign: "center" }}>System status: All services operational ✓</Text></View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ title, sub, value, onToggle, testID }: any) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowT}>{title}</Text>
        <Text style={styles.rowS}>{sub}</Text>
      </View>
      <Switch testID={testID} value={value} onValueChange={onToggle} trackColor={{ false: colors.surface3, true: colors.primary }} thumbColor="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  hsub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  card: { padding: 14, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  rowIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowT: { fontWeight: "700", color: colors.text },
  rowS: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  section: { fontSize: 13, fontWeight: "800", color: colors.textFaint, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 8 },
  statsBanner: { padding: 18, borderRadius: 22, flexDirection: "row", alignItems: "center" },
  xpBar: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)", marginTop: 10, overflow: "hidden" },
  xpFill: { height: 6, borderRadius: 3, backgroundColor: "#fff" },
  medal: { width: 56, height: 56, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  gridA: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: { width: "31.5%", padding: 12, borderRadius: 16, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  badgeIcon: { width: 50, height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  badgeT: { fontWeight: "800", color: colors.text, fontSize: 12, textAlign: "center" },
  badgeD: { color: colors.textMuted, fontSize: 10, marginTop: 4, textAlign: "center" },
  earnedTag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, height: 17, borderRadius: 9, backgroundColor: colors.success, marginTop: 8 },
  earnedT: { color: "#fff", fontSize: 8, fontWeight: "800", letterSpacing: 0.5 },
  payCard: { padding: 18, borderRadius: 18, marginBottom: 10 },
  primaryTag: { paddingHorizontal: 8, height: 18, borderRadius: 9, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center" },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, height: 38, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipT: { color: colors.text, fontWeight: "700", fontSize: 13 },
});
