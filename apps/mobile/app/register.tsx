import { View, Text, TextInput, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/services/api';

export default function RegisterScreen() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.firstName || !form.lastName) return;
    setLoading(true);
    try {
      const data = await authApi.register(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Únete a TuTaxi</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Nombre"
            placeholderTextColor={theme.colors.textSecondary}
            value={form.firstName}
            onChangeText={(v) => updateField('firstName', v)}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Apellido"
            placeholderTextColor={theme.colors.textSecondary}
            value={form.lastName}
            onChangeText={(v) => updateField('lastName', v)}
          />
        </View>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.email}
          onChangeText={(v) => updateField('email', v)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono (opcional)"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.phone}
          onChangeText={(v) => updateField('phone', v)}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={theme.colors.textSecondary}
          value={form.password}
          onChangeText={(v) => updateField('password', v)}
          secureTextEntry
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creando...' : 'Crear Cuenta'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.xl, justifyContent: 'center', flexGrow: 1 },
  header: { marginBottom: theme.spacing.xxl },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: theme.colors.textSecondary, fontSize: 16, marginTop: theme.spacing.xs },
  form: { gap: theme.spacing.md },
  row: { flexDirection: 'row', gap: theme.spacing.sm },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
  },
  halfInput: { flex: 1 },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontSize: 14,
  },
});
