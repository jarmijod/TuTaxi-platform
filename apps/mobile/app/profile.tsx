import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/auth.store';

export default function ProfileScreen() {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Volver</Text>
      </Pressable>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.role}>{user?.role?.name}</Text>
      </View>

      <View style={styles.card}>
        <InfoRow label="Email" value={user?.email || ''} />
        <InfoRow label="Rol" value={user?.role?.name || ''} />
      </View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl, paddingTop: 60 },
  backBtn: { marginBottom: theme.spacing.xl },
  backText: { color: theme.colors.textSecondary, fontSize: 16 },
  avatarContainer: { alignItems: 'center', marginBottom: theme.spacing.xl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.md },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: 'bold' },
  role: { color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  infoLabel: { color: theme.colors.textSecondary, fontSize: 14 },
  infoValue: { color: theme.colors.text, fontSize: 14 },
});
