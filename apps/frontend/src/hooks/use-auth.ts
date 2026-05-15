import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService, LoginPayload, RegisterPayload } from '@/services/auth.service';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: async (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      // Cargar perfil completo (incluye driver)
      try {
        const profile = await authService.getProfile();
        useAuthStore.getState().setUser(profile);
      } catch {}
      router.push('/dashboard');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: async (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      try {
        const profile = await authService.getProfile();
        useAuthStore.getState().setUser(profile);
      } catch {}
      router.push('/dashboard');
    },
  });
}

export function useLogout() {
  const { logout, refreshToken } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(refreshToken || undefined),
    onSettled: () => {
      logout();
      router.push('/login');
    },
  });
}

export function useProfile() {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profile = await authService.getProfile();
      setUser(profile);
      return profile;
    },
    enabled: isAuthenticated,
  });
}
