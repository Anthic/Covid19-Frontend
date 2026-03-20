import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { useMutation } from "@tanstack/react-query";
import type { ILoginInput, IRegisterInput } from "../types/auth.types";
import { loginApi, logoutApi, registerApi } from "../api/auth.api";

// ─── useAuth ─────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const { user, isLoggedIn, clearAuth, setAuth } = useAuthStore();
  return { user, isLoggedIn, clearAuth, setAuth };
};

// ─── useLogin ─────────────────────────────────────────────────────────────────
export const useLogin = () => {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ILoginInput) => loginApi(data),
    onSuccess: (res) => {
      setAuth(res.data.user);
      navigate("/prediction");
    },
  });
};

// ─── useLogout ────────────────────────────────────────────────────────────────
export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: () => {
      clearAuth();
      navigate("/");
    },
    onError: () => {
      // Even if the server call fails, clear local auth state
      clearAuth();
      navigate("/");
    },
  });
};

// ─── useRegister ──────────────────────────────────────────────────────────────
export const useRegister = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: IRegisterInput) => registerApi(data),
    onSuccess: () => {
      // Do NOT call setAuth here — user must explicitly log in after registration
      navigate("/login");
    },
  });
};
