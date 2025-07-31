const fs = require("fs");
const path = require("path");

const bandasFile = path.join(__dirname, "..", "bandas.json");

function updateGenresToLowercase() {
  const content = fs.readFileSync(bandasFile, "utf8");
  const bandas = JSON.parse(content);

  const updated = bandas.map((banda) => {
    if (Array.isArray(banda.generos)) {
      return {
        ...banda,
        generos: banda.generos.map((g) => g.toLowerCase()),
      };
    }
    return banda;
  });

  fs.writeFileSync(bandasFile, JSON.stringify(updated, null, 2) + "\n", "utf8");
  console.log("✅ Gêneros atualizados para lowercase em todas as bandas.");
}

if (require.main === module) {
  updateGenresToLowercase();
}

module.exports = updateGenresToLowercase;
