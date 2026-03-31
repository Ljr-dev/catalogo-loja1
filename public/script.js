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

  lista.sort((a, b) => a.nome.localeCompare(b.nome));

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

        <input type="number" step="${p.tipo === 'decimal' ? '0.1' : '1'}"
          value="${qtd}" class="input-qtd"
          oninput="setQtd('${p.nome}', this.value, ${p.preco}, '${p.tipo}', '${p.unidade}')">

        <button onclick="mais('${p.nome}', ${p.preco}, '${p.tipo}', '${p.unidade}')">+</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ➕
function mais(nome, preco, tipo, unidade) {
  if (!carrinho[nome]) {
    carrinho[nome] = { nome, preco, quantidade: 0, tipo, unidade };
  }

  if (tipo === "decimal") {
    carrinho[nome].quantidade = parseFloat(
      (carrinho[nome].quantidade + 0.1).toFixed(2)
    );
  } else {
    carrinho[nome].quantidade += 1;
  }

  atualizarTudo();
}

// ➖
function menos(nome) {
  if (carrinho[nome]) {
    carrinho[nome].quantidade--;

    if (carrinho[nome].quantidade <= 0) {
      delete carrinho[nome];
    }
  }

  atualizarTudo();
}

// ✏️
function setQtd(nome, valor, preco, tipo, unidade) {
  let qtd = parseFloat(valor) || 0;

  if (qtd <= 0) {
    delete carrinho[nome];
  } else {
    carrinho[nome] = { nome, preco, quantidade: qtd, tipo, unidade };
  }

  atualizarTudo();
}

// 🔄
function atualizarTudo() {
  atualizarResumo();
  atualizarCarrinho();
  aplicarFiltros();
}

// 🛒
function atualizarCarrinho() {
  const box = document.getElementById("carrinho-itens");
  box.innerHTML = "";

  Object.values(carrinho).forEach(p => {
    const div = document.createElement("div");
    div.className = "item-carrinho";

    const subtotal = p.preco * p.quantidade;

    div.innerHTML = `
      <span>${p.nome} (${p.quantidade} ${p.unidade})</span>
      <span>R$ ${subtotal.toFixed(2).replace(".", ",")}</span>
    `;

    box.appendChild(div);
  });
}

// 💰
function atualizarResumo() {
  let total = 0;
  let itens = 0;

  Object.values(carrinho).forEach(p => {
    total += p.preco * p.quantidade;
    itens += p.tipo === "int" ? p.quantidade : 1;
  });

  document.getElementById("resumo").innerText =
    `${itens} itens | R$ ${total.toFixed(2).replace(".", ",")}`;

  document.getElementById("btnEnviar").style.display =
    total > 0 ? "block" : "none";
}

// 📲
function enviar() {
  let total = 0;
  let nomeCliente = document.getElementById("nome").value || "Cliente";

  let msg = `🛒 Pedido de ${nomeCliente}\n\n`;

  Object.values(carrinho).forEach(p => {
    msg += `• ${p.nome} (${p.quantidade} ${p.unidade})\n`;
    total += p.preco * p.quantidade;
  });

  msg += `\n💰 Total: R$ ${total.toFixed(2)}`;

  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`);
}

// START
carregarProdutos();