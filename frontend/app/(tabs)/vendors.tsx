import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../src/theme";
import { api } from "../../src/api";

const CATS = ["All", "Stay", "Food", "ATM", "Activity", "Cab", "eSIM", "Insurance"];

export default function Vendors() {
  const router = useRouter();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(() => {
    api.listVendors(cat === "All" ? undefined : cat, q || undefined).then(setItems).catch(() => {});
  }, [cat, q]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const featured = items[0];
  const rest = items.slice(1);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.header}>
          <Text style={styles.h1}>Discover</Text>
          <Text style={styles.sub}>Hand-picked stays, food & services trusted by travelers</Text>
        </View>

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput testID="vendor-search" placeholder="Search villas, cafes, ATMs..." value={q} onChangeText={setQ} onSubmitEditing={load}
            placeholderTextColor={colors.textFaint} style={{ flex: 1, fontSize: 15, color: colors.text }} />
          <TouchableOpacity testID="vendor-search-go" onPress={load}><Ionicons name="options-outline" size={20} color={colors.text} /></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catsRow}>
          {CATS.map((c) => (
            <TouchableOpacity key={c} testID={`vendor-cat-${c}`} onPress={() => setCat(c)} style={[styles.cat, cat === c && styles.catActive]}>
              <Text style={[styles.catText, cat === c && { color: "#fff" }]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {featured && (
          <TouchableOpacity testID={`vendor-featured-${featured.id}`} onPress={() => router.push({ pathname: "/vendor/[id]", params: { id: featured.id } })}
            style={{ paddingHorizontal: 20, marginTop: 12 }}>
            <View style={styles.featured}>
              <Image source={{ uri: featured.image }} style={styles.featuredImg} />
              <View style={styles.featuredBadge}><Text style={styles.featuredBadgeText}>FEATURED</Text></View>
              <View style={styles.featuredOverlay}>
                <Text style={styles.featuredName}>{featured.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <Ionicons name="star" size={14} color="#fbbf24" />
                  <Text style={styles.featuredMeta}>{featured.rating} · {featured.reviews} reviews</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <Text style={[styles.section, { marginTop: 22 }]}>Nearby</Text>
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {rest.map((v) => (
            <TouchableOpacity key={v.id} testID={`vendor-card-${v.id}`} onPress={() => router.push({ pathname: "/vendor/[id]", params: { id: v.id } })}
              style={styles.row} activeOpacity={0.85}>
              <Image source={{ uri: v.image }} style={styles.rowImg} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{v.name}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <Ionicons name="star" size={12} color="#fbbf24" />
                  <Text style={styles.rowMeta}>{v.rating} ({v.reviews}) · {v.distance}</Text>
                </View>
                <Text style={styles.rowLoc}>{v.location}</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                {v.price > 0 ? (
                  <>
                    <Text style={styles.price}>${v.price}</Text>
                    <Text style={styles.priceSub}>/night</Text>
                  </>
                ) : (
                  <View style={styles.openBadge}><Text style={styles.openText}>OPEN</Text></View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontSize: 28, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  sub: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  search: { marginHorizontal: 20, marginTop: 16, flexDirection: "row", alignItems: "center", gap: 10, height: 50, borderRadius: 16, paddingHorizontal: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  catsRow: { paddingHorizontal: 20, marginTop: 14, gap: 8 },
  cat: { paddingHorizontal: 16, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: "#fff", justifyContent: "center" },
  catActive: { backgroundColor: colors.text, borderColor: colors.text },
  catText: { fontWeight: "700", color: colors.text, fontSize: 13 },
  featured: { borderRadius: 24, overflow: "hidden", height: 220, backgroundColor: colors.surface },
  featuredImg: { width: "100%", height: "100%" },
  featuredBadge: { position: "absolute", top: 14, left: 14, paddingHorizontal: 10, height: 24, backgroundColor: colors.warning, borderRadius: 12, justifyContent: "center" },
  featuredBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  featuredOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "rgba(0,0,0,0.45)" },
  featuredName: { color: "#fff", fontSize: 20, fontWeight: "800" },
  featuredMeta: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontWeight: "600" },
  section: { paddingHorizontal: 20, fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: 10 },
  row: { flexDirection: "row", gap: 12, padding: 10, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  rowImg: { width: 76, height: 76, borderRadius: 14, backgroundColor: colors.surface },
  rowName: { fontWeight: "800", fontSize: 15, color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textMuted, fontWeight: "600" },
  rowLoc: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
  price: { fontSize: 16, fontWeight: "800", color: colors.text },
  priceSub: { fontSize: 11, color: colors.textMuted },
  openBadge: { paddingHorizontal: 10, height: 22, borderRadius: 11, backgroundColor: colors.successSoft, justifyContent: "center" },
  openText: { fontSize: 10, fontWeight: "800", color: colors.success },
});
