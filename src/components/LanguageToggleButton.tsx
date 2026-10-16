import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LOCALE_LABELS, type AppLocale } from "@/i18n/types";
import { useLocale } from "@/store/LocaleContext";
import { colors, radii, shadows } from "@/theme/theme";

const ORDER: AppLocale[] = ["en", "fil"];
const SHORT: Record<AppLocale, string> = { en: "EN", fil: "FIL" };

export function LanguageToggleButton() {
  const { locale, setLocale } = useLocale();

  return (
    <View style={styles.pill}>
      <MaterialCommunityIcons name="translate" size={16} color={colors.primaryDark} style={styles.icon} />
      {ORDER.map((code) => {
        const active = code === locale;
        return (
          <Pressable
            key={code}
            onPress={() => setLocale(code)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={LOCALE_LABELS[code]}
            style={[styles.segment, active && styles.segmentActive]}
            hitSlop={6}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{SHORT[code]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#FFFFFF",
    borderRadius: radii.pill,
    paddingLeft: 6,
    paddingRight: 4,
    paddingVertical: 4,
    ...shadows.card,
  },
  icon: {
    marginRight: 4,
  },
  segment: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  label: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 12,
  },
  labelActive: {
    color: "#FFFFFF",
  },
});
