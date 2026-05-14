import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { api } from '@/services/api';

export default function RequestRideScreen() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);

  const handleRequest = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const { data } = await api.post('/rides/request', {
        originAddress: origin,
        destinationAddress: destination,
        originLat: 40.4168,
        originLng: -3.7038,
        destinationLat: 40.4530,
        destinationLng: -3.6883,
      });
      setEstimate(data.estimate);
      router.push(`/ride-tracking?id=${data.ride.id}`);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Error al solicitar viaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿A dónde vamos?</Text>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapText}>Mapa</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="📍 Origen"
          placeholderTextColor={theme.colors.textSecondary}
          value={origin}
          onChangeText={setOrigin}
        />
        <TextInput
          style={styles.input}
          placeholder="📌 Destino"
          placeholderTextColor={theme.colors.textSecondary}
          value={destination}
          onChangeText={setDestination}
        />

        {estimate && (
          <View style={styles.estimateCard}>
            <View style={styles.estimateRow}>
              <Text style={styles.estimateLabel}>{estimate.distance} km</Text>
              <Text style={styles.estimateLabel}>{estimate.duration} min</Text>
              <Text style={styles.estimatePrice}>${estimate.price}</Text>
            </View>
          </View>
        )}

        <Pressable
          style={[styles.button, loading && { opacity: 0.5 }]}
          onPress={handleRequest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Buscando...' : 'Solicitar Viaje'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.xl, paddingTop: 60 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: theme.spacing.md },
  mapPlaceholder: { height: 180, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, justifyContent: 'center', alignItems: 'center', marginBottom: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  mapIcon: { fontSize: 40 },
  mapText: { color: theme.colors.textSecondary, marginTop: 8 },
  form: { gap: theme.spacing.md },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, color: theme.colors.text, fontSize: 16 },
  estimateCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.border },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  estimateLabel: { color: theme.colors.textSecondary, fontSize: 14 },
  estimatePrice: { color: theme.colors.primary, fontSize: 16, fontWeight: 'bold' },
  button: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, borderRadius: theme.borderRadius.full, alignItems: 'center', marginTop: theme.spacing.sm },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
