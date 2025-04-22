import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import boundaries from "eslint-plugin-boundaries";
import prettier from "eslint-plugin-prettier";

// Конфигурация ESLint
const eslintConfig = [
  {
    ignores: ["node_modules", "dist", "logs"] // Игнорируем ненужные директории
  },
  {
    // Линтинг всех JS/TS файлов
    files: ["**/*.ts", "**/*.js"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier,
      boundaries
    },
    settings: {
      "boundaries/include": ["src/**/*"], // Указываем корневую папку модулей
      "boundaries/elements": [
        {
          type: "modules", // Логика для модулей (modules)
          pattern: ["src/modules/**/*"]
        },
        {
          type: "guards", // Логика для guard (guards)
          pattern: ["src/guards/**/*"]
        },
        {
          type: "strategy", // Стратегии авторизации (strategy)
          pattern: ["src/strategy/**/*"]
        },
        {
          type: "config", // Конфигурационные файлы
          pattern: ["src/config/**/*"]
        },
        {
          type: "common", // Общие компоненты
          pattern: ["src/common/**/*"]
        },
        {
          type: "logger", // Общие компоненты
          pattern: ["src/logger/**/*"]
        }
      ]
    },
    rules: {
      "prettier/prettier": ["error", { endOfLine: "auto" }], // Интеграция с Prettier
      "boundaries/no-unknown": ["error"], // Запрет на неизвестные импорты
      "boundaries/no-external": ["off"], // Разрешаем внешние зависимости
      "@typescript-eslint/no-unused-vars": "warn", // Предупреждение для неиспользуемых переменных
      "@typescript-eslint/no-explicit-any": "off", // Разрешаем `any`
      semi: ["error", "always"], // Требуем точку с запятой
      quotes: ["error", "double", { avoidEscape: true }], // Двойные кавычки
      "comma-spacing": ["error", { before: false, after: true }],
      "arrow-spacing": ["error", { before: true, after: true }],
      "space-infix-ops": "error",
      "keyword-spacing": ["error", { before: true, after: true }]
    }
  }
];

export default eslintConfig;
