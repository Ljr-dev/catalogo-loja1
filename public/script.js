const numero = "5519982144043";

let produtos = [];
let carrinho = {};

let categoriaAtual = "Todos";
let categorias = [];

// 🚀 CARREGAR PRODUTOS
async function carregarProdutos() {
  const res = await fetch("/produtos");
  produtos = await res.json();

  produtos = produtos.map(p => ({
    ...p,
    tipo: (p.tipo || "int").toLowerCase().trim(),
    unidade: (p.unidade || "un").toString().trim()
  }));

  gerarCategorias();
  aplicarFiltros();
}

// 🔹 CATEGORIAS
function gerarCategorias() {
  categorias = ["Todos", ...new Set(produtos.map(p => p.categoria))];
  renderCategorias();
}

function renderCategorias() {
  const container = document.getElementById("categorias");
  container.innerHTML = "";

  categorias.forEach(cat => {
    const btn = document.createElement("div");
    btn.className = "cat-btn" + (cat === categoriaAtual ? " active" : "");
    btn.innerText = cat;

    btn.onclick = () => {
      categoriaAtual = cat;
      aplicarFiltros();
    };

    container.appendChild(btn);
  });
}

// 🔹 FILTRO
function aplicarFiltros() {
  let lista = produtos;

  if (categoriaAtual !== "Todos") {
    lista = lista.filter(p => p.categoria === categoriaAtual);
  }

  const termo = document.getElementById("busca").value.toLowerCase();

  if (termo) {
    lista = lista.filter(p =>
      p.nome.toLowerCase().includes(termo)
    );
  }

  render(lista);
  renderCategorias();
}

// 🔹 RENDER
function render(lista) {
  const container = document.getElementById("produtos");
  container.innerHTML = "";

  lista.forEach((p) => {
    const qtd = carrinho[p.nome]?.quantidade || 0;
    const step = p.tipo === "decimal" ? "0.1" : "1";

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${p.nome}</h3>
      <p class="preco">R$ ${p.preco.toFixed(2).replace(".", ",")} / ${p.unidade}</p>

      <div class="controle">
        <button onclick="menos('${p.nome}')">−</button>

        <input 
          type="number"
          step="${step}"
          min="0"
          value="${qtd}"
          class="input-qtd"
          oninput="setQtd('${p.nome}', this.value, ${p.preco}, '${p.tipo}', '${p.unidade}')"
        />

        <button onclick="mais('${p.nome}', ${p.preco}, '${p.tipo}', '${p.unidade}')">+</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ➕ ADICIONAR
function mais(nome, preco, tipo, unidade) {
  if (!carrinho[nome]) {
    carrinho[nome] = { nome, preco, quantidade: 0, tipo, unidade };
  }

  carrinho[nome].quantidade += tipo === "decimal" ? 0.1 : 1;

  atualizarResumo();
  aplicarFiltros();
}

// ➖ REMOVER
function menos(nome) {
  if (carrinho[nome]) {
    carrinho[nome].quantidade--;

    if (carrinho[nome].quantidade <= 0) {
      delete carrinho[nome];
    }
  }

  atualizarResumo();
  aplicarFiltros();
}

// ✏️ DIGITAÇÃO
function setQtd(nome, valor, preco, tipo, unidade) {
  let qtd = tipo === "decimal" ? parseFloat(valor) : parseInt(valor);

  qtd = isNaN(qtd) ? 0 : qtd;

  if (qtd <= 0) {
    delete carrinho[nome];
  } else {
    carrinho[nome] = { nome, preco, quantidade: qtd, tipo, unidade };
  }

  atualizarResumo();
}

// 🧮 TOTAL
function atualizarResumo() {
  let total = 0;
  let itens = 0;

  Object.values(carrinho).forEach(p => {
    total += p.preco * p.quantidade;
    itens += p.quantidade;
  });

  document.getElementById("resumo").innerText =
    `${itens} itens | R$ ${total.toFixed(2).replace(".", ",")}`;
}

// 🔍 BUSCA
document.getElementById("busca").addEventListener("input", aplicarFiltros);

// 📲 WHATSAPP
function enviar() {
  if (Object.keys(carrinho).length === 0) {
    alert("Adicione pelo menos um produto!");
    return;
  }

  const nome = document.getElementById("nome").value || "Não informado";

  let total = 0;
  let msg = "🛒 NOVO ORÇAMENTO\n\n";

  msg += `👤 Cliente: ${nome}\n\n`;
  msg += "📦 Itens:\n";

  Object.values(carrinho).forEach(p => {
    const qtd = p.tipo === "decimal"
      ? p.quantidade.toFixed(2)
      : p.quantidade;

    msg += `• ${p.nome} (${qtd} ${p.unidade})\n`;
    total += p.preco * p.quantidade;
  });

  msg += `\n💰 Total estimado: R$ ${total.toFixed(2).replace(".", ",")}\n`;

  const hora = new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });

  msg += `\n🕒 ${hora}`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

// START
carregarProdutos();