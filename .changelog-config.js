'use strict';

module.exports = {
  disableEmoji: false,
  list: [
    'feat',
    'fix',
    'perf',
    'revert',
    'docs',
    'style',
    'refactor',
    'test',
    'chore',
    'security'
  ],
  maxMessageLength: 100,
  minMessageLength: 3,
  questions: [
    'type',
    'scope',
    'subject',
    'body',
    'breaking',
    'issues'
  ],
  scopes: [
    'roles',
    'playbooks',
    'inventory',
    'group_vars',
    'host_vars',
    'workflows',
    'docs'
  ],
  scopeOverrides: {
    fix: [
      {
        name: 'cloudflared',
        description: 'fix: Cloudflare Tunnel role'
      },
      {
        name: 'postgres',
        description: 'fix: PostgreSQL role'
      }
    ]
  },
  messages: {
    type: "Selecciona el tipo de cambio que estás cometiendo:",
    scope: 'Selecciona el scope de este cambio (opcional):',
    subject: 'Escribe una corta descripción (máx 50 caracteres):',
    body: 'Proporciona una descripción más larga (opcional). Usa "|" para saltos de línea:\n',
    breaking: 'Lista los cambios que rompería compatibilidad (BREAKING CHANGES) (opcional):\n',
    issues: 'Cierre issues si corresponde. Ej. fixes #123, resolves #456:\n',
    confirmCommit: '¿Estás seguro de hacer este commit?'
  },
  types: {
    chore: {
      description: 'Cambios en herramientas build, deps, CI/CD, etc.',
      emoji: '🔧'
    },
    ci: {
      description: 'Cambios en archivos de CI/CD (workflows, scripts)',
      emoji: '🔄'
    },
    docs: {
      description: 'Cambios en documentación',
      emoji: '📝'
    },
    feat: {
      description: 'Una nueva funcionalidad (nuevo role, nuevo playbook)',
      emoji: '✨'
    },
    fix: {
      description: 'Arregla un bug',
      emoji: '🐛'
    },
    perf: {
      description: 'Cambio que mejora la performance',
      emoji: '⚡'
    },
    refactor: {
      description: 'Cambio que no arregla bug ni añade feature',
      emoji: '♻️'
    },
    revert: {
      description: 'Revert a un commit anterior',
      emoji: '↩️'
    },
    security: {
      description: 'Fix de seguridad',
      emoji: '🔒'
    },
    style: {
      description: 'Cambios en formato, spacing, missing semicolons, etc.',
      emoji: '💅'
    },
    test: {
      description: 'Cambios en tests o validación',
      emoji: '✅'
    }
  },
  commitlintConfig: {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        [
          'chore',
          'ci',
          'docs',
          'feat',
          'fix',
          'perf',
          'refactor',
          'revert',
          'security',
          'style',
          'test'
        ]
      ]
    }
  }
};
