window.Sintomas = (function () {
  var HOSPITAL = {
    nome: "Hospital Municipal Santa Rita de Cássia",
    endereco: "Av. Aristides Martelo, 357, Centro",
    telefone: "(44) 3432-1198",
    chamada: "tel:+554434321198",
    rota: "https://www.google.com/maps/search/?api=1&query=Hospital+Municipal+Santa+Rita+de+C%C3%A1ssia%2C+Nova+Londrina%2C+PR"
  };

  var comuns = [];
  var alarmes = [];

  function alternar(chip, colecao) {
    var valor = chip.getAttribute("data-valor");
    var posicao = colecao.indexOf(valor);
    if (posicao === -1) {
      colecao.push(valor);
      chip.classList.add("ativo");
      chip.setAttribute("aria-pressed", "true");
    } else {
      colecao.splice(posicao, 1);
      chip.classList.remove("ativo");
      chip.setAttribute("aria-pressed", "false");
    }
  }

  function criarEtiquetas(valores) {
    var caixa = document.createElement("div");
    caixa.className = "resultado-lista";
    valores.forEach(function (valor) {
      var etiqueta = document.createElement("span");
      etiqueta.textContent = valor;
      caixa.appendChild(etiqueta);
    });
    return caixa;
  }

  function cartaoNeutro() {
    var cartao = document.createElement("div");
    cartao.className = "resultado resultado-neutro";
    var texto = document.createElement("p");
    texto.textContent = "Marque os sintomas acima para ver a orientação indicada para o seu caso.";
    cartao.appendChild(texto);
    return cartao;
  }

  function botaoHospital(classe) {
    var link = document.createElement("a");
    link.className = "botao " + classe;
    link.href = HOSPITAL.rota;
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML = '<svg class="icone icone-p" aria-hidden="true"><use href="#ic-hospital"></use></svg>Ver hospital';
    return link;
  }

  function cartaoAzul() {
    var cartao = document.createElement("div");
    cartao.className = "resultado resultado-azul";

    var titulo = document.createElement("h2");
    titulo.className = "resultado-titulo";
    titulo.innerHTML = '<svg class="icone icone-p" aria-hidden="true"><use href="#ic-pulso"></use></svg>Pode ser dengue';
    cartao.appendChild(titulo);

    var texto = document.createElement("p");
    texto.textContent = "Procure o " + HOSPITAL.nome + " para avaliação, na " + HOSPITAL.endereco + ". Leve um documento e o cartão do SUS, e informe há quantos dias começaram os sintomas.";
    cartao.appendChild(texto);

    cartao.appendChild(criarEtiquetas(comuns));

    var acoes = document.createElement("div");
    acoes.className = "resultado-acoes";

    var ligar = document.createElement("a");
    ligar.className = "botao botao-claro";
    ligar.href = HOSPITAL.chamada;
    ligar.innerHTML = '<svg class="icone icone-p" aria-hidden="true"><use href="#ic-telefone"></use></svg>Ligar hospital';
    acoes.appendChild(ligar);

    acoes.appendChild(botaoHospital("botao-vazado"));
    cartao.appendChild(acoes);

    return cartao;
  }

  function cartaoVermelho() {
    var cartao = document.createElement("div");
    cartao.className = "resultado resultado-vermelho";
    cartao.setAttribute("role", "alert");

    var titulo = document.createElement("h2");
    titulo.className = "resultado-titulo";
    titulo.innerHTML = '<svg class="icone icone-p" aria-hidden="true"><use href="#ic-alerta"></use></svg>Procure atendimento agora';
    cartao.appendChild(titulo);

    var texto = document.createElement("p");
    texto.textContent = "Você marcou um sinal de alarme da dengue grave. Não espere em casa: chame o SAMU agora ou vá direto ao " + HOSPITAL.nome + ", na " + HOSPITAL.endereco + ".";
    cartao.appendChild(texto);

    cartao.appendChild(criarEtiquetas(alarmes));

    var acoes = document.createElement("div");
    acoes.className = "resultado-acoes";

    var ligar = document.createElement("a");
    ligar.className = "botao botao-claro";
    ligar.href = "tel:192";
    ligar.innerHTML = '<svg class="icone icone-p" aria-hidden="true"><use href="#ic-telefone"></use></svg>Ligar 192';
    acoes.appendChild(ligar);

    acoes.appendChild(botaoHospital("botao-vazado"));

    cartao.appendChild(acoes);
    return cartao;
  }

  function atualizar() {
    var alvo = document.getElementById("resultado-sintomas");
    alvo.textContent = "";
    if (alarmes.length) {
      alvo.appendChild(cartaoVermelho());
      return;
    }
    if (comuns.length) {
      alvo.appendChild(cartaoAzul());
      return;
    }
    alvo.appendChild(cartaoNeutro());
  }

  function iniciar() {
    document.querySelectorAll("#chips-comuns .chip-selecionavel").forEach(function (chip) {
      chip.addEventListener("click", function () {
        alternar(chip, comuns);
        atualizar();
      });
    });
    document.querySelectorAll("#chips-alarme .chip-selecionavel").forEach(function (chip) {
      chip.addEventListener("click", function () {
        alternar(chip, alarmes);
        atualizar();
        if (chip.classList.contains("ativo")) {
          window.App.mostrarToast("Sinal de alarme marcado, procure atendimento", "erro");
        }
      });
    });
    atualizar();
  }

  return {
    iniciar: iniciar
  };
})();
