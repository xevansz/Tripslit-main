import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Button from "../../src/components/Button";
import { colors } from "../../src/theme";
import { api } from "../../src/api";

export default function VendorDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [v, setV] = useState<any>(null);
  const [booked, setBooked] = useState(false);

  useEffect(() => { if (id) api.getVendor(id).then(setV).catch(() => {}); }, [id]);
  if (!v) return <SafeAreaView style={styles.safe}><Text style={{ padding: 24 }}>Loading...</Text></SafeAreaView>;

  async function book() {
    try { await api.bookVendor(v.id); setBooked(true); }
    catch (e: any) { Alert.alert("Failed", e.message); }
  }

  if (booked) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <View style={styles.success}><Ionicons name="checkmark" size={56} color="#fff" /></View>
          <Text style={[styles.title, { textAlign: "center", marginTop: 24 }]}>Booking confirmed!</Text>
          <Text style={{ color: colors.textMuted, textAlign: "center", marginTop: 8 }}>{v.name}</Text>
          <View style={{ height: 32 }} />
          <Button testID="vendor-done" title="Done" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.heroWrap}>
          <Image source={{ uri: v.image }} style={styles.hero} />
          <SafeAreaView edges={["top"]} style={styles.heroOverlay}>
            <TouchableOpacity testID="v-back" onPress={() => router.back()} style={styles.heroBtn}><Ionicons name="chevron-back" size={22} color="#fff" /></TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity testID="v-fav" style={styles.heroBtn}><Ionicons name="heart-outline" size={20} color="#fff" /></TouchableOpacity>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{v.name}</Text>
              <Text style={styles.loc}><Ionicons name="location" size={13} color={colors.textMuted} /> {v.location}</Text>
            </View>
            <View style={styles.rating}><Ionicons name="star" size={14} color="#fbbf24" /><Text style={styles.ratingT}>{v.rating}</Text></View>
          </View>

          {v.ar_preview && (
            <TouchableOpacity testID="vendor-ar" onPress={() => Alert.alert("AR/VR Preview", "Loading 360° immersive tour…")} style={styles.arRow}>
              <View style={styles.arIcon}><Ionicons name="cube" size={16} color="#fff" /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.arT}>AR/VR Preview Available</Text>
                <Text style={styles.arS}>Walk through this place in 360°</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}

          <Text style={styles.desc}>{v.description}</Text>

          <Text style={styles.section}>Amenities</Text>
          <View style={styles.amenWrap}>
            {(v.amenities || []).map((a: string) => (
              <View key={a} style={styles.amen}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.amenT}>{a}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>Reviews</Text>
          <View style={styles.review}>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 8 }}>
              <View style={styles.rAv}><Text style={{ color: "#fff", fontWeight: "800" }}>S</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.text }}>Sarah K.</Text>
                <View style={{ flexDirection: "row", gap: 2, marginTop: 2 }}>{[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={11} color="#fbbf24" />)}</View>
              </View>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>Absolutely magical. The view was worth every penny — staff went above and beyond.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bookBar}>
        <View><Text style={styles.priceL}>${v.price}<Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: "500" }}> /{v.category === "Stay" ? "night" : "visit"}</Text></Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>Free cancellation</Text>
        </View>
        <TouchableOpacity testID="vendor-book" onPress={book}>
          <LinearGradient colors={colors.blueGrad as any} style={styles.bookBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>Book now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  heroWrap: { height: 320 },
  hero: { width: "100%", height: "100%" },
  heroOverlay: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", paddingHorizontal: 18 },
  heroBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  body: { padding: 20 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, letterSpacing: -0.3 },
  loc: { color: colors.textMuted, fontSize: 13, marginTop: 4, fontWeight: "500" },
  rating: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, height: 32, borderRadius: 12, backgroundColor: colors.surface },
  ratingT: { fontWeight: "800", color: colors.text },
  arRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16, padding: 12, borderRadius: 14, backgroundColor: colors.primary + "0F", borderWidth: 1, borderColor: colors.primary + "33" },
  arIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  arT: { fontWeight: "800", color: colors.text, fontSize: 14 },
  arS: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  desc: { color: colors.textMuted, fontSize: 14, lineHeight: 22, marginTop: 14 },
  section: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 22, marginBottom: 10 },
  amenWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amen: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, height: 34, borderRadius: 12, backgroundColor: colors.surface },
  amenT: { fontSize: 12, fontWeight: "700", color: colors.text },
  review: { padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  rAv: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  bookBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 28, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  priceL: { fontSize: 22, fontWeight: "800", color: colors.text },
  bookBtn: { paddingHorizontal: 28, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  success: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.success, alignItems: "center", justifyContent: "center" },
});
