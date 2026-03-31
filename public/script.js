const numero = "5519982144043";

let produtos = [];
let carrinho = {};
let categoriaAtual = "Todos";
let categorias = [];

// 🚀 CARREGAR
async function carregarProdutos() {
  const res = await fetch("/produtos");
  produtos = await res.json();

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

    // 🔥 GARANTE QUE ACTIVE FUNCIONE
    btn.className = "cat-btn";
    if (cat === categoriaAtual) {
      btn.classList.add("active");
    }

    btn.innerText = cat;

    btn.onclick = () => {
      categoriaAtual = cat;

      renderCategorias(); // 🔥 ESSENCIAL (corrige o bug)
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

  lista.forEach(p => {
    const qtd = carrinho[p.nome]?.quantidade || 0;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div class="card-top">
        <div>
          <h3>${p.nome}</h3>
          <small>${p.categoria}</small>
        </div>
        <div class="preco">
          R$ ${p.preco.toFixed(2).replace(".", ",")}
        </div>
      </div>

      <div class="controle">
        <button onclick="menos('${p.nome}')">−</button>

        <input type="number"
          value="${qtd}"
          class="input-qtd"
          oninput="setQtd('${p.nome}', this.value, ${p.preco})">

        <button onclick="mais('${p.nome}', ${p.preco})">+</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ➕
function mais(nome, preco) {
  if (!carrinho[nome]) {
    carrinho[nome] = { nome, preco, quantidade: 0 };
  }

  carrinho[nome].quantidade++;
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
function setQtd(nome, valor, preco) {
  let qtd = parseFloat(valor) || 0;

  if (qtd <= 0) {
    delete carrinho[nome];
  } else {
    carrinho[nome] = { nome, preco, quantidade: qtd };
  }

  atualizarTudo();
}

// 🔄
function atualizarTudo() {
  atualizarResumo();
  atualizarCarrinho();
}

// 🛒
function atualizarCarrinho() {
  const box = document.getElementById("carrinho-itens");
  box.innerHTML = "";

  Object.values(carrinho).forEach(p => {
    const div = document.createElement("div");
    div.innerText = `${p.nome} (${p.quantidade})`;
    box.appendChild(div);
  });
}

// 💰
function atualizarResumo() {
  let total = 0;
  let itens = 0;

  Object.values(carrinho).forEach(p => {
    total += p.preco * p.quantidade;
    itens += p.quantidade;
  });

  document.getElementById("resumo").innerText =
    `${itens} itens | R$ ${total.toFixed(2).replace(".", ",")}`;

  document.getElementById("btnEnviar").style.display =
    total > 0 ? "block" : "none";
}

// 📲
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