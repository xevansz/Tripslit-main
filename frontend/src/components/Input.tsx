import React from "react";
import { View, Text, TextInput, StyleSheet, TextInputProps } from "react-native";
import { colors, radius } from "../theme";

type Props = TextInputProps & {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
};
export default function Input({ label, icon, error, style, ...rest }: Props) {
  return (
    <View style={{ width: "100%" }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.box, error ? { borderColor: colors.danger } : null]}>
        {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
        <TextInput
          placeholderTextColor={colors.textFaint}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: "600", color: colors.textMuted, marginBottom: 6 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 52,
  },
  input: { flex: 1, fontSize: 16, color: colors.text },
  error: { color: colors.danger, fontSize: 12, marginTop: 4 },
});
