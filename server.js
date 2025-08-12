const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

app.get("/@:version/bandas.json", (req, res) => {
  const filePath = path.join(__dirname, "bandas.json");
  console.log(`Tentando servir versão ${req.params.version}:`, filePath);
  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error("Erro ao abrir bandas.json:", err);
    res.status(404).send("Arquivo bandas.json não encontrado!");
  });
  stream.pipe(res);
});

app.use("/@:version/bandas", express.static(path.join(__dirname, "bandas")));

app.listen(8080, () => {
  console.log(
    "Servidor rodando em 'http://localhost:8080/@1.0.0/bandas.json' e 'http://localhost:8080/@1.0.0/banda/<nome>.json'"
  );
});
