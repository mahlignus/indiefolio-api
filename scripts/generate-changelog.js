const fs = require("fs");
const path = require("path");

class ChangelogGenerator {
  constructor() {
    this.bandasFile = path.join(__dirname, "..", "bandas.json");
    this.changelogFile = path.join(__dirname, "..", "CHANGELOG.md");
    this.historyFile = path.join(__dirname, "..", "history", "changes.json");
  }

  generateChangelog() {
    try {
      console.log("📝 Gerando changelog...");

      const currentData = this.loadCurrentData();
      const previousData = this.loadPreviousData();

      if (!previousData) {
        console.log("📁 Primeira execução - nenhum changelog gerado");
        return false;
      }

      const changes = this.detectDetailedChanges(previousData, currentData);

      if (changes.length === 0) {
        console.log("✅ Nenhuma mudança para registrar");
        return false;
      }

      this.addToHistory(changes);

      this.updateChangelogFile(changes);

      console.log(`✅ Changelog atualizado com ${changes.length} mudança(s)`);

      return true;
    } catch (error) {
      console.error("❌ Erro ao gerar changelog:", error.message);
      return false;
    }
  }

  loadCurrentData() {
    const content = fs.readFileSync(this.bandasFile, "utf8");
    const data = JSON.parse(content);
    return data;
  }

  loadPreviousData() {
    try {
      const { execSync } = require("child_process");
      const content = execSync("git show origin/main:bandas.json").toString();
      const data = JSON.parse(content);
      return data;
    } catch (e) {
      return null;
    }
  }

  detectDetailedChanges(previous, current) {
    const changes = [];
    const timestamp = new Date().toISOString();

    const previousArray =
      previous && Array.isArray(previous.data) ? previous.data : previous;
    const currentArray =
      current && Array.isArray(current.data) ? current.data : current;

    const previousMap = new Map(
      previousArray.map((banda) => [banda.nome, banda])
    );
    const currentMap = new Map(
      currentArray.map((banda) => [banda.nome, banda])
    );

    for (const [nome, banda] of currentMap) {
      if (!previousMap.has(nome)) {
        changes.push({
          tipo: "ADICIONADA",
          banda: nome,
          timestamp,
          detalhes: `Nova banda adicionada: "${nome}" de ${banda.local.cidade}, ${banda.local.estado}`,
          data: { generos: banda.generos, anoFundacao: banda.anoFundacao },
        });
      }
    }

    // Detecta bandas removidas
    for (const [nome] of previousMap) {
      if (!currentMap.has(nome)) {
        changes.push({
          tipo: "REMOVIDA",
          banda: nome,
          timestamp,
          detalhes: `Banda removida: "${nome}"`,
        });
      }
    }

    // Detecta bandas alteradas
    for (const [nome, currentBanda] of currentMap) {
      const previousBanda = previousMap.get(nome);
      if (previousBanda) {
        const fieldChanges = this.getFieldChanges(previousBanda, currentBanda);
        if (fieldChanges.length > 0) {
          changes.push({
            tipo: "ALTERADA",
            banda: nome,
            timestamp,
            detalhes: `Banda atualizada: "${nome}" - campos alterados: ${fieldChanges.join(
              ", "
            )}`,
            campos: fieldChanges,
          });
        }
      }
    }

    return changes;
  }

  getFieldChanges(previous, current) {
    const changes = [];

    for (const key in current) {
      if (key === "ultimaAtualizacao") continue;

      if (JSON.stringify(previous[key]) !== JSON.stringify(current[key])) {
        changes.push(key);
      }
    }

    return changes;
  }

  addToHistory(changes) {
    // Cria diretório se não existir
    const historyDir = path.dirname(this.historyFile);
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    let history = [];

    if (fs.existsSync(this.historyFile)) {
      const content = fs.readFileSync(this.historyFile, "utf8");
      history = JSON.parse(content);
    }

    history.push(...changes);

    // Mantém apenas os últimos 1000 registros
    if (history.length > 1000) {
      history = history.slice(-1000);
    }

    fs.writeFileSync(
      this.historyFile,
      JSON.stringify(history, null, 2),
      "utf8"
    );
  }

  updateChangelogFile(changes) {
    const date = new Date().toLocaleDateString("pt-BR");
    const time = new Date().toLocaleTimeString("pt-BR");

    let changelog = "";

    if (fs.existsSync(this.changelogFile)) {
      changelog = fs.readFileSync(this.changelogFile, "utf8");
    } else {
      changelog =
        "# Changelog\n\nTodas as mudanças notáveis deste projeto serão documentadas neste arquivo.\n\n";
    }

    // Prepara entrada do changelog
    let entry = `## ${date} - ${time}\n\n`;

    const added = changes.filter((c) => c.tipo === "ADICIONADA");
    const modified = changes.filter((c) => c.tipo === "ALTERADA");
    const removed = changes.filter((c) => c.tipo === "REMOVIDA");

    if (added.length > 0) {
      entry += "### ✅ Adicionadas\n";
      added.forEach((change) => {
        entry += `- ${change.detalhes}\n`;
      });
      entry += "\n";
    }

    if (modified.length > 0) {
      entry += "### 🔄 Modificadas\n";
      modified.forEach((change) => {
        entry += `- ${change.detalhes}\n`;
      });
      entry += "\n";
    }

    if (removed.length > 0) {
      entry += "### ❌ Removidas\n";
      removed.forEach((change) => {
        entry += `- ${change.detalhes}\n`;
      });
      entry += "\n";
    }

    entry += "---\n\n";

    // Insere no topo do changelog
    const lines = changelog.split("\n");
    const headerEnd = lines.findIndex(
      (line) =>
        line.trim() === "" &&
        lines[lines.indexOf(line) - 1].includes("documentadas")
    );

    if (headerEnd > -1) {
      lines.splice(headerEnd + 1, 0, entry);
      changelog = lines.join("\n");
    } else {
      changelog += entry;
    }

    fs.writeFileSync(this.changelogFile, changelog, "utf8");
  }

  getRecentChanges(limit = 10) {
    if (!fs.existsSync(this.historyFile)) {
      return [];
    }

    const content = fs.readFileSync(this.historyFile, "utf8");
    const history = JSON.parse(content);

    return history.slice(-limit).reverse();
  }
}

if (require.main === module) {
  console.log("📝 API Indiefolio - Gerador de Changelog");
  console.log("=".repeat(50));

  const generator = new ChangelogGenerator();

  if (process.argv.includes("--recent")) {
    const limit =
      parseInt(process.argv[process.argv.indexOf("--recent") + 1]) || 10;
    const recent = generator.getRecentChanges(limit);

    console.log(`\n📋 Últimas ${limit} mudanças:`);
    console.log("=".repeat(50));

    recent.forEach((change, index) => {
      const date = new Date(change.timestamp).toLocaleString("pt-BR");
      console.log(`${index + 1}. [${change.tipo}] ${change.banda}`);
      console.log(`   📅 ${date}`);
      console.log(`   📝 ${change.detalhes}`);
      console.log("");
    });
  } else {
    generator.generateChangelog();
  }

  process.exit(0);
}

module.exports = ChangelogGenerator;
