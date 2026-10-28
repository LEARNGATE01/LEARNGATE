import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Dialog, IconButton, Portal, Text } from "react-native-paper";
import { useAppColors } from "@/theme/useAppColors";
import { radii } from "@/theme/theme";
import { formatChildAgeLine } from "@/utils/childBirthday";
import { ChildAvatar } from "@/components/parent/ChildAvatar";

export type ChildSelectOption = {
  id: string;
  name: string;
  avatar_url: string | null;
  birthday?: string | null;
  age?: number | null;
};

type Props = {
  visible: boolean;
  title: string;
  options: ChildSelectOption[];
  onDismiss: () => void;
  onSelect: (childId: string) => void;
  /** Accessibility label for a selectable row, e.g. "Select Marlyn". */
  selectAccessibilityLabel: (name: string) => string;
  /** Enables the trailing delete button when provided. */
  onRemove?: (option: ChildSelectOption) => void;
  removeAccessibilityLabel?: (name: string) => string;
};

/**
 * Single "Select child" dialog used by Manage Children, Live Monitoring and
 * Settings so the picker looks and behaves the same everywhere.
 */
export function ChildSelectDialog({
  visible,
  title,
  options,
  onDismiss,
  onSelect,
  selectAccessibilityLabel,
  onRemove,
  removeAccessibilityLabel,
}: Props) {
  const c = useAppColors();

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
          >
            {options.map((child) => (
              <View
                key={child.id}
                style={[styles.row, { borderColor: c.border, backgroundColor: c.card }]}
              >
                <Pressable
                  style={styles.rowMain}
                  onPress={() => onSelect(child.id)}
                  accessibilityRole="button"
                  accessibilityLabel={selectAccessibilityLabel(child.name)}
                >
                  <ChildAvatar name={child.name} avatarUrl={child.avatar_url} size={44} radius={radii.sm} />
                  <View style={styles.rowText}>
                    <Text variant="titleSmall" style={{ color: c.text, fontWeight: "700" }} numberOfLines={1}>
                      {child.name}
                    </Text>
                    <Text variant="bodySmall" style={{ color: c.subtext }} numberOfLines={1}>
                      {formatChildAgeLine(child)}
                    </Text>
                  </View>
                </Pressable>
                {onRemove ? (
                  <IconButton
                    icon="delete-outline"
                    iconColor="#B91C1C"
                    size={22}
                    onPress={() => onRemove(child)}
                    accessibilityLabel={removeAccessibilityLabel?.(child.name)}
                  />
                ) : null}
              </View>
            ))}
          </ScrollView>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    maxHeight: "85%",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 0,
    maxHeight: 400,
  },
  scroll: {
    maxHeight: 400,
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 8,
  },
  row: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingLeft: 12,
    paddingRight: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
});
