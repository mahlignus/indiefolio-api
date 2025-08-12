const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

const port = 8080;

const menu = `
Indiefolio API
=============

1. Listar bandas: GET /bandas.json
2. Obter informações de uma banda: GET /banda/:nome
3. Obter estatísticas: GET /estatisticas.json

`;

app.get("/", (req, res) => {
  res.send(menu);
});

app.get("/banda/:nome", (req, res) => {
  const nomeBanda = req.params.nome;
  const filePath = path.join(__dirname, "bandas", `${nomeBanda}.json`);
  console.log(`Tentando servir banda ${nomeBanda}:`, filePath);
  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error(`Erro ao abrir ${filePath}:`, err);
    res.status(404).send(`Arquivo ${filePath} não encontrado!`);
  });
  stream.pipe(res);
});

app.get("/bandas.json", (req, res) => {
  const filePath = path.join(__dirname, "bandas.json");
  console.log(`Tentando servir bandas.json:`, filePath);
  const stream = fs.createReadStream(filePath);
  stream.on("error", (err) => {
    console.error("Erro ao abrir bandas.json:", err);
    res.status(404).send("Arquivo bandas.json não encontrado!");
  });
  stream.pipe(res);
});

app.get("/estatisticas.json", (req, res) => {
  const estatisticasPath = path.join(__dirname, "estatisticas.json");
  console.log(`Tentando servir estatísticas:`, estatisticasPath);
  const stream = fs.createReadStream(estatisticasPath);
  stream.on("error", (err) => {
    console.error("Erro ao abrir estatisticas.json:", err);
    res.status(404).send("Arquivo estatisticas.json não encontrado!");
  });
  stream.pipe(res);
});

app.listen(port, () => {
  const url = `http://localhost:${port}`;
  console.log(`Servidor rodando em ${url}`);
  console.log("Acesse o menu de opções:");
  console.log("Menu de opções:");
  console.log(`1. Listar bandas: ${url}/bandas.json`);
  console.log(`2. Obter informações de uma banda: ${url}/banda/:nome`);
  console.log(`3. Obter estatísticas: ${url}/estatisticas.json`);
});
