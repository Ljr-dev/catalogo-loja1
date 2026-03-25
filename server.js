const express = require("express");
const path = require("path");
const xlsx = require("xlsx");

const app = express();

// Servir frontend
app.use(express.static(path.join(__dirname, "public")));

// Função para ler Excel
function lerProdutos() {
  const wb = xlsx.readFile(path.join(__dirname, "data/produtos.xlsx"));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet);
}

// API
app.get("/produtos", (req, res) => {
  try {
    const produtos = lerProdutos();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao ler Excel" });
  }
});

// Start
app.listen(3000, () => {
  console.log("Rodando em http://localhost:3000");
});