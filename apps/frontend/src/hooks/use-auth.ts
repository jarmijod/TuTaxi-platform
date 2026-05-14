import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService, LoginPayload, RegisterPayload } from '@/services/auth.service';

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
      router.push('/dashboard');
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken, data.refreshToken);
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
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
  });
}
