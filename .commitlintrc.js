module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // Nueva funcionalidad
        'fix', // Bug fix
        'docs', // Documentación
        'style', // Cambios de formato
        'refactor', // Refactoring
        'test', // Tests
        'chore', // Tareas de mantenimiento
        'perf', // Mejoras de performance
        'ci', // CI/CD
        'build', // Build system
        'revert', // Revert
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 72],
  },
};
