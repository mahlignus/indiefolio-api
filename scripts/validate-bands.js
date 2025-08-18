const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const ComplementaryValidator = require("./validate-complementary");

class BandValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);

    // Carrega o schema
    const schemaPath = path.join(
      __dirname,
      "..",
      "schema",
      "banda-schema.json"
    );
    this.schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
    this.validate = this.ajv.compile(this.schema);
  }

  validateFile(filePath) {
    try {
      console.log("🔍 Validando arquivo:", path.basename(filePath));

      // Lê e parseia o JSON
      const content = fs.readFileSync(filePath, "utf8");
      let data;

      try {
        data = JSON.parse(content);
      } catch (error) {
        throw new Error(`JSON inválido: ${error.message}`);
      }

      if (data && Array.isArray(data.data)) {
        data = data.data;
      }

      // Valida com o schema
      const isValid = this.validate(data);

      if (!isValid) {
        const errors = this.formatErrors(this.validate.errors);
        throw new Error(`Validação falhou:\n${errors}`);
      }

      // Validações customizadas
      this.customValidations(data);

      console.log("✅ Arquivo válido!");
      return true;
    } catch (error) {
      console.error("❌ Erro de validação:", error.message);
      return false;
    }
  }

  formatErrors(errors) {
    return errors
      .map((error) => {
        const instancePath = error.instancePath || "root";
        return `  • ${instancePath}: ${error.message}`;
      })
      .join("\n");
  }

  customValidations(data) {
    const bandNames = new Set();

    data.forEach((banda, index) => {
      // Verifica nomes duplicados
      if (bandNames.has(banda.nome)) {
        throw new Error(`Banda duplicada encontrada: "${banda.nome}"`);
      }
      bandNames.add(banda.nome);

      // Valida ano de término
      if (banda.anoTermino && banda.anoTermino <= banda.anoFundacao) {
        throw new Error(
          `Banda "${banda.nome}": ano de término deve ser posterior ao de fundação`
        );
      }

      // Valida formação atual
      const membrosNomes = new Set();
      banda.formacaoAtual.forEach((membro) => {
        if (membrosNomes.has(membro.nome)) {
          throw new Error(
            `Banda "${banda.nome}": membro duplicado na formação: "${membro.nome}"`
          );
        }
        membrosNomes.add(membro.nome);
      });

      // Valida timestamp
      const timestamp = new Date(banda.ultimaAtualizacao);
      if (isNaN(timestamp.getTime())) {
        throw new Error(
          `Banda "${banda.nome}": ultimaAtualizacao com formato inválido`
        );
      }
    });

    console.log(`🎵 ${data.length} banda(s) validada(s) com sucesso`);
  }

  getStats(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    let data = JSON.parse(content);

    if (data && Array.isArray(data.data)) {
      data = data.data;
    }

    const stats = {
      totalBandas: data.length,
      bandasAtivas: data.filter((b) => !b.anoTermino).length,
      bandasInativas: data.filter((b) => b.anoTermino).length,
      estados: [...new Set(data.map((b) => b.local.estado))].sort(),
      generos: [...new Set(data.flatMap((b) => b.generos))].sort(),
      decadas: this.getDecadeStats(data),
    };

    return stats;
  }

  getDecadeStats(data) {
    const decades = {};
    data.forEach((banda) => {
      const decade = Math.floor(banda.anoFundacao / 10) * 10;
      decades[decade] = (decades[decade] || 0) + 1;
    });
    return decades;
  }
}

// Script principal
if (require.main === module) {
  const validator = new BandValidator();
  const complementaryValidator = new ComplementaryValidator();
  const bandasFile = path.join(__dirname, "..", "bandas.json");

  console.log("🎵 API Indiefolio - Validador de Bandas");
  console.log("=".repeat(50));

  // Valida arquivo principal
  const isMainValid = validator.validateFile(bandasFile);

  // Valida arquivos complementares
  let isComplementaryValid = true;
  if (isMainValid) {
    console.log("\n🔍 Validando arquivos complementares...");
    isComplementaryValid =
      complementaryValidator.validateAllComplementaryFiles();
  }

  const isValid = isMainValid && isComplementaryValid;

  if (isValid) {
    const stats = validator.getStats(bandasFile);
    console.log("\n📊 Estatísticas:");
    console.log(`  • Total de bandas: ${stats.totalBandas}`);
    console.log(`  • Bandas ativas: ${stats.bandasAtivas}`);
    console.log(`  • Bandas inativas: ${stats.bandasInativas}`);
    console.log(`  • Estados representados: ${stats.estados.join(", ")}`);
    console.log(`  • Gêneros únicos: ${stats.generos.length}`);
    console.log("  • Bandas por década:");
    Object.entries(stats.decadas)
      .sort()
      .forEach(([decade, count]) => {
        console.log(`    - ${decade}s: ${count} banda(s)`);
      });
  }

  process.exit(isValid ? 0 : 1);
}

module.exports = BandValidator;
