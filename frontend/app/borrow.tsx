import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../src/theme";
import { api } from "../src/api";

interface Loan {
  id: string;
  from_user: string;
  to_user: string;
  amount: number;
  reason: string;
  due_date?: string;
  status: "pending" | "approved" | "rejected" | "settled";
}

export default function Borrow() {
  const router = useRouter();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadBorrows();
    }, []),
  );

  async function loadBorrows() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listBorrows();
      setLoans(data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load loans");
    } finally {
      setLoading(false);
    }
  }

  const netPosition = loans.reduce((sum, l) => {
    if (l.status === "settled") return sum;
    return sum + l.amount;
  }, 0);

  const activeCount = loans.filter((l) => l.status !== "settled").length;
  const overdueCount = loans.filter(
    (l) =>
      l.status === "pending" && l.due_date && new Date(l.due_date) < new Date(),
  ).length;
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity
          testID="b-back"
          onPress={() => router.back()}
          style={styles.back}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.htitle}>Borrow Ledger</Text>
        <TouchableOpacity testID="b-new" style={styles.back}>
          <Ionicons name="add" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <LinearGradient
          colors={colors.blueGrad as any}
          style={styles.summary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 12,
              fontWeight: "700",
            }}
          >
            NET POSITION
          </Text>
          <Text style={styles.netVal}>
            {netPosition >= 0 ? "+" : ""}${Math.abs(netPosition).toFixed(2)}
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <View style={styles.pill}>
              <Text style={styles.pillT}>{activeCount} active loans</Text>
            </View>
            {overdueCount > 0 && (
              <View style={styles.pill}>
                <Text style={styles.pillT}>{overdueCount} overdue</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        <View style={styles.actions}>
          <TouchableOpacity testID="b-request" style={styles.action}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.primary + "1A" },
              ]}
            >
              <Ionicons name="arrow-down" size={20} color={colors.primary} />
            </View>
            <Text style={styles.actionT}>Request</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="b-lend" style={styles.action}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.teal + "1A" },
              ]}
            >
              <Ionicons name="arrow-up" size={20} color={colors.teal} />
            </View>
            <Text style={styles.actionT}>Lend</Text>
          </TouchableOpacity>
          <TouchableOpacity testID="b-remind" style={styles.action}>
            <View
              style={[
                styles.actionIcon,
                { backgroundColor: colors.warning + "1A" },
              ]}
            >
              <Ionicons name="notifications" size={20} color={colors.warning} />
            </View>
            <Text style={styles.actionT}>Remind</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.section}>All loans</Text>
        <View style={{ gap: 10, marginTop: 8 }}>
          {loading ? (
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                padding: 20,
              }}
            >
              Loading...
            </Text>
          ) : loans.length === 0 ? (
            <Text
              style={{
                color: colors.textMuted,
                textAlign: "center",
                padding: 20,
              }}
            >
              No loans yet
            </Text>
          ) : (
            loans.map((l) => {
              const isOverdue =
                l.due_date &&
                new Date(l.due_date) < new Date() &&
                l.status !== "settled";
              const otherParty = l.from_user === currentUser ? l.to_user : l.from_user;
              return (
                <View key={l.id} style={styles.loan}>
                  <View style={styles.av}>
                    <Text style={{ color: "#fff", fontWeight: "800" }}>
                      {otherParty.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text style={styles.lName}>{otherParty}</Text>
                      {l.status === "settled" && (
                        <View
                          style={[
                            styles.tag,
                            { backgroundColor: colors.successSoft },
                          ]}
                        >
                          <Text
                            style={[styles.tagT, { color: colors.success }]}
                          >
                            SETTLED
                          </Text>
                        </View>
                      )}
                      {isOverdue && (
                        <View
                          style={[
                            styles.tag,
                            { backgroundColor: colors.dangerSoft },
                          ]}
                        >
                          <Text style={[styles.tagT, { color: colors.danger }]}>
                            OVERDUE
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.lMeta}>
                      {l.reason} {l.due_date ? `· due ${l.due_date}` : ""}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.lAmt,
                      l.status === "settled" && {
                        color: colors.textMuted,
                        textDecorationLine: "line-through",
                      },
                    ]}
                  >
                    ${l.amount}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  htitle: { fontSize: 17, fontWeight: "800", color: colors.text },
  summary: { padding: 20, borderRadius: 22 },
  netVal: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
  },
  pillT: { color: "#fff", fontSize: 11, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  action: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  actionT: { fontSize: 12, fontWeight: "700", color: colors.text },
  section: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginTop: 22,
  },
  loan: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
  },
  av: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  lName: { fontWeight: "800", color: colors.text },
  lMeta: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  lAmt: { fontWeight: "800", color: colors.text, fontSize: 16 },
  tag: {
    paddingHorizontal: 7,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
  },
  tagT: { fontSize: 9, fontWeight: "800" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.dangerSoft,
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
