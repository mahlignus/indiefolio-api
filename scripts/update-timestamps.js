const fs = require("fs");
const path = require("path");

class TimestampUpdater {
  constructor() {
    this.bandasFile = path.join(__dirname, "..", "bandas.json");
  }

  updateTimestamps() {
    try {
      console.log("⏰ Verificando necessidade de atualizar timestamps...");

      const currentData = this.loadCurrentData();
      const previousData = this.loadPreviousData();

      if (!previousData) {
        console.log("📁 Primeira execução - salvando estado atual");
        this.savePreviousData(currentData);
        return false;
      }

      const changes = this.detectChanges(previousData, currentData);

      if (changes.length === 0) {
        console.log("✅ Nenhuma mudança detectada");
        return false;
      }

      const updatedData = this.applyTimestampUpdates(currentData, changes);

      fs.writeFileSync(
        this.bandasFile,
        JSON.stringify(updatedData, null, 2),
        "utf8"
      );

      this.savePreviousData(updatedData);

      console.log(`✅ Timestamps atualizados para ${changes.length} banda(s)`);
      changes.forEach((change) => {
        console.log(`  • ${change.tipo}: ${change.banda}`);
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao atualizar timestamps:", error.message);
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

  detectChanges(previous, current) {
    const changes = [];

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

    // Detecta bandas adicionadas
    for (const [nome] of currentMap) {
      if (!previousMap.has(nome)) {
        changes.push({ tipo: "ADICIONADA", banda: nome });
      }
    }

    // Detecta bandas alteradas
    for (const [nome, currentBanda] of currentMap) {
      const previousBanda = previousMap.get(nome);
      if (previousBanda) {
        // Remove ultimaAtualizacao para comparação
        const currentCopy = { ...currentBanda };
        const previousCopy = { ...previousBanda };
        delete currentCopy.ultimaAtualizacao;
        delete previousCopy.ultimaAtualizacao;

        if (JSON.stringify(previousCopy) !== JSON.stringify(currentCopy)) {
          changes.push({ tipo: "ALTERADA", banda: nome });
        }
      }
    }

    return changes;
  }

  applyTimestampUpdates(data, changes) {
    const now = new Date().toISOString();
    const changedBands = new Set(changes.map((c) => c.banda));

    const bandasArray = data && Array.isArray(data.data) ? data.data : data;

    const updatedBandas = bandasArray.map((banda) => {
      if (changedBands.has(banda.nome)) {
        return { ...banda, ultimaAtualizacao: now };
      }
      return banda;
    });

    if (data && Array.isArray(data.data)) {
      return { ...data, data: updatedBandas };
    } else {
      return updatedBandas;
    }
  }
}

if (require.main === module) {
  console.log("⏰ API Indiefolio - Atualizador de Timestamps");
  console.log("=".repeat(50));

  const updater = new TimestampUpdater();
  const updated = updater.updateTimestamps();

  process.exit(0);
}

module.exports = TimestampUpdater;
