const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

class ComplementaryValidator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);

    // Carrega os schemas
    const bandaSchemaPath = path.join(
      __dirname,
      "..",
      "schema",
      "banda-schema.json"
    );
    const complementoSchemaPath = path.join(
      __dirname,
      "..",
      "schema",
      "banda-complemento-schema.json"
    );

    this.bandaSchema = JSON.parse(fs.readFileSync(bandaSchemaPath, "utf8"));
    this.complementoSchema = JSON.parse(
      fs.readFileSync(complementoSchemaPath, "utf8")
    );

    this.validateComplemento = this.ajv.compile(this.complementoSchema);

    this.bandasFile = path.join(__dirname, "..", "bandas.json");
    this.bandasDir = path.join(__dirname, "..", "bandas");
  }

  validateAllComplementaryFiles() {
    try {
      console.log("🔍 Validando arquivos complementares...");

      // Carrega dados principais das bandas
      const bandasData = JSON.parse(fs.readFileSync(this.bandasFile, "utf8"));

      // Cria mapa de bandas com seus arquivos complementares
      const bandasMap = new Map();
      bandasData.forEach((banda) => {
        if (banda.complemento) {
          const fileName = banda.complemento.replace("/bandas/", "");
          bandasMap.set(fileName, banda);
        }
      });

      if (!fs.existsSync(this.bandasDir)) {
        console.log("📁 Diretório bandas/ não encontrado");
        return true;
      }

      const files = fs
        .readdirSync(this.bandasDir)
        .filter((file) => file.endsWith(".json"));

      if (files.length === 0) {
        console.log("📄 Nenhum arquivo complementar encontrado");
        return true;
      }

      let hasErrors = false;

      for (const fileName of files) {
        const filePath = path.join(this.bandasDir, fileName);
        const isValid = this.validateComplementaryFile(
          filePath,
          fileName,
          bandasMap
        );
        if (!isValid) {
          hasErrors = true;
        }
      }

      if (!hasErrors) {
        console.log(
          `✅ ${files.length} arquivo(s) complementar(es) validado(s) com sucesso`
        );
      }

      return !hasErrors;
    } catch (error) {
      console.error(
        "❌ Erro ao validar arquivos complementares:",
        error.message
      );
      return false;
    }
  }

  validateComplementaryFile(filePath, fileName, bandasMap) {
    try {
      console.log(`🔍 Validando: ${fileName}`);

      // Lê e parseia o JSON
      const content = fs.readFileSync(filePath, "utf8");
      let data;

      try {
        data = JSON.parse(content);
      } catch (error) {
        throw new Error(`JSON inválido em ${fileName}: ${error.message}`);
      }

      // Valida com o schema
      const isValid = this.validateComplemento(data);

      if (!isValid) {
        const errors = this.formatErrors(this.validateComplemento.errors);
        throw new Error(`Validação falhou em ${fileName}:\n${errors}`);
      }

      // Validações customizadas
      this.validateFileNameConsistency(fileName, bandasMap);

      console.log(`  ✅ ${fileName} válido`);
      return true;
    } catch (error) {
      console.error(`  ❌ Erro em ${fileName}:`, error.message);
      return false;
    }
  }

  validateFileNameConsistency(fileName, bandasMap) {
    // Verifica se o arquivo tem uma banda correspondente
    const banda = bandasMap.get(fileName);

    if (!banda) {
      throw new Error(
        `Arquivo ${fileName} não corresponde a nenhuma banda em bandas.json`
      );
    }

    // Verifica se o nome do arquivo segue o padrão esperado
    const expectedFileName = this.generateFileName(banda.nome);

    if (fileName !== expectedFileName) {
      throw new Error(
        `Nome do arquivo inconsistente: esperado "${expectedFileName}", encontrado "${fileName}"\n` +
          `  (baseado no nome da banda: "${banda.nome}")`
      );
    }
  }

  generateFileName(bandName) {
    return (
      bandName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9\s]/g, "") // Remove caracteres especiais
        .replace(/\s+/g, "") + // Remove espaços
      ".json"
    );
  }

  formatErrors(errors) {
    return errors
      .map((error) => {
        const instancePath = error.instancePath || "root";
        return `    • ${instancePath}: ${error.message}`;
      })
      .join("\n");
  }

  // Método utilitário para gerar nome de arquivo a partir do nome da banda
  static generateFileNameForBand(bandName) {
    return (
      bandName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "") + ".json"
    );
  }

  // Método para listar inconsistências
  listInconsistencies() {
    try {
      const bandasData = JSON.parse(fs.readFileSync(this.bandasFile, "utf8"));

      console.log("\n📋 Verificando consistência de nomes de arquivos:");
      console.log("=".repeat(60));

      bandasData.forEach((banda) => {
        if (banda.complemento) {
          const currentFileName = banda.complemento.replace("/bandas/", "");
          const expectedFileName = this.generateFileName(banda.nome);

          if (currentFileName !== expectedFileName) {
            console.log(`❌ ${banda.nome}:`);
            console.log(`    Atual: ${currentFileName}`);
            console.log(`    Esperado: ${expectedFileName}`);
          } else {
            console.log(`✅ ${banda.nome}: ${currentFileName}`);
          }
        }
      });
    } catch (error) {
      console.error("❌ Erro ao verificar consistências:", error.message);
    }
  }
}

// Script principal
if (require.main === module) {
  console.log("🎵 API Indiefolio - Validador de Arquivos Complementares");
  console.log("=".repeat(60));

  const validator = new ComplementaryValidator();

  if (process.argv.includes("--check-names")) {
    validator.listInconsistencies();
    process.exit(0);
  }

  const isValid = validator.validateAllComplementaryFiles();

  process.exit(isValid ? 0 : 1);
}

module.exports = ComplementaryValidator;
