export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterScreenState {
  isLoading: boolean;
  error: string | null;
}
