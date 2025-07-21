#!/usr/bin/env node

/**
 * Pre-commit hook para API Indiefolio
 *
 * Este script é executado automaticamente antes de cada commit
 * e garante a qualidade e consistência dos dados.
 */

const { execSync } = require("child_process");

console.log("🎵 API Indiefolio - Pre-commit Hook");
console.log("=".repeat(50));

let hasErrors = false;

try {
  // 1. Validação dos dados
  console.log("🔍 Executando validação...");
  execSync("npm run validate", { stdio: "inherit" });
  console.log("✅ Validação passou");
} catch (error) {
  console.error("❌ Falha na validação");
  hasErrors = true;
}

try {
  // 2. Atualização de timestamps
  console.log("\n⏰ Atualizando timestamps...");
  execSync("npm run update-timestamps", { stdio: "inherit" });
  console.log("✅ Timestamps atualizados");
} catch (error) {
  console.error("❌ Falha ao atualizar timestamps");
  hasErrors = true;
}

try {
  // 3. Geração de changelog
  console.log("\n📝 Gerando changelog...");
  execSync("npm run generate-changelog", { stdio: "inherit" });
  console.log("✅ Changelog atualizado");
} catch (error) {
  console.error("❌ Falha ao gerar changelog");
  hasErrors = true;
}

if (hasErrors) {
  console.log(
    "\n❌ Pre-commit falhou! Corrija os erros antes de fazer commit."
  );
  process.exit(1);
} else {
  console.log("\n🚀 Pre-commit executado com sucesso!");
  console.log(
    "💡 Não esqueça de adicionar arquivos atualizados ao commit se necessário"
  );
  process.exit(0);
}
