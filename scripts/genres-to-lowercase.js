const fs = require("fs");
const path = require("path");

const bandasFile = path.join(__dirname, "..", "bandas.json");

function updateGenresToLowercase() {
  const content = fs.readFileSync(bandasFile, "utf8");
  const data = JSON.parse(content);

  const bandasArray = data && Array.isArray(data.data) ? data.data : data;

  const updatedBandas = bandasArray.map((banda) => {
    if (Array.isArray(banda.generos)) {
      return {
        ...banda,
        generos: banda.generos.map((g) => g.toLowerCase()),
      };
    }
    return banda;
  });

  let result;
  if (data && Array.isArray(data.data)) {
    result = { ...data, data: updatedBandas };
  } else {
    result = updatedBandas;
  }

  fs.writeFileSync(bandasFile, JSON.stringify(result, null, 2) + "\n", "utf8");
  console.log("✅ Gêneros atualizados para lowercase em todas as bandas.");
}

if (require.main === module) {
  updateGenresToLowercase();
}

module.exports = updateGenresToLowercase;
