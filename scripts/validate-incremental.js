const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const BandValidator = require("./validate-bands");
const ComplementaryValidator = require("./validate-complementary");

class IncrementalValidator {
  constructor() {
    this.bandValidator = new BandValidator();
    this.complementaryValidator = new ComplementaryValidator();
    this.bandasFile = path.join(__dirname, "..", "bandas.json");
    this.bandasDir = path.join(__dirname, "..", "bandas");
  }

  getChangedFiles() {
    try {
      // Verifica se estamos em um repositório git
      if (!fs.existsSync(path.join(__dirname, "..", ".git"))) {
        console.log(
          "⚠️ Não é um repositório git - validando todos os arquivos"
        );
        return this.getAllRelevantFiles();
      }

      // Pega arquivos staged (preparados para commit)
      const stagedFiles = execSync("git diff --cached --name-only", {
        encoding: "utf8",
        cwd: path.join(__dirname, ".."),
      }).trim();

      if (!stagedFiles) {
        console.log("ℹ️ Nenhum arquivo staged para commit");
        return [];
      }

      const changedFiles = stagedFiles.split("\n").filter((file) => {
        // Filtra apenas arquivos JSON relevantes
        return (
          file === "bandas.json" ||
          (file.startsWith("bandas/") && file.endsWith(".json"))
        );
      });

      return changedFiles;
    } catch (error) {
      console.log(
        "⚠️ Erro ao detectar arquivos alterados - validando todos:",
        error.message
      );
      return this.getAllRelevantFiles();
    }
  }

  getAllRelevantFiles() {
    const files = ["bandas.json"];

    if (fs.existsSync(this.bandasDir)) {
      const complementaryFiles = fs
        .readdirSync(this.bandasDir)
        .filter((file) => file.endsWith(".json"))
        .map((file) => `bandas/${file}`);

      files.push(...complementaryFiles);
    }

    return files;
  }

  validateChangedFiles() {
    try {
      const changedFiles = this.getChangedFiles();

      console.log("🎵 API Indiefolio - Validação Incremental");
      console.log("=".repeat(50));

      if (changedFiles.length === 0) {
        console.log("✅ Nenhum arquivo relevante para validar");
        return true;
      }

      console.log(
        `🔍 Validando ${changedFiles.length} arquivo(s) alterado(s):`
      );
      changedFiles.forEach((file) => console.log(`  📄 ${file}`));
      console.log("");

      let hasErrors = false;

      // Valida arquivo principal se foi alterado
      const mainFileChanged = changedFiles.includes("bandas.json");
      if (mainFileChanged) {
        console.log("🔍 Validando arquivo principal...");
        const isMainValid = this.bandValidator.validateFile(this.bandasFile);
        if (!isMainValid) {
          hasErrors = true;
        }
      }

      // Valida arquivos complementares alterados
      const complementaryFiles = changedFiles.filter(
        (file) => file.startsWith("bandas/") && file.endsWith(".json")
      );

      if (complementaryFiles.length > 0) {
        console.log("\n🔍 Validando arquivos complementares alterados...");

        // Carrega dados das bandas para validação de consistência
        let bandasData = [];
        try {
          bandasData = JSON.parse(fs.readFileSync(this.bandasFile, "utf8"));
          if (bandasData && Array.isArray(bandasData.data)) {
            bandasData = bandasData.data;
          }
        } catch (error) {
          console.error("❌ Erro ao carregar bandas.json:", error.message);
          hasErrors = true;
        }

        const bandasMap = new Map();
        bandasData.forEach((banda) => {
          if (banda.complemento) {
            const fileName = banda.complemento.replace("/bandas/", "");
            bandasMap.set(fileName, banda);
          }
        });

        for (const file of complementaryFiles) {
          const fileName = file.replace("bandas/", "");
          const filePath = path.join(__dirname, "..", file);

          if (fs.existsSync(filePath)) {
            const isValid =
              this.complementaryValidator.validateComplementaryFile(
                filePath,
                fileName,
                bandasMap
              );
            if (!isValid) {
              hasErrors = true;
            }
          } else {
            console.error(`❌ Arquivo não encontrado: ${file}`);
            hasErrors = true;
          }
        }
      }

      // Validação cruzada se arquivo principal foi alterado
      if (mainFileChanged && !hasErrors) {
        console.log("\n🔍 Verificando consistência geral...");
        this.validateCrossReferences();
      }

      if (!hasErrors) {
        console.log("\n✅ Todos os arquivos alterados são válidos!");

        // Mostra estatísticas apenas se arquivo principal foi alterado
        if (mainFileChanged) {
          const stats = this.bandValidator.getStats(this.bandasFile);
          console.log("\n📊 Estatísticas atuais:");
          console.log(`  • Total de bandas: ${stats.totalBandas}`);
          console.log(`  • Bandas ativas: ${stats.bandasAtivas}`);
          console.log(`  • Estados representados: ${stats.estados.join(", ")}`);
        }
      }

      return !hasErrors;
    } catch (error) {
      console.error("❌ Erro na validação incremental:", error.message);
      return false;
    }
  }

  validateCrossReferences() {
    try {
      let bandasData = JSON.parse(fs.readFileSync(this.bandasFile, "utf8"));
      if (bandasData && Array.isArray(bandasData.data)) {
        bandasData = bandasData.data;
      }

      bandasData.forEach((banda) => {
        if (banda.complemento) {
          const complementPath = path.join(
            __dirname,
            "..",
            banda.complemento.substring(1)
          );

          if (!fs.existsSync(complementPath)) {
            console.log(
              `⚠️ Arquivo complementar não encontrado: ${banda.complemento} (banda: ${banda.nome})`
            );
          }
        }
      });
    } catch (error) {
      console.error("❌ Erro na validação cruzada:", error.message);
    }
  }

  // Método para forçar validação completa
  validateAll() {
    console.log("🎵 API Indiefolio - Validação Completa (Forçada)");
    console.log("=".repeat(50));

    // Valida arquivo principal
    const isMainValid = this.bandValidator.validateFile(this.bandasFile);

    // Valida todos os arquivos complementares
    let isComplementaryValid = true;
    if (isMainValid) {
      console.log("\n🔍 Validando todos os arquivos complementares...");
      isComplementaryValid =
        this.complementaryValidator.validateAllComplementaryFiles();
    }

    const isValid = isMainValid && isComplementaryValid;

    if (isValid) {
      const stats = this.bandValidator.getStats(this.bandasFile);
      console.log("\n📊 Estatísticas:");
      console.log(`  • Total de bandas: ${stats.totalBandas}`);
      console.log(`  • Bandas ativas: ${stats.bandasAtivas}`);
      console.log(`  • Bandas inativas: ${stats.bandasInativas}`);
      console.log(`  • Estados representados: ${stats.estados.join(", ")}`);
      console.log(`  • Gêneros únicos: ${stats.generos.length}`);
    }

    return isValid;
  }
}

// Script principal
if (require.main === module) {
  const validator = new IncrementalValidator();

  // Verifica se deve fazer validação completa
  const forceComplete =
    process.argv.includes("--complete") || process.argv.includes("--all");

  let isValid;
  if (forceComplete) {
    isValid = validator.validateAll();
  } else {
    isValid = validator.validateChangedFiles();
  }

  process.exit(isValid ? 0 : 1);
}

module.exports = IncrementalValidator;
