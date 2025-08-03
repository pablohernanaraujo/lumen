export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginScreenState {
  isLoading: boolean;
  error: string | null;
}
