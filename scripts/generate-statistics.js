const fs = require("fs");
const path = require("path");

function generateStatistics() {
  try {
    const bandasPath = path.join(__dirname, "..", "bandas.json");
    const data = JSON.parse(fs.readFileSync(bandasPath, "utf8"));

    const bandas = data && Array.isArray(data.data) ? data.data : data;

    let totalBandas = 0;
    let totalArtistasSolo = 0;
    const generosUnicos = new Set();
    const generosCount = {};
    const cidades = new Set();
    const cidadesCount = {};

    bandas.forEach((banda) => {
      if (banda.isSolo === true) {
        totalArtistasSolo++;
      } else {
        totalBandas++;
      }

      // Coleta informações e conta ocorrências
      if (Array.isArray(banda.generos)) {
        banda.generos.forEach((genero) => {
          const generoLower = genero.toLowerCase();
          generosUnicos.add(generoLower);
          generosCount[generoLower] = (generosCount[generoLower] || 0) + 1;
        });
      }

      if (banda.local && banda.local.cidade) {
        const cidadeKey = `${banda.local.cidade}, ${
          banda.local.estado || ""
        }`.trim();
        cidades.add(cidadeKey);
        cidadesCount[cidadeKey] = (cidadesCount[cidadeKey] || 0) + 1;
      }
    });

    // Ordena gêneros e cidades por popularidade (mais comum primeiro)
    const generosOrdenados = Object.fromEntries(
      Object.entries(generosCount).sort(([, a], [, b]) => b - a)
    );

    const cidadesOrdenadas = Object.fromEntries(
      Object.entries(cidadesCount).sort(([, a], [, b]) => b - a)
    );

    const estatisticas = {
      totalBandas,
      totalArtistasSolo,
      totalGeneros: generosUnicos.size,
      totalCidades: cidades.size,
      generos: generosOrdenados,
      cidades: cidadesOrdenadas,
    };

    const estatisticasPath = path.join(__dirname, "..", "estatisticas.json");
    fs.writeFileSync(
      estatisticasPath,
      JSON.stringify(estatisticas, null, 2),
      "utf8"
    );

    console.log("Estatísticas geradas com sucesso!");
    console.log(JSON.stringify(estatisticas, null, 2));
  } catch (error) {
    console.error("Erro ao gerar estatísticas:", error);
    process.exit(1);
  }
}

generateStatistics();
