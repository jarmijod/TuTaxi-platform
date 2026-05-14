import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { theme } from '@/theme';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.replace('/home');
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Iniciando...' : 'Iniciar Sesión'}
          </Text>
        </Pressable>

        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  header: { marginBottom: theme.spacing.xxl },
  title: { color: theme.colors.text, fontSize: 28, fontWeight: 'bold' },
  subtitle: { color: theme.colors.textSecondary, fontSize: 16, marginTop: theme.spacing.xs },
  form: { gap: theme.spacing.md },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    color: theme.colors.text,
    fontSize: 16,
  },
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
