window.Checklist = (function () {
  var CHAVE = "dengue-zero-nl-checklist";

  var ITENS = [
    {
      id: "pratinhos",
      titulo: "Pratinhos de vasos",
      dica: "Lave com escova e sabão ou preencha com areia até a borda."
    },
    {
      id: "caixa",
      titulo: "Caixa d'água tampada",
      dica: "Verifique se a tampa veda por completo, sem frestas nas laterais."
    },
    {
      id: "calhas",
      titulo: "Calhas limpas",
      dica: "Retire folhas e teste se a água escoa sem empoçar na laje."
    },
    {
      id: "pneus",
      titulo: "Pneus guardados",
      dica: "Deixe em local coberto ou faça furos para a água escorrer."
    },
    {
      id: "garrafas",
      titulo: "Garrafas de boca para baixo",
      dica: "Vale para garrafas, baldes, regadores e bacias do quintal."
    },
    {
      id: "lixo",
      titulo: "Lixo bem fechado",
      dica: "Saco amarrado e lata com tampa evitam acúmulo de água da chuva."
    },
    {
      id: "pets",
      titulo: "Bebedouro de pets",
      dica: "Troque a água todos os dias e esfregue o fundo do recipiente."
    },
    {
      id: "ralos",
      titulo: "Ralos e piscina",
      dica: "Use tela nos ralos externos e mantenha a piscina tratada ou coberta."
    }
  ];

  var estado = {};

  function carregar() {
    estado = {};
    try {
      var salvo = window.localStorage.getItem(CHAVE);
      if (salvo) {
        estado = JSON.parse(salvo) || {};
      }
    } catch (erro) {
      estado = {};
    }
  }

  function salvar() {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (erro) {
      return;
    }
  }

  function contar() {
    var total = 0;
    var i;
    for (i = 0; i < ITENS.length; i = i + 1) {
      if (estado[ITENS[i].id]) {
        total = total + 1;
      }
    }
    return total;
  }

  function atualizarProgresso() {
    var feitos = contar();
    var barra = document.getElementById("barra-progresso");
    document.getElementById("barra-preenchida").style.width = (feitos / ITENS.length) * 100 + "%";
    document.getElementById("progresso-contagem").textContent = feitos + " de " + ITENS.length + " concluídos";
    document.getElementById("progresso-pontos").textContent = feitos * 10 + " pontos";
    barra.setAttribute("aria-valuenow", String(feitos));
    barra.setAttribute("aria-valuetext", feitos + " de " + ITENS.length + " itens concluídos");
    document.getElementById("cartao-parabens").hidden = feitos !== ITENS.length;
  }

  function montar() {
    var lista = document.getElementById("lista-checklist");
    lista.textContent = "";
    ITENS.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "item-checklist";
      li.id = "item-" + item.id;

      var rotulo = document.createElement("label");
      rotulo.className = "item-checklist-rotulo";
      rotulo.setAttribute("for", "entrada-" + item.id);

      var entrada = document.createElement("input");
      entrada.className = "item-checklist-entrada";
      entrada.type = "checkbox";
      entrada.id = "entrada-" + item.id;
      entrada.checked = Boolean(estado[item.id]);

      var marca = document.createElement("span");
      marca.className = "marca";
      marca.setAttribute("aria-hidden", "true");
      marca.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';

      var texto = document.createElement("span");
      texto.className = "item-checklist-texto";
      var titulo = document.createElement("strong");
      titulo.textContent = item.titulo;
      var dica = document.createElement("span");
      dica.textContent = item.dica;
      texto.appendChild(titulo);
      texto.appendChild(dica);

      rotulo.appendChild(entrada);
      rotulo.appendChild(marca);
      rotulo.appendChild(texto);
      li.appendChild(rotulo);
      lista.appendChild(li);

      if (entrada.checked) {
        li.classList.add("concluido");
      }

      entrada.addEventListener("change", function () {
        estado[item.id] = entrada.checked;
        li.classList.toggle("concluido", entrada.checked);
        salvar();
        atualizarProgresso();
        if (contar() === ITENS.length) {
          window.App.mostrarToast("Parabéns, vistoria da semana completa", "sucesso");
        } else if (entrada.checked) {
          window.App.mostrarToast(item.titulo + " concluído, mais 10 pontos", "sucesso");
        }
      });
    });
  }

  function reiniciar() {
    estado = {};
    salvar();
    montar();
    atualizarProgresso();
    window.App.mostrarToast("Semana reiniciada, bons dez minutos", "neutro");
  }

  function iniciar() {
    carregar();
    montar();
    atualizarProgresso();
    document.getElementById("btn-reiniciar").addEventListener("click", reiniciar);
  }

  return {
    iniciar: iniciar
  };
})();
