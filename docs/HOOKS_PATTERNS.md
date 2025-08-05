# 🎣 Hooks Patterns Documentation - Lumen

> Documentación completa de los patrones de hooks implementados en el proyecto Lumen

## 📚 Tabla de Contenidos

1. [Arquitectura General](#arquitectura-general)
2. [Patrones Implementados](#patrones-implementados)
3. [Custom Hooks](#custom-hooks)
4. [Higher-Order Patterns](#higher-order-patterns)
5. [Context + State Management](#context--state-management)
6. [Optimización y Performance](#optimización-y-performance)
7. [Guías de Uso](#guías-de-uso)
8. [Best Practices](#best-practices)
9. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## 🏗️ Arquitectura General

El proyecto Lumen implementa una arquitectura basada en hooks con los siguientes principios:

- **Separación de responsabilidades**: Cada hook tiene una responsabilidad específica
- **Tipado fuerte**: Todos los hooks están completamente tipados con TypeScript
- **Optimización automática**: Uso estratégico de memoización
- **Reutilización**: Patrones diseñados para máxima reutilización
- **Error handling**: Validaciones y manejo de errores integrado

```
src/
├── theme/
│   ├── theme-provider.tsx    # Context + useTheme hook
│   ├── make-styles.ts        # Higher-order hook factory
│   └── types.ts             # Type definitions
├── screens/
│   └── */                   # Implementación de patrones
└── ui/
    └── */                   # Componentes con hooks
```

---

## 🎯 Patrones Implementados

### 1. **Custom Context Hook Pattern**

### 2. **Higher-Order Hook Factory Pattern**

### 3. **State Management Pattern**

### 4. **Side Effects Pattern**

### 5. **Optimized Memoization Pattern**

---

## 🔧 Custom Hooks

### `useTheme` - Theme Context Hook

**Ubicación**: `src/theme/theme-provider.tsx`

```typescript
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

#### **Características**:

- ✅ Acceso type-safe al contexto de tema
- ✅ Validación automática de contexto
- ✅ Error handling con mensajes descriptivos
- ✅ Retorna tema, modo, y funciones de control

#### **Uso**:

```typescript
const { theme, mode, setMode, toggleMode } = useTheme();
```

#### **Propiedades Disponibles**:

```typescript
interface ThemeContextValue {
  theme: Theme; // Objeto completo del tema
  mode: Mode; // 'light' | 'dark'
  setMode: (mode: Mode) => void; // Cambiar modo específico
  toggleMode: () => void; // Alternar entre modos
}
```

---

## 🏭 Higher-Order Patterns

### `makeStyles` - Style Hook Factory

**Ubicación**: `src/theme/make-styles.ts`

```typescript
export const makeStyles =
  <T extends NamedStyles<T>>(
    factory: StylesOrFunction<T>,
  ): (() => StyleSheet.NamedStyles<T>) =>
  (): StyleSheet.NamedStyles<T> => {
    const { theme } = useTheme();

    const styles =
      typeof factory === 'function'
        ? (factory as (theme: Theme) => T)(theme)
        : factory;

    return StyleSheet.create(styles);
  };
```

#### **Características**:

- 🎨 Integración automática con sistema de tema
- 🔄 Soporte para estilos estáticos y dinámicos
- 🚀 Optimización automática con StyleSheet.create
- 📝 Tipado genérico completo
- ♻️ Reutilizable en cualquier componente

#### **Tipos Soportados**:

```typescript
type StylesOrFunction<T extends NamedStyles<T>> =
  | T                    // Estilos estáticos
  | (theme: Theme) => T; // Función que recibe tema
```

#### **Uso - Estilos Dinámicos**:

```typescript
const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.size.md,
  },
}));

// En componente
const styles = useStyles();
```

#### **Uso - Estilos Estáticos**:

```typescript
const useStyles = makeStyles({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
```

---

## 📊 Context + State Management

### ThemeProvider Implementation

**Ubicación**: `src/theme/theme-provider.tsx`

```typescript
export const ThemeProvider: FC<ThemeProviderProps> = ({
  children,
  preference,
  persistenceKey = '@lumen-theme',
}) => {
  // 1. System integration
  const systemMode = useColorScheme() as Mode | null;

  // 2. User preference state
  const [userMode, setUserMode] = useState<Mode | null>(preference || null);

  // 3. Computed current mode
  const currentMode: Mode = userMode ?? systemMode ?? 'light';

  // 4. Memoized theme object
  const theme = useMemo<Theme>(
    () => ({
      ...baseTokens,
      colors: colorTokens[currentMode],
      mode: currentMode,
    }),
    [currentMode],
  );

  // 5. Optimized callbacks
  const setMode = useCallback((mode: Mode): void => {
    setUserMode(mode);
  }, []);

  const toggleMode = useCallback((): void => {
    setUserMode(currentMode === 'light' ? 'dark' : 'light');
  }, [currentMode]);

  // 6. Memoized context value
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode: currentMode,
      setMode,
      toggleMode,
    }),
    [theme, currentMode, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### **Patrón de Hooks Utilizados**:

1. **`useColorScheme`** - Detección del tema del sistema
2. **`useState`** - Manejo de preferencia del usuario
3. **`useMemo`** - Optimización de objetos costosos
4. **`useCallback`** - Optimización de funciones
5. **`useContext`** - Acceso al contexto

---

## ⚡ Optimización y Performance

### Estrategias de Memoización

#### 1. **Theme Object Memoization**

```typescript
const theme = useMemo<Theme>(
  () => ({
    ...baseTokens,
    colors: colorTokens[currentMode],
    mode: currentMode,
  }),
  [currentMode], // Solo recalcula cuando cambia el modo
);
```

#### 2. **Callback Optimization**

```typescript
const setMode = useCallback((mode: Mode): void => {
  setUserMode(mode);
}, []); // Sin dependencias - función estable

const toggleMode = useCallback((): void => {
  setUserMode(currentMode === 'light' ? 'dark' : 'light');
}, [currentMode]); // Dependencia mínima necesaria
```

#### 3. **Context Value Memoization**

```typescript
const contextValue = useMemo<ThemeContextValue>(
  () => ({
    theme,
    mode: currentMode,
    setMode,
    toggleMode,
  }),
  [theme, currentMode, setMode, toggleMode],
);
```

### Beneficios de Performance:

- 🚀 **Evita re-renders innecesarios**
- 💾 **Reduce creación de objetos**
- 🔄 **Estabiliza referencias de funciones**
- ⚡ **Optimiza propagación de contexto**

---

## 🎯 Patrones de Estado en Screens

### Form State Pattern

**Implementado en**: Login/Register screens

```typescript
// Pattern consistente para formularios
const [formData, setFormData] = useState<FormData>({
  email: '',
  password: '',
  // ... otros campos
});

// Handlers tipados
const handleInputChange = (field: keyof FormData) => (value: string) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));
};
```

### API State Pattern

**Implementado en**: Crypto screens

```typescript
// Pattern para manejo de APIs
const [data, setData] = useState<DataType | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, []);
```

---

## 📖 Guías de Uso

### 1. **Crear un Hook Personalizado**

```typescript
// 1. Definir tipos
interface UseCustomHookReturn {
  data: DataType | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// 2. Implementar hook
export const useCustomHook = (param: string): UseCustomHookReturn => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getData(param);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [param]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
```

### 2. **Usar makeStyles Efectivamente**

```typescript
// ✅ Correcto - Acceso a tema
const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
  },
  text: {
    color: theme.colors.text.primary,
    fontSize: theme.typography.size.lg,
  },
}));

// ❌ Incorrecto - No usar tema cuando está disponible
const useStyles = makeStyles({
  container: {
    backgroundColor: '#ffffff', // Hard-coded
    padding: 16, // Hard-coded
  },
});
```

### 3. **Integrar con useTheme**

```typescript
const MyComponent: FC = () => {
  const { theme, mode, toggleMode } = useTheme();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Current mode: {mode}</Text>
      <TouchableOpacity onPress={toggleMode}>
        <Text>Toggle Theme</Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## ✅ Best Practices

### **DO's ✅**

1. **Usar useTheme para acceder al tema**

   ```typescript
   const { theme } = useTheme();
   ```

2. **Memoizar objetos costosos**

   ```typescript
   const expensiveObject = useMemo(() => computeExpensive(), [deps]);
   ```

3. **Usar makeStyles para estilos**

   ```typescript
   const useStyles = makeStyles((theme) => ({ ... }));
   ```

4. **Tipar todos los hooks**

   ```typescript
   const [state, setState] = useState<StateType>(initialState);
   ```

5. **Validar contextos**
   ```typescript
   if (!context) {
     throw new Error('Hook must be used within Provider');
   }
   ```

### **DON'Ts ❌**

1. **No usar valores hard-coded**

   ```typescript
   // ❌ Evitar
   backgroundColor: '#ffffff';

   // ✅ Usar
   backgroundColor: theme.colors.surface;
   ```

2. **No crear objetos en render**

   ```typescript
   // ❌ Evitar
   <Component style={{ flex: 1, padding: 16 }} />

   // ✅ Usar
   <Component style={styles.container} />
   ```

3. **No omitir arrays de dependencias**

   ```typescript
   // ❌ Evitar
   useEffect(() => { ... }); // Sin deps

   // ✅ Usar
   useEffect(() => { ... }, [dependency]);
   ```

4. **No usar hooks condicionalmente**

   ```typescript
   // ❌ Evitar
   if (condition) {
     const data = useCustomHook();
   }

   // ✅ Usar
   const data = useCustomHook();
   if (condition && data) { ... }
   ```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Screen con Theme y Estilos

```typescript
import React, { FC, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { makeStyles, useTheme } from '../../theme';

const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.size.xl,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.primary.main,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.medium,
  },
}));

export const ExampleScreen: FC = () => {
  const styles = useStyles();
  const { mode, toggleMode } = useTheme();
  const [count, setCount] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Current Theme: {mode}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={toggleMode}
      >
        <Text style={styles.buttonText}>
          Toggle Theme
        </Text>
      </TouchableOpacity>

      <Text style={styles.title}>
        Count: {count}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setCount(c => c + 1)}
      >
        <Text style={styles.buttonText}>
          Increment
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

### Ejemplo 2: Hook Personalizado para API

```typescript
// hooks/useApiData.ts
import { useState, useEffect, useCallback } from 'react';

interface UseApiDataOptions {
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export const useApiData = <T>(
  url: string,
  options: UseApiDataOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result);

      options.onSuccess?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [url, options.onSuccess, options.onError]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchData();
    }
  }, [fetchData, options.autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    clearError: () => setError(null),
  };
};

// Uso del hook
const MyComponent: FC = () => {
  const { data, loading, error, refetch } = useApiData<UserData>(
    '/api/user',
    {
      onSuccess: (userData) => console.log('User loaded:', userData),
      onError: (err) => console.error('Failed to load user:', err),
    }
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorComponent error={error} onRetry={refetch} />;
  if (!data) return <EmptyState />;

  return <UserProfile user={data} />;
};
```

### Ejemplo 3: Form Hook Reutilizable

```typescript
// hooks/useForm.ts
import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>(
  options: UseFormOptions<T>
) => {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const validate = useCallback(() => {
    if (!options.validate) return true;

    const validationErrors = options.validate(values);
    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }, [values, options.validate]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await options.onSubmit?.(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, options.onSubmit, values]);

  const reset = useCallback(() => {
    setValues(options.initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [options.initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    setFieldError,
    handleSubmit,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
};

// Uso del form hook
const LoginForm: FC = () => {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors: any = {};

      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Email is invalid';
      }

      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }

      return errors;
    },
    onSubmit: async (values) => {
      await login(values.email, values.password);
    },
  });

  return (
    <View>
      <TextInput
        value={form.values.email}
        onChangeText={(text) => form.setValue('email', text)}
        placeholder="Email"
      />
      {form.errors.email && (
        <Text style={styles.error}>{form.errors.email}</Text>
      )}

      <TextInput
        value={form.values.password}
        onChangeText={(text) => form.setValue('password', text)}
        placeholder="Password"
        secureTextEntry
      />
      {form.errors.password && (
        <Text style={styles.error}>{form.errors.password}</Text>
      )}

      <TouchableOpacity
        onPress={form.handleSubmit}
        disabled={!form.isValid || form.isSubmitting}
      >
        <Text>
          {form.isSubmitting ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
```

---

## 🔍 Debugging y Testing

### Testing Hooks

```typescript
// __tests__/hooks/useTheme.test.tsx
import { renderHook } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../theme-provider';

describe('useTheme', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  test('should return theme context', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    expect(result.current.theme).toBeDefined();
    expect(result.current.mode).toBe('light');
    expect(typeof result.current.setMode).toBe('function');
    expect(typeof result.current.toggleMode).toBe('function');
  });

  test('should throw error outside provider', () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
});
```

### Debug Tips

1. **React DevTools**: Usar para inspeccionar hooks
2. **Console.log en useEffect**: Para debugging de dependencias
3. **React DevTools Profiler**: Para optimización de performance

---

## 📈 Métricas y Performance

### Medidas de Éxito:

- ✅ **0 hard-coded colors/spacing** en componentes
- ✅ **100% tipo coverage** en hooks
- ✅ **Mínimos re-renders** con memoización
- ✅ **Tiempo de carga < 100ms** para cambios de tema
- ✅ **Reutilización > 80%** de hooks personalizados

### Herramientas de Monitoreo:

- React DevTools Profiler
- Metro bundler analysis
- ESLint hooks rules
- TypeScript strict mode

---

## 🚀 Roadmap y Mejoras Futuras

### Próximas Implementaciones:

1. **Hook de persistencia** para tema con AsyncStorage
2. **Hook de animaciones** para transiciones de tema
3. **Hook de formularios** genérico y reutilizable
4. **Hook de navegación** con tipado fuerte
5. **Hook de notificaciones** con estado global

### Optimizaciones Pendientes:

1. Lazy loading de temas
2. Suspense integration
3. Error boundaries específicos
4. Performance profiling automático

---

## 📝 Conclusión

Los patrones de hooks implementados en Lumen proporcionan:

- 🎨 **Sistema de tema robusto y flexible**
- 🚀 **Performance optimizada automáticamente**
- 🔧 **Developer experience excepcional**
- 📱 **Escalabilidad para features futuras**
- 🛡️ **Type safety completo**

Esta arquitectura de hooks establece una base sólida para el crecimiento y mantenimiento del proyecto a largo plazo.

---

_Documentación actualizada: Diciembre 2024_
_Versión: 1.0.0_
