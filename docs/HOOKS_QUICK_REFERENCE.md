# 🎣 Hooks Quick Reference - Lumen

> Referencia rápida de hooks para desarrollo diario

## 🚀 Quick Start

### 1. Usar Theme Hook

```typescript
import { useTheme } from '../theme';

const { theme, mode, setMode, toggleMode } = useTheme();
```

### 2. Crear Estilos

```typescript
import { makeStyles } from '../theme';

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
}));

const styles = useStyles();
```

### 3. Estado de Formulario

```typescript
const [formData, setFormData] = useState<FormType>({
  field1: '',
  field2: '',
});
```

### 4. API Loading State

```typescript
const [data, setData] = useState<DataType | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setIsLoading(false));
}, []);
```

## 📋 Common Patterns

### Theme Access

```typescript
// ✅ Correct
const { theme } = useTheme();
backgroundColor: theme.colors.surface;

// ❌ Avoid
backgroundColor: '#ffffff';
```

### Optimized Callbacks

```typescript
const handlePress = useCallback(() => {
  // action
}, [dependency]);
```

### Memoized Values

```typescript
const expensiveValue = useMemo(() => computeExpensive(data), [data]);
```

## 🛠️ Available Theme Properties

```typescript
// Colors
theme.colors.background;
theme.colors.surface;
theme.colors.primary.main;
theme.colors.text.primary;
theme.colors.border;

// Spacing
theme.spacing.xs; // 4
theme.spacing.sm; // 8
theme.spacing.md; // 16
theme.spacing.lg; // 24
theme.spacing.xl; // 32

// Typography
theme.typography.size.sm; // 12
theme.typography.size.md; // 14
theme.typography.size.lg; // 16
theme.typography.size.xl; // 20

// Radii
theme.radii.sm; // 4
theme.radii.md; // 8
theme.radii.lg; // 12
```

## 🔧 Common Use Cases

### Screen Component

```typescript
const useStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
}));

export const MyScreen: FC = () => {
  const styles = useStyles();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* content */}
    </View>
  );
};
```

### Form Input

```typescript
const useStyles = makeStyles((theme) => ({
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    color: theme.colors.text.primary,
  },
}));
```

### Button

```typescript
const useStyles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.primary.contrast,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.medium,
  },
}));
```

## ⚡ Performance Tips

1. **Memoize expensive calculations**
2. **Use useCallback for handlers passed to children**
3. **Keep dependency arrays minimal**
4. **Use makeStyles instead of inline styles**
5. **Avoid creating objects in render**

---

_Para documentación completa ver: [HOOKS_PATTERNS.md](./HOOKS_PATTERNS.md)_
