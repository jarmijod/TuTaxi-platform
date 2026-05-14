import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '@/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola 👋</Text>
        <Text style={styles.title}>¿A dónde vamos?</Text>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    paddingTop: 60,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  greeting: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: theme.spacing.xs,
  },
  searchBar: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  searchText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: theme.spacing.xs,
  },
  actionLabel: {
    color: theme.colors.text,
    fontSize: 12,
  },
});
