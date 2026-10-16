import { StyleSheet } from "react-native";
import { Card, List } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LEGAL_LAST_UPDATED } from "@/content/legalDocuments";
import { openLegalDocument } from "@/navigation/openLegalDocument";
import { useAppColors } from "@/theme/useAppColors";
import { radii, shadows } from "@/theme/theme";
import { useLocale } from "@/store/LocaleContext";

export function LegalSectionCard() {
  const c = useAppColors();
  const { t } = useLocale();

  return (
    <Card style={[styles.card, { backgroundColor: c.card }, shadows.card]}>
      <Card.Title
        title={t("legal.title")}
        subtitle={t("legal.subtitle", { date: LEGAL_LAST_UPDATED })}
        left={(props) => <MaterialCommunityIcons {...props} name="scale-balance" size={24} color={c.primaryDark} />}
      />
      <Card.Content style={styles.content}>
        <List.Item
          title={t("legal.privacy")}
          description={t("legal.privacyDesc")}
          left={(props) => <List.Icon {...props} icon="shield-account-outline" color={c.primaryDark} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => openLegalDocument("privacy")}
          style={styles.row}
        />
        <List.Item
          title={t("legal.terms")}
          description={t("legal.termsDesc")}
          left={(props) => <List.Icon {...props} icon="file-document-outline" color={c.primaryDark} />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => openLegalDocument("terms")}
          style={styles.row}
        />
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.md,
  },
  content: {
    gap: 4,
    paddingTop: 0,
  },
  row: {
    paddingHorizontal: 0,
  },
});
