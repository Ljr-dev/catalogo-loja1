const express = require("express");
const path = require("path");
const xlsx = require("xlsx");

const app = express();

// 🔥 PRIMEIRO
app.get("/ping", (req, res) => {
  res.send("ok");
});

// Servir frontend
app.use(express.static(path.join(__dirname, "public")));

// 🔥 Função corrigida
function lerProdutos() {
  const wb = xlsx.readFile(path.join(__dirname, "data/produtos.xlsx"));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  return rows.map(row => ({
    categoria: row.categoria || "Outros",
    nome: row.nome || "Sem nome",
    preco: Number(row.preco) || 0,
    tipo: (row.tipo || "int").toString().toLowerCase().trim(),
    unidade: (row.unidade || "un").toString().trim()
  }));
}

// API
app.get("/produtos", (req, res) => {
  try {
    const produtos = lerProdutos();
    res.json(produtos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao ler Excel" });
  }
});

// 🔥 PORTA CORRETA PRA RENDER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor rodando na porta " + PORT);
});