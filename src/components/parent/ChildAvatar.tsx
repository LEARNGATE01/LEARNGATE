import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { useAppColors } from "@/theme/useAppColors";

type Props = {
  name: string;
  avatarUrl?: string | null;
  /** Square edge length in dp. */
  size?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  /** When provided the avatar becomes tappable (e.g. to open a photo preview). */
  onPress?: () => void;
  accessibilityLabel?: string;
};

/**
 * Child profile picture used across the parent tabs.
 * Renders the uploaded photo, or the child's initial when no photo exists.
 */
export function ChildAvatar({
  name,
  avatarUrl,
  size = 48,
  radius = 12,
  style,
  onPress,
  accessibilityLabel,
}: Props) {
  const c = useAppColors();
  const boxStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    backgroundColor: c.sectionIconBg,
  };

  const content = avatarUrl ? (
    <Image source={{ uri: avatarUrl }} style={{ width: size, height: size }} resizeMode="cover" />
  ) : (
    <View style={[styles.fallback, { backgroundColor: c.primary }]}>
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.42) }]}>
        {(name || "?").slice(0, 1).toUpperCase()}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="imagebutton"
        accessibilityLabel={accessibilityLabel ?? name}
        style={({ pressed }) => [boxStyle, styles.clip, style, pressed && styles.pressed]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[boxStyle, styles.clip, style]}>{content}</View>;
}

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.8,
  },
});
