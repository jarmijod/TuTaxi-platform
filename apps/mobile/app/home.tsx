import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/auth.store';

export default function HomeScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.firstName} 👋</Text>
          <Text style={styles.role}>{user?.role?.name}</Text>
        </View>
        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>¿A dónde vamos?</Text>

      <Pressable style={styles.searchBar}>
        <Text style={styles.searchText}>Buscar destino...</Text>
      </Pressable>

      <View style={styles.quickActions}>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>🏠</Text>
          <Text style={styles.actionLabel}>Casa</Text>
        </View>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>💼</Text>
          <Text style={styles.actionLabel}>Trabajo</Text>
        </View>
        <View style={styles.actionCard}>
          <Text style={styles.actionIcon}>⭐</Text>
          <Text style={styles.actionLabel}>Favoritos</Text>
        </View>
      </View>

      <Pressable style={styles.profileCard} onPress={() => router.push('/profile')}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </Pressable>
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
  quickActions: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.xl },
  actionCard: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  actionIcon: { fontSize: 24, marginBottom: theme.spacing.xs },
  actionLabel: { color: theme.colors.text, fontSize: 12 },
  profileCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  profileName: { color: theme.colors.text, fontWeight: '600' },
  profileEmail: { color: theme.colors.textSecondary, fontSize: 12 },
  arrow: { color: theme.colors.textSecondary, fontSize: 18 },
});
