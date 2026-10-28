import { Image, Modal, Pressable, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  uri: string | null;
  title?: string;
  closeLabel: string;
  onClose: () => void;
};

/**
 * Full-screen, dark preview of a child's uploaded photo.
 * Tap the backdrop or the close button to dismiss.
 */
export function ChildPhotoPreviewModal({ visible, uri, title, closeLabel, onClose }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
        />
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Text numberOfLines={1} style={styles.title}>
            {title ?? ""}
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel={closeLabel}
          >
            <MaterialCommunityIcons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.imageWrap} pointerEvents="none">
          {uri ? <Image source={{ uri }} style={styles.image} resizeMode="contain" /> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
    zIndex: 1,
  },
  title: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  imageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
