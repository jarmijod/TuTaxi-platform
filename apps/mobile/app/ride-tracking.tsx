import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { theme } from '@/theme';
import { api } from '@/services/api';

const statusConfig: Record<string, { label: string; icon: string }> = {
  SEARCHING_DRIVER: { label: 'Buscando conductor...', icon: '🔍' },
  DRIVER_ASSIGNED: { label: 'Conductor asignado', icon: '✅' },
  DRIVER_ARRIVING: { label: 'En camino', icon: '🚗' },
  WAITING_PASSENGER: { label: 'Esperándote', icon: '⏳' },
  IN_PROGRESS: { label: 'En viaje', icon: '🛣️' },
  COMPLETED: { label: 'Completado', icon: '🎉' },
  CANCELLED: { label: 'Cancelado', icon: '❌' },
};

export default function RideTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ride, setRide] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const fetchRide = async () => {
      const { data } = await api.get(`/rides/${id}`);
      setRide(data);
    };
    fetchRide();
    const interval = setInterval(fetchRide, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!ride) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Cargando...</Text>
      </View>
    );
  }

  const status = statusConfig[ride.status] || statusConfig.SEARCHING_DRIVER;
  const isActive = !['COMPLETED', 'CANCELLED'].includes(ride.status);

  return (
    <View style={styles.container}>
      {/* Map placeholder */}
      <View style={styles.map}>
        <Text style={{ fontSize: 50 }}>{status.icon}</Text>
      </View>

      {/* Status */}
      <View style={styles.card}>
        <Text style={styles.statusText}>{status.label}</Text>
        <View style={styles.route}>
          <Text style={styles.routeText}>📍 {ride.originAddress}</Text>
          <Text style={styles.routeText}>📌 {ride.destinationAddress}</Text>
        </View>
        <View style={styles.stats}>
          <Text style={styles.stat}>{ride.distance} km</Text>
          <Text style={styles.stat}>{ride.duration} min</Text>
          <Text style={[styles.stat, { color: theme.colors.primary }]}>${ride.price}</Text>
        </View>
      </View>

      {/* Driver */}
      {ride.driver && (
        <View style={styles.card}>
          <Text style={styles.driverName}>
            {ride.driver.user.firstName} {ride.driver.user.lastName}
          </Text>
          <Text style={styles.driverInfo}>⭐ {ride.driver.rating}</Text>
        </View>
      )}

      {isActive && (
        <Pressable style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl, paddingTop: 60 },
  loading: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 100 },
  map: { height: 200, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.lg, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  statusText: { color: theme.colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: theme.spacing.md },
  route: { gap: 4, marginBottom: theme.spacing.md },
  routeText: { color: theme.colors.textSecondary, fontSize: 14 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { color: theme.colors.text, fontWeight: '600' },
  driverName: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  driverInfo: { color: theme.colors.textSecondary, marginTop: 4 },
  cancelBtn: { borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center' },
  cancelText: { color: '#ef4444', fontWeight: '600' },
});
