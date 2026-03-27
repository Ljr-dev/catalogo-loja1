const numero = "5519982144043";

let produtos = [];
let carrinho = {};

let categoriaAtual = "Todos";
let categorias = [];

// 🚀 CARREGAR
async function carregarProdutos() {
  const res = await fetch("/produtos");
  produtos = await res.json();

  produtos = produtos.map(p => ({
    ...p,
    tipo: (p.tipo || "int").toLowerCase(),
    unidade: (p.unidade || "un")
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

// 🔍 FILTRO
function aplicarFiltros() {
  let lista = produtos;

  if (categoriaAtual !== "Todos") {
    lista = lista.filter(p => p.categoria === categoriaAtual);
  }

  const termo = document.getElementById("busca").value.toLowerCase();

  if (termo) {
    lista = lista.filter(p => p.nome.toLowerCase().includes(termo));
  }

  render(lista);
}

// 🧱 RENDER
function render(lista) {
  const container = document.getElementById("produtos");
  container.innerHTML = "";

  lista.forEach((p) => {
    const qtd = carrinho[p.nome]?.quantidade || 0;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${p.nome}</h3>
      <p class="preco">R$ ${p.preco.toFixed(2).replace(".", ",")} / ${p.unidade}</p>

      <div class="controle">
        <button onclick="menos('${p.nome}')">−</button>

        <input type="number" value="${qtd}" class="input-qtd"
          oninput="setQtd('${p.nome}', this.value, ${p.preco}, '${p.tipo}', '${p.unidade}')">

        <button onclick="mais('${p.nome}', ${p.preco}, '${p.tipo}', '${p.unidade}')">+</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ➕ MAIS
function mais(nome, preco, tipo, unidade) {
  if (!carrinho[nome]) {
    carrinho[nome] = { nome, preco, quantidade: 0, tipo, unidade };
  }

  carrinho[nome].quantidade += tipo === "decimal" ? 0.1 : 1;

  atualizarTudo();
}

// ➖ MENOS
function menos(nome) {
  if (carrinho[nome]) {
    carrinho[nome].quantidade--;

    if (carrinho[nome].quantidade <= 0) {
      delete carrinho[nome];
    }
  }

  atualizarTudo();
}

// ✏️ INPUT
function setQtd(nome, valor, preco, tipo, unidade) {
  let qtd = parseFloat(valor) || 0;

  if (qtd <= 0) {
    delete carrinho[nome];
  } else {
    carrinho[nome] = { nome, preco, quantidade: qtd, tipo, unidade };
  }

  atualizarTudo();
}

// 🔄 ATUALIZA TUDO
function atualizarTudo() {
  atualizarResumo();
  atualizarCarrinho();
  aplicarFiltros();
}

// 🛒 CARRINHO
function atualizarCarrinho() {
  const box = document.getElementById("carrinho-itens");
  box.innerHTML = "";

  Object.values(carrinho).forEach(p => {
    const div = document.createElement("div");
    div.className = "item-carrinho";

    const subtotal = p.preco * p.quantidade;

    div.innerHTML = `
      <span>${p.nome} (${p.quantidade})</span>
      <span>R$ ${subtotal.toFixed(2)}</span>
      <button class="remover" onclick="removerItem('${p.nome}')">X</button>
    `;

    box.appendChild(div);
  });
}

// ❌ REMOVER
function removerItem(nome) {
  delete carrinho[nome];
  atualizarTudo();
}

// 💰 TOTAL
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

// 📲 WHATS
function enviar() {
  let total = 0;
  let msg = "🛒 PEDIDO\n\n";

  Object.values(carrinho).forEach(p => {
    msg += `• ${p.nome} (${p.quantidade})\n`;
    total += p.preco * p.quantidade;
  });

  msg += `\n💰 Total: R$ ${total.toFixed(2)}`;

  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`);
}

// START
carregarProdutos();