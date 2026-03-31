const numero = "5519982144043";

let produtos = [];
let carrinho = {};
let categoriaAtual = "Todos";

// 🚀
async function carregarProdutos() {
  const res = await fetch("/produtos");
  produtos = await res.json();

  gerarCategorias();
  aplicarFiltros();
}

// 📂
function gerarCategorias() {
  const cats = ["Todos", ...new Set(produtos.map(p => p.categoria))];
  const container = document.getElementById("categorias");
  container.innerHTML = "";

  cats.forEach(cat => {
    const btn = document.createElement("div");
    btn.className = "cat-btn";
    if (cat === categoriaAtual) btn.classList.add("active");

    btn.innerText = cat;

    btn.onclick = () => {
      categoriaAtual = cat;
      gerarCategorias();
      aplicarFiltros();
    };

    container.appendChild(btn);
  });
}

// 🔍
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

// 🔥 define se aceita decimal
function aceitaDecimal(produto) {
  return produto.categoria.toLowerCase().includes("fio");
}

// 🧱
function render(lista) {
  const container = document.getElementById("produtos");
  container.innerHTML = "";

  lista.forEach(p => {
    const qtd = carrinho[p.nome]?.quantidade || 0;
    const decimal = aceitaDecimal(p);

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <h3>${p.nome}</h3>
      <small>${p.categoria}</small>
      <div class="preco">R$ ${p.preco.toFixed(2).replace(".", ",")}</div>

      <div class="controle">
        <button onclick="menos('${p.nome}')">−</button>

        <input type="number"
          step="${decimal ? "0.1" : "1"}"
          value="${qtd}"
          oninput="setQtd('${p.nome}', this.value, ${p.preco})">

        <button onclick="mais('${p.nome}', ${p.preco})">+</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// ➕
function mais(nome, preco) {
  const p = produtos.find(x => x.nome === nome);
  const passo = aceitaDecimal(p) ? 0.5 : 1;

  if (!carrinho[nome]) {
    carrinho[nome] = { nome, preco, quantidade: 0 };
  }

  carrinho[nome].quantidade += passo;
  atualizarTudo();
}

// ➖
function menos(nome) {
  const p = produtos.find(x => x.nome === nome);
  const passo = aceitaDecimal(p) ? 0.5 : 1;

  if (carrinho[nome]) {
    carrinho[nome].quantidade -= passo;

    if (carrinho[nome].quantidade <= 0) delete carrinho[nome];
  }

  atualizarTudo();
}

// ✏️
function setQtd(nome, valor, preco) {
  let qtd = parseFloat(valor.replace(",", ".")) || 0;
  qtd = Math.round(qtd * 10) / 10;

  if (qtd <= 0) {
    delete carrinho[nome];
  } else {
    carrinho[nome] = { nome, preco, quantidade: qtd };
  }

  atualizarTudo();
}

// ❌
function remover(nome) {
  delete carrinho[nome];
  atualizarTudo();
}

// 🔄
function atualizarTudo() {
  atualizarCarrinho();
  atualizarResumo();
  aplicarFiltros();
}

// 🛒
function atualizarCarrinho() {
  const box = document.getElementById("carrinho-itens");
  box.innerHTML = "";

  Object.values(carrinho).forEach(p => {
    const subtotal = p.preco * p.quantidade;

    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div>
        <strong>${p.nome}</strong>
        <div class="mini">
          <button onclick="menos('${p.nome}')">−</button>
          <span>${p.quantidade % 1 === 0 ? p.quantidade : p.quantidade.toFixed(1)}</span>
          <button onclick="mais('${p.nome}', ${p.preco})">+</button>
        </div>
      </div>

      <div>
        <strong>R$ ${subtotal.toFixed(2).replace(".", ",")}</strong>
        <button onclick="remover('${p.nome}')">❌</button>
      </div>
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
    itens += p.quantidade;
  });

  document.getElementById("resumo").innerText =
    `${itens} itens | R$ ${total.toFixed(2).replace(".", ",")}`;

  document.getElementById("btnEnviar").style.display =
    total > 0 ? "block" : "none";
}

// 📲
function enviar() {
  let nomeCliente = document.getElementById("nome").value || "Cliente";
  let msg = `🛒 Pedido de ${nomeCliente}\n\n`;
  let total = 0;

  Object.values(carrinho).forEach(p => {
    msg += `• ${p.nome} (${p.quantidade})\n`;
    total += p.preco * p.quantidade;
  });

  msg += `\n💰 Total: R$ ${total.toFixed(2)}`;

  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`);
}

// 📱
function toggleCarrinho() {
  document.getElementById("carrinho-area").classList.toggle("open");
}

// START
carregarProdutos();