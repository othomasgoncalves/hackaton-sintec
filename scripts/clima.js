window.Clima = (function () {
  var URL_API = "https://api.open-meteo.com/v1/forecast?latitude=-22.765&longitude=-52.985&current=temperature_2m,relative_humidity_2m&daily=precipitation_sum&past_days=7&forecast_days=1&timezone=America%2FSao_Paulo";

  var EXEMPLO = {
    temperatura: 28.4,
    umidade: 74,
    chuva: 42.6
  };

  var DICAS = [
    "Vire garrafas e baldes de boca para baixo depois de usar. Água limpa parada por sete dias já vira criadouro.",
    "Lave os pratinhos dos vasos com escova e sabão. Só jogar a água fora não remove os ovos presos na parede.",
    "Coloque areia fina até a borda dos pratinhos das plantas. A planta continua regada e o mosquito não consegue pôr ovos.",
    "Confira a tampa da caixa d'água hoje. Uma fresta de dois dedos já é suficiente para o Aedes aegypti entrar.",
    "Pneus guardados devem ficar cobertos e em local protegido. Se estiverem no quintal, faça furos para a água escorrer.",
    "Limpe as calhas e a laje depois de cada chuva forte. Folha acumulada segura água por muitos dias.",
    "Troque a água do bebedouro do pet todos os dias e esfregue o fundo do recipiente.",
    "Mantenha o lixo em saco fechado e lata com tampa. Embalagem solta junta água da chuva.",
    "Coloque telas nas janelas dos quartos e use repelente de manhã e no fim da tarde, horários de maior picada.",
    "Se um vizinho tem terreno abandonado com lixo, registre uma denúncia no aplicativo. A vigilância precisa do endereço para agir."
  ];

  function limitar(valor, minimo, maximo) {
    return Math.max(minimo, Math.min(maximo, valor));
  }

  function pontosTemperatura(t) {
    if (t <= 17) {
      return 0;
    }
    if (t < 25) {
      return ((t - 17) / 8) * 30;
    }
    if (t <= 32) {
      return 40;
    }
    if (t < 39) {
      return 40 - ((t - 32) / 7) * 28;
    }
    return 8;
  }

  function pontosChuva(mm) {
    return limitar(mm / 60, 0, 1) * 35;
  }

  function pontosUmidade(u) {
    if (u <= 60) {
      return 0;
    }
    return limitar((u - 60) / 40, 0, 1) * 25;
  }

  function calcularRisco(dados) {
    var total = pontosTemperatura(dados.temperatura) + pontosChuva(dados.chuva) + pontosUmidade(dados.umidade);
    return Math.round(limitar(total, 0, 100));
  }

  function classificar(nota) {
    if (nota >= 70) {
      return {
        nivel: "Alto",
        cor: "var(--alto)",
        fundo: "var(--alto-fundo)",
        frase: "Condições muito favoráveis ao mosquito. Faça a vistoria da casa hoje e denuncie focos na vizinhança."
      };
    }
    if (nota >= 40) {
      return {
        nivel: "Médio",
        cor: "var(--medio)",
        fundo: "var(--medio-fundo)",
        frase: "Calor e umidade aceleram os ovos. Reserve dez minutos para checar vasos, calhas e caixa d'água."
      };
    }
    return {
      nivel: "Baixo",
      cor: "var(--baixo)",
      fundo: "var(--baixo-fundo)",
      frase: "Risco baixo para hoje. Mantenha a rotina de prevenção para não acumular criadouros."
    };
  }

  function somarChuva(lista) {
    var soma = 0;
    var i;
    for (i = 0; i < lista.length; i = i + 1) {
      if (typeof lista[i] === "number") {
        soma = soma + lista[i];
      }
    }
    return soma;
  }

  function numeroBr(valor, casas) {
    return valor.toFixed(casas).replace(".", ",");
  }

  function animarNota(elemento, destino) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elemento.textContent = String(destino);
      return;
    }
    var atual = 0;
    var passo = Math.max(1, Math.round(destino / 28));
    var timer = window.setInterval(function () {
      atual = atual + passo;
      if (atual >= destino) {
        atual = destino;
        window.clearInterval(timer);
      }
      elemento.textContent = String(atual);
    }, 26);
  }

  function pintar(dados, offline) {
    var nota = calcularRisco(dados);
    var classe = classificar(nota);
    var anel = document.getElementById("anel-risco");
    var chip = document.getElementById("chip-nivel");

    document.getElementById("risco-esqueleto").hidden = true;
    document.getElementById("risco-dados").hidden = false;

    anel.style.setProperty("--grau", String(Math.round(nota * 3.6)));
    anel.style.setProperty("--cor-anel", classe.cor);
    anel.setAttribute("aria-label", "Nota de risco de hoje: " + nota + " de 100, nível " + classe.nivel);

    animarNota(document.getElementById("anel-nota"), nota);

    chip.textContent = "Risco " + classe.nivel;
    chip.style.setProperty("--nivel-cor", classe.cor);
    chip.style.setProperty("--nivel-fundo", classe.fundo);

    document.getElementById("risco-frase").textContent = classe.frase;
    document.getElementById("valor-temperatura").textContent = numeroBr(dados.temperatura, 1) + "°C";
    document.getElementById("valor-chuva").textContent = numeroBr(dados.chuva, 1) + " mm";
    document.getElementById("valor-umidade").textContent = Math.round(dados.umidade) + "%";
    document.getElementById("selo-offline").hidden = !offline;
  }

  function buscar() {
    if (!window.fetch) {
      pintar(EXEMPLO, true);
      return;
    }
    window.fetch(URL_API)
      .then(function (resposta) {
        if (!resposta.ok) {
          throw new Error("resposta inválida");
        }
        return resposta.json();
      })
      .then(function (json) {
        var chuva = json.daily && json.daily.precipitation_sum ? somarChuva(json.daily.precipitation_sum.slice(-7)) : 0;
        pintar({
          temperatura: json.current.temperature_2m,
          umidade: json.current.relative_humidity_2m,
          chuva: chuva
        }, false);
      })
      .catch(function () {
        pintar(EXEMPLO, true);
      });
  }

  function sortearDica() {
    var alvo = document.getElementById("dica-texto");
    var anterior = alvo.textContent;
    var escolhida = anterior;
    var tentativas = 0;
    while (escolhida === anterior && tentativas < 10) {
      escolhida = DICAS[Math.floor(Math.random() * DICAS.length)];
      tentativas = tentativas + 1;
    }
    alvo.textContent = escolhida;
  }

  function iniciar() {
    sortearDica();
    document.getElementById("btn-nova-dica").addEventListener("click", function () {
      sortearDica();
      window.App.mostrarToast("Nova dica sorteada", "neutro");
    });
    document.getElementById("btn-notificacao").addEventListener("click", function () {
      window.App.mostrarToast("Nenhum alerta novo da vigilância", "neutro");
    });
    buscar();
  }

  return {
    iniciar: iniciar,
    calcularRisco: calcularRisco,
    classificar: classificar
  };
})();
