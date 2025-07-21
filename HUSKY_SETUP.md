# Configuração do Husky (Git Hooks)

## Para ativar quando subir para Git:

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Inicializar Husky:**

   ```bash
   npm run prepare
   ```

3. **Configurar pre-commit hook:**
   ```bash
   npx husky add .husky/pre-commit "node scripts/pre-commit.js"
   ```

## Hooks Disponíveis:

### pre-commit

- Valida JSON Schema
- Atualiza timestamps automaticamente
- Gera changelog das mudanças
- Impede commits com dados inválidos

### pre-push (opcional)

```bash
npx husky add .husky/pre-push "npm run validate"
```

## Comandos Manuais:

Você pode executar os scripts manualmente a qualquer momento:

```bash
# Validar dados
npm run validate

# Atualizar timestamps
npm run update-timestamps

# Gerar changelog
npm run generate-changelog

# Ver mudanças recentes
node scripts/generate-changelog.js --recent 5

# Executar todos (simula pre-commit)
npm run pre-commit
```
