import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/auth.store';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.firstName} 👋</Text>
          <Text style={styles.role}>{user?.role?.name}</Text>
        </View>
        <Pressable onPress={() => { logout(); router.replace('/'); }}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>¿A dónde vamos?</Text>

      <Pressable style={styles.searchBar} onPress={() => router.push('/request-ride')}>
        <Text style={styles.searchText}>Buscar destino...</Text>
      </Pressable>

      <View style={styles.quickActions}>
        <Pressable style={styles.actionCard} onPress={() => router.push('/request-ride')}>
          <Text style={styles.actionIcon}>🚕</Text>
          <Text style={styles.actionLabel}>Pedir Taxi</Text>
        </Pressable>
        <Pressable style={styles.actionCard}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionLabel}>Historial</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => router.push('/profile')}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionLabel}>Perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl },
  greeting: { color: theme.colors.text, fontSize: 20, fontWeight: 'bold' },
  role: { color: theme.colors.textSecondary, fontSize: 14, marginTop: 2 },
  logoutText: { color: theme.colors.textSecondary, fontSize: 14 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: theme.spacing.md },
  searchBar: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.xl },
  searchText: { color: theme.colors.textSecondary, fontSize: 16 },
  quickActions: { flexDirection: 'row', gap: theme.spacing.md },
  actionCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  actionIcon: { fontSize: 24, marginBottom: theme.spacing.xs },
  actionLabel: { color: theme.colors.text, fontSize: 12 },
});
