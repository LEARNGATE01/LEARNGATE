import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NotificationBell } from "@/components/NotificationBell";
import { useAppColors } from "@/theme/useAppColors";
import { useLocale } from "@/store/LocaleContext";
import { radii, shadows } from "@/theme/theme";

type Props = {
  title: string;
  name?: string | null;
  showGreeting?: boolean;
  notificationsEnabled?: boolean;
};

export function ParentGradientHeader({
  title,
  name,
  showGreeting = false,
  notificationsEnabled = true,
}: Props) {
  const c = useAppColors();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const greeting = name ? t("parent.greeting", { name }) : null;
  const heading = showGreeting && greeting ? greeting : title;

  return (
    <LinearGradient
      colors={[...c.heroGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.outer, { paddingTop: insets.top + 14 }]}
    >
      <View style={styles.row}>
        <Text variant="titleLarge" style={styles.title} numberOfLines={1}>
          {heading}
        </Text>
        {notificationsEnabled ? <NotificationBell enabled variant="header" /> : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    paddingHorizontal: 16,
    paddingBottom: 18,
    ...shadows.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    minHeight: 68,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
