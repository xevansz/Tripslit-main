import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../../../src/theme";
import { api } from "../../../src/api";

const TITLES: Record<string, { t: string; sub: string; icon: any; color: string }> = {
  journal: { t: "Smart Journal", sub: "AI-summarised travel memories", icon: "book", color: "#8B5CF6" },
  itinerary: { t: "Itinerary", sub: "Plans · timings · routes", icon: "map", color: colors.primary },
  packing: { t: "Packing Checklist", sub: "Group-coordinated gear", icon: "briefcase", color: colors.teal },
  polls: { t: "Group Polls", sub: "Decide together, faster", icon: "bar-chart", color: colors.warning },
  chat: { t: "Group Chat", sub: "Crew conversation", icon: "chatbubbles", color: "#EC4899" },
  album: { t: "Photo Album", sub: "Auto collages + map pins", icon: "images", color: colors.primary },
  settlement: { t: "UPI Settlement", sub: "Realtime peer settlement", icon: "swap-horizontal", color: colors.success },
  reports: { t: "Trip Reports", sub: "Exportable analytics", icon: "stats-chart", color: "#0F172A" },
};

export default function TripTool() {
  const router = useRouter();
  const { id, k } = useLocalSearchParams<{ id: string; k: string }>();
  const [data, setData] = useState<any>(null);
  const [text, setText] = useState("");
  const meta = TITLES[k as string] || TITLES.journal;

  useEffect(() => {
    if (id) api.tripTools(id as string).then(setData).catch(() => {});
  }, [id]);

  if (!data) return <SafeAreaView style={styles.safe}><Text style={{ padding: 24 }}>Loading…</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity testID="tool-back" onPress={() => router.back()} style={styles.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></TouchableOpacity>
        <View style={[styles.titleIcon, { backgroundColor: meta.color + "1A" }]}>
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.htitle}>{meta.t}</Text>
          <Text style={styles.hsub}>{meta.sub}</Text>
        </View>
        {k === "itinerary" && (
          <TouchableOpacity testID="cal-sync" onPress={() => Alert.alert("Synced", "Itinerary added to Google Calendar")} style={styles.action}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
        {k === "reports" && (
          <TouchableOpacity testID="export" onPress={() => Alert.alert("Exported", "Report exported as PDF")} style={styles.action}>
            <Ionicons name="download" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={88}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: k === "chat" ? 20 : 40, gap: 12 }}>

        {k === "journal" && (data.journal || []).map((j: any) => (
          <View key={j.id} style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={styles.dateChip}><Text style={styles.dateChipT}>{j.date}</Text></View>
                {j.auto && <View style={styles.aiTag}><Ionicons name="sparkles" size={10} color="#fff" /><Text style={styles.aiTagT}>AI</Text></View>}
              </View>
              <Text style={styles.cardSpend}>${j.expenses}</Text>
            </View>
            <Text style={styles.cardTitle}>{j.title}</Text>
            <Text style={styles.cardBody}>{j.summary}</Text>
            <View style={styles.cardFoot}>
              <Ionicons name="image-outline" size={14} color={colors.textMuted} />
              <Text style={styles.cardFootT}>{j.photos} photos</Text>
            </View>
          </View>
        ))}

        {k === "itinerary" && (data.itinerary || []).map((d: any) => (
          <View key={d.day} style={styles.card}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={styles.dayT}>Day {d.day}</Text>
              <Text style={styles.dateChipT}>{d.date}</Text>
            </View>
            {d.items.map((it: any, i: number) => (
              <View key={i} style={styles.tlRow}>
                <View style={styles.tlTime}><Text style={styles.tlTimeT}>{it.time}</Text></View>
                <View style={[styles.tlDot, i === 0 && { backgroundColor: colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.tlTitle}>{it.title}</Text>
                  <Text style={styles.tlLoc}><Ionicons name="location-outline" size={11} color={colors.textMuted} /> {it.loc}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}

        {k === "packing" && (
          <>
            <View style={styles.progressTop}>
              <Text style={styles.progressTopT}>{(data.packing.filter((p: any) => p.checked).length)} of {data.packing.length} packed</Text>
              <View style={styles.progBg}><View style={[styles.progFill, { width: `${(data.packing.filter((p: any) => p.checked).length / data.packing.length) * 100}%` }]} /></View>
            </View>
            {data.packing.map((p: any) => (
              <TouchableOpacity key={p.id} testID={`pack-${p.id}`} style={[styles.packRow, p.checked && { opacity: 0.5 }]}>
                <View style={[styles.checkbox, p.checked && styles.checkboxOn]}>{p.checked && <Ionicons name="checkmark" size={14} color="#fff" />}</View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.packT, p.checked && { textDecorationLine: "line-through" }]}>{p.label}</Text>
                  <Text style={styles.packM}>{p.assigned} · {p.category}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {k === "polls" && (data.polls || []).map((p: any) => {
          const total = p.options.reduce((s: number, o: any) => s + o.votes, 0);
          return (
            <View key={p.id} style={styles.card}>
              <Text style={styles.pollQ}>{p.question}</Text>
              {p.options.map((o: any, i: number) => {
                const pct = total ? Math.round((o.votes / total) * 100) : 0;
                const voted = p.voted === o.label;
                return (
                  <TouchableOpacity key={i} testID={`vote-${p.id}-${i}`} style={styles.voteOpt} activeOpacity={0.85}>
                    <View style={[styles.voteBar, { width: `${pct}%`, backgroundColor: voted ? colors.primary + "33" : colors.surface2 }]} />
                    <View style={styles.voteRow}>
                      <Text style={[styles.voteT, voted && { fontWeight: "800", color: colors.primary }]}>{o.label}</Text>
                      <Text style={styles.voteV}>{o.votes} · {pct}%</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              <Text style={styles.pollFoot}><Ionicons name="time-outline" size={11} color={colors.textMuted} /> Ends {p.ends}</Text>
            </View>
          );
        })}

        {k === "chat" && (data.chat || []).map((m: any, i: number) => {
          const me = m.from === "Me";
          return (
            <View key={m.id} style={[styles.chatBubble, me ? styles.chatMe : styles.chatThem]}>
              {!me && <Text style={styles.chatFrom}>{m.from}</Text>}
              <Text style={[styles.chatText, me && { color: "#fff" }]}>{m.text}</Text>
              <Text style={[styles.chatTime, me && { color: "rgba(255,255,255,0.7)" }]}>{m.time}</Text>
            </View>
          );
        })}

        {k === "album" && (
          <>
            <View style={styles.mapMock}>
              <LinearGradient colors={["#DBEAFE", "#CCFBF1"]} style={StyleSheet.absoluteFill as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
              {data.album.map((a: any, i: number) => (
                <View key={a.id} style={[styles.pin, { left: 30 + (i * 45) % 280, top: 30 + (i * 35) % 140 }]}>
                  <Ionicons name="location" size={20} color={colors.danger} />
                </View>
              ))}
              <View style={styles.mapBadge}><Ionicons name="map" size={12} color="#fff" /><Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>{data.album.length} pins</Text></View>
            </View>
            <View style={styles.gridWrap}>
              {data.album.map((a: any) => (
                <View key={a.id} style={styles.gridItem}>
                  <Image source={{ uri: a.image }} style={{ width: "100%", height: "100%" }} />
                  <View style={styles.gridOverlay}>
                    <Text style={styles.gridT} numberOfLines={1}>{a.loc}</Text>
                    <Text style={styles.gridBy}>by {a.by}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {k === "settlement" && (
          <>
            <View style={styles.upiCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={styles.upiBadge}><Ionicons name="flash" size={18} color="#fff" /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upiT}>UPI Realtime Settlement</Text>
                  <Text style={styles.upiS}>Instant peer-to-peer · Zero fees</Text>
                </View>
              </View>
            </View>
            {data.settlement.map((s: any) => (
              <View key={s.id} style={styles.card}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={styles.av}><Text style={{ color: "#fff", fontWeight: "800" }}>{s.from.charAt(0)}</Text></View>
                  <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
                  <View style={[styles.av, { backgroundColor: colors.teal }]}><Text style={{ color: "#fff", fontWeight: "800" }}>{s.to.charAt(0)}</Text></View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={styles.setT}>{s.from} → {s.to}</Text>
                    <Text style={styles.setM}>{s.method} · {s.ref}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.setA}>${s.amount.toFixed(2)}</Text>
                    <View style={[styles.statusTag, { backgroundColor: s.status === "completed" ? colors.successSoft : colors.warningSoft }]}>
                      <Text style={[styles.statusT, { color: s.status === "completed" ? colors.success : colors.warning }]}>{s.status.toUpperCase()}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {k === "reports" && (
          <>
            <LinearGradient colors={colors.blueGrad as any} style={styles.repHero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "800", letterSpacing: 1 }}>TOTAL TRIP SPEND</Text>
              <Text style={styles.repHeroV}>${data.reports.totals.total}</Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 }}>${data.reports.totals.per_member} avg per member</Text>
            </LinearGradient>
            <Text style={styles.section}>By category</Text>
            <View style={styles.card}>
              {data.reports.by_category.map((c: any) => (
                <View key={c.k} style={{ marginVertical: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "700", color: colors.text }}>{c.k}</Text>
                    <Text style={{ fontWeight: "800", color: colors.text }}>${c.v}</Text>
                  </View>
                  <View style={[styles.progBg, { marginTop: 6 }]}><View style={[styles.progFill, { width: `${(c.v / data.reports.totals.total) * 100}%`, backgroundColor: c.c }]} /></View>
                </View>
              ))}
            </View>
            <View style={[styles.card, { flexDirection: "row", gap: 16 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.statL}>TOP SPENDER</Text>
                <Text style={styles.statV}>{data.reports.top_spender}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statL}>SAVINGS VS AVG</Text>
                <Text style={[styles.statV, { color: colors.success }]}>↓ {data.reports.savings_vs_avg}%</Text>
              </View>
            </View>
            <TouchableOpacity testID="export-pdf" onPress={() => Alert.alert("Exported", "Report saved to your device")} style={styles.exportBtn}>
              <LinearGradient colors={colors.blueGrad as any} style={styles.exportBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="download" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>Export PDF + CSV</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      {k === "chat" && (
        <View style={styles.chatInputRow}>
          <View style={styles.chatInput}>
            <TextInput placeholder="Message your crew…" value={text} onChangeText={setText} placeholderTextColor={colors.textFaint} style={{ flex: 1, color: colors.text, fontSize: 14 }} />
          </View>
          <TouchableOpacity testID="chat-send" onPress={() => setText("")} style={styles.chatSend}>
            <LinearGradient colors={colors.blueGrad as any} style={styles.chatSendBg} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="arrow-up" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 8, gap: 10 },
  back: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  titleIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  hsub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  action: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary + "1A", alignItems: "center", justifyContent: "center" },
  card: { padding: 16, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 8 },
  cardBody: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 6 },
  cardFoot: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 10 },
  cardFootT: { color: colors.textMuted, fontSize: 12, fontWeight: "600" },
  cardSpend: { color: colors.primary, fontWeight: "800", fontSize: 14 },
  dateChip: { paddingHorizontal: 8, height: 22, borderRadius: 11, backgroundColor: colors.surface2, justifyContent: "center" },
  dateChipT: { fontSize: 11, fontWeight: "800", color: colors.text },
  aiTag: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, height: 18, borderRadius: 9, backgroundColor: "#8B5CF6" },
  aiTagT: { color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
  dayT: { fontSize: 18, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  tlRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border },
  tlTime: { width: 50 },
  tlTimeT: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  tlDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.surface3, marginTop: 4 },
  tlTitle: { fontWeight: "700", color: colors.text, fontSize: 14 },
  tlLoc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  progressTop: { padding: 14, borderRadius: 16, backgroundColor: colors.surface },
  progressTopT: { fontSize: 13, fontWeight: "700", color: colors.text },
  progBg: { height: 8, borderRadius: 4, backgroundColor: colors.surface2, marginTop: 8, overflow: "hidden" },
  progFill: { height: 8, borderRadius: 4, backgroundColor: colors.primary },
  packRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: colors.success, borderColor: colors.success },
  packT: { fontWeight: "700", color: colors.text },
  packM: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  pollQ: { fontWeight: "800", fontSize: 16, color: colors.text, marginBottom: 12 },
  voteOpt: { borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface, marginBottom: 8, height: 44 },
  voteBar: { position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 12 },
  voteRow: { flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14 },
  voteT: { fontWeight: "700", color: colors.text },
  voteV: { fontWeight: "700", color: colors.textMuted, fontSize: 12 },
  pollFoot: { color: colors.textMuted, fontSize: 11, marginTop: 8, fontWeight: "600" },
  chatBubble: { padding: 12, borderRadius: 18, maxWidth: "82%" },
  chatThem: { alignSelf: "flex-start", backgroundColor: colors.surface, borderBottomLeftRadius: 6 },
  chatMe: { alignSelf: "flex-end", backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  chatFrom: { fontSize: 11, fontWeight: "800", color: colors.primary, marginBottom: 4 },
  chatText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  chatTime: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  chatInputRow: { flexDirection: "row", padding: 14, gap: 8, alignItems: "center", borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: "#fff" },
  chatInput: { flex: 1, height: 44, borderRadius: 22, backgroundColor: colors.surface, paddingHorizontal: 14, justifyContent: "center" },
  chatSend: { width: 44, height: 44 },
  chatSendBg: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  mapMock: { height: 200, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: colors.border, position: "relative" },
  pin: { position: "absolute", width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  mapBadge: { position: "absolute", bottom: 10, right: 10, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: colors.text, justifyContent: "center" },
  gridWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  gridItem: { width: "48.5%", aspectRatio: 1, borderRadius: 14, overflow: "hidden", backgroundColor: colors.surface, position: "relative" },
  gridOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 8, backgroundColor: "rgba(0,0,0,0.5)" },
  gridT: { color: "#fff", fontSize: 11, fontWeight: "800" },
  gridBy: { color: "rgba(255,255,255,0.8)", fontSize: 10, marginTop: 1 },
  upiCard: { padding: 14, borderRadius: 16, backgroundColor: colors.successSoft, borderWidth: 1, borderColor: colors.success + "33" },
  upiBadge: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
  upiT: { fontWeight: "800", color: colors.text },
  upiS: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  av: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  setT: { fontWeight: "800", color: colors.text, fontSize: 14 },
  setM: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  setA: { fontWeight: "800", color: colors.text },
  statusTag: { paddingHorizontal: 7, height: 18, borderRadius: 9, justifyContent: "center", marginTop: 4 },
  statusT: { fontSize: 9, fontWeight: "800" },
  repHero: { padding: 22, borderRadius: 22 },
  repHeroV: { color: "#fff", fontSize: 36, fontWeight: "800", marginTop: 6, letterSpacing: -1 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text },
  statL: { color: colors.textMuted, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  statV: { color: colors.text, fontSize: 18, fontWeight: "800", marginTop: 6 },
  exportBtn: { marginTop: 4 },
  exportBg: { height: 50, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
});
