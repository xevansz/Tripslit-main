import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import { colors } from "../../src/theme";
import { api } from "../../src/api";
import { useAuth } from "../../src/auth";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY"];
const LANGS = [{ k: "en", v: "English" }, { k: "es", v: "Español" }, { k: "fr", v: "Français" }, { k: "hi", v: "हिन्दी" }];

export default function ProfileSetup() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!name.trim()) return Alert.alert("Name required");
    setLoading(true);
    try {
      const u = await api.updateProfile({ name, currency, language: lang });
      setUser(u);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Failed", e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 36 }}>
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.sub}>Personalize TripSplit so we can match the right currency, vendors, and crew for you.</Text>

        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={42} color="#fff" />
          </View>
          <TouchableOpacity testID="profile-photo-btn" style={styles.cam}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 28, gap: 16 }}>
          <Input testID="profile-name" label="Display name" placeholder="e.g. Alex Carter" value={name} onChangeText={setName}
            icon={<Ionicons name="person-outline" size={20} color={colors.textMuted} />} />

          <View>
            <Text style={styles.label}>Preferred currency</Text>
            <View style={styles.chipRow}>
              {CURRENCIES.map((c) => (
                <TouchableOpacity key={c} testID={`currency-${c}`} onPress={() => setCurrency(c)}
                  style={[styles.chip, currency === c && styles.chipActive]}>
                  <Text style={[styles.chipText, currency === c && { color: "#fff" }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.label}>Language</Text>
            <View style={styles.chipRow}>
              {LANGS.map((l) => (
                <TouchableOpacity key={l.k} testID={`lang-${l.k}`} onPress={() => setLang(l.k)}
                  style={[styles.chip, lang === l.k && styles.chipActive]}>
                  <Text style={[styles.chipText, lang === l.k && { color: "#fff" }]}>{l.v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={{ height: 30 }} />
        <Button testID="profile-save" title="Continue" onPress={save} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 30, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  sub: { color: colors.textMuted, marginTop: 10, fontSize: 15, lineHeight: 22 },
  avatarWrap: { alignSelf: "center", marginTop: 26, position: "relative" },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  cam: { position: "absolute", right: 0, bottom: 0, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.text, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#fff" },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: 8 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, height: 38, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: "600", fontSize: 13 },
});
