const fs = require("fs");

const bandas = JSON.parse(fs.readFileSync("bandas.json", "utf8"));

const generoCount = {};

bandas.forEach((banda) => {
  if (Array.isArray(banda.generos)) {
    banda.generos.forEach((genero) => {
      generoCount[genero] = (generoCount[genero] || 0) + 1;
    });
  }
});

console.log(JSON.stringify(generoCount, null, 2));
