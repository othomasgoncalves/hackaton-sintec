window.Denuncia = (function () {
  var CHAVE = "dengue-zero-nl-denuncias";
  var CENTRO = [-22.765, -52.985];

  var STATUS = ["Aberta", "Em verificação", "Resolvida"];

  var CLASSES = {
    "Aberta": "aberta",
    "Em verificação": "verificacao",
    "Resolvida": "resolvida"
  };

  var EXEMPLOS = [
    {
      protocolo: "NL-0001",
      tipo: "Lote vago com lixo",
      detalhes: "Terreno sem muro com sacos de lixo e água acumulada em caixas de isopor.",
      lat: -22.7612,
      lng: -52.9892,
      data: "2026-10-12T09:20:00",
      status: "Aberta"
    },
    {
      protocolo: "NL-0002",
      tipo: "Pneus expostos",
      detalhes: "Pneus empilhados na calçada, cheios de água depois da chuva.",
      lat: -22.7705,
      lng: -52.9798,
      data: "2026-10-15T17:05:00",
      status: "Em verificação"
    },
    {
      protocolo: "NL-0003",
      tipo: "Piscina suja",
      detalhes: "Piscina de casa fechada, água verde e sem tratamento há semanas.",
      lat: -22.7588,
      lng: -52.9762,
      data: "2026-10-17T08:40:00",
      status: "Resolvida"
    }
  ];

  var lista = [];
  var locais = [];
  var daNuvem = [];
  var avisouOffline = false;
  var relogioSincronia = null;
  var mapa = null;
  var camadaFocos = null;
  var marcadorNovo = null;
  var pontoEscolhido = null;
  var tipoEscolhido = null;

  function recompor() {
    if (window.Nuvem.ativa()) {
      lista = EXEMPLOS.concat(daNuvem);
      return;
    }
    lista = locais;
  }

  function carregar() {
    locais = [];
    try {
      var salvo = window.localStorage.getItem(CHAVE);
      if (salvo) {
        var convertido = JSON.parse(salvo);
        if (convertido && convertido.length) {
          locais = convertido;
        }
      }
    } catch (erro) {
      locais = [];
    }
    if (!locais.length) {
      locais = EXEMPLOS.slice();
      salvar();
    }
    recompor();
  }

  function salvar() {
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(locais));
    } catch (erro) {
      return;
    }
  }

  function sincronizar() {
    if (!window.Nuvem.ativa()) {
      return;
    }
    window.Nuvem.listar().then(function (resultado) {
      if (!resultado) {
        if (!avisouOffline) {
          avisouOffline = true;
          window.App.mostrarToast("Sem conexão com a central, usando este aparelho", "neutro");
        }
        return;
      }
      avisouOffline = false;
      if (JSON.stringify(resultado) === JSON.stringify(daNuvem)) {
        return;
      }
      daNuvem = resultado;
      recompor();
      desenharLista();
      desenharFocos();
    });
  }

  function ligarSincronia() {
    if (!window.Nuvem.ativa() || relogioSincronia) {
      return;
    }
    relogioSincronia = window.setInterval(function () {
      if (!document.getElementById("denunciar").hidden) {
        sincronizar();
      }
    }, window.Nuvem.intervalo);
  }

  function proximoProtocolo() {
    var maior = 0;
    lista.forEach(function (item) {
      var numero = parseInt(String(item.protocolo).replace("NL-", ""), 10);
      if (!isNaN(numero) && numero > maior) {
        maior = numero;
      }
    });
    var proximo = String(maior + 1);
    while (proximo.length < 4) {
      proximo = "0" + proximo;
    }
    return "NL-" + proximo;
  }

  function formatarData(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) {
      return iso;
    }
    function dois(n) {
      return n < 10 ? "0" + n : String(n);
    }
    return dois(d.getDate()) + "/" + dois(d.getMonth() + 1) + "/" + d.getFullYear() + " às " + dois(d.getHours()) + "h" + dois(d.getMinutes());
  }

  function icone(status, novo) {
    var classe = novo ? "marcador-novo" : "marcador-" + CLASSES[status];
    return window.L.divIcon({
      className: "",
      html: '<span class="marcador-foco ' + classe + '"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -12]
    });
  }

  function escaparTexto(valor) {
    var div = document.createElement("div");
    div.textContent = valor;
    return div.innerHTML;
  }

  function desenharFocos() {
    if (!mapa) {
      return;
    }
    camadaFocos.clearLayers();
    lista.forEach(function (item) {
      var marcador = window.L.marker([item.lat, item.lng], {
        icon: icone(item.status, false),
        title: item.protocolo + ", " + item.tipo
      });
      marcador.bindPopup(
        "<strong>" + escaparTexto(item.protocolo) + "</strong><br>" +
        escaparTexto(item.tipo) + "<br>" +
        escaparTexto(item.status)
      );
      camadaFocos.addLayer(marcador);
    });
  }

  function marcarPonto(lat, lng, avisar) {
    pontoEscolhido = { lat: lat, lng: lng };
    document.getElementById("coordenada").textContent = "Ponto escolhido: " + lat.toFixed(5) + ", " + lng.toFixed(5);
    document.getElementById("erro-local").hidden = true;
    if (!mapa) {
      return;
    }
    if (marcadorNovo) {
      marcadorNovo.setLatLng([lat, lng]);
    } else {
      marcadorNovo = window.L.marker([lat, lng], {
        icon: icone("Aberta", true),
        title: "Local da nova denúncia"
      }).addTo(mapa);
    }
    if (avisar) {
      window.App.mostrarToast("Local marcado no mapa", "neutro");
    }
  }

  function montarMapa() {
    if (mapa || !window.L) {
      return;
    }
    mapa = window.L.map("mapa", {
      center: CENTRO,
      zoom: 14,
      scrollWheelZoom: false
    });
    window.L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "Mapa OpenStreetMap"
    }).addTo(mapa);
    camadaFocos = window.L.layerGroup().addTo(mapa);
    mapa.on("click", function (evento) {
      marcarPonto(evento.latlng.lat, evento.latlng.lng, false);
    });
    desenharFocos();
  }

  function ajustarMapa() {
    montarMapa();
    sincronizar();
    if (mapa) {
      window.setTimeout(function () {
        mapa.invalidateSize();
      }, 360);
    }
  }

  function desenharLista() {
    var alvo = document.getElementById("lista-denuncias");
    alvo.textContent = "";

    if (!lista.length) {
      var vazia = document.createElement("li");
      vazia.className = "lista-vazia";
      vazia.textContent = "Nenhuma denúncia registrada por aqui ainda.";
      alvo.appendChild(vazia);
      return;
    }

    var ordenada = lista.slice().sort(function (a, b) {
      return new Date(b.data) - new Date(a.data);
    });

    ordenada.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "denuncia";

      var info = document.createElement("div");
      info.className = "denuncia-info";

      var protocolo = document.createElement("span");
      protocolo.className = "denuncia-protocolo";
      protocolo.textContent = item.protocolo;

      var tipo = document.createElement("span");
      tipo.className = "denuncia-tipo";
      tipo.textContent = item.tipo;

      var data = document.createElement("span");
      data.className = "denuncia-data";
      data.textContent = formatarData(item.data);

      info.appendChild(protocolo);
      info.appendChild(tipo);
      info.appendChild(data);

      var selo = document.createElement("button");
      selo.type = "button";
      selo.className = "selo botao-selo selo-" + CLASSES[item.status];
      selo.textContent = item.status;
      selo.setAttribute("aria-label", "Status da denúncia " + item.protocolo + ": " + item.status + ". Toque para avançar o status.");
      selo.addEventListener("click", function () {
        var posicao = STATUS.indexOf(item.status);
        item.status = STATUS[(posicao + 1) % STATUS.length];
        if (item.nuvemId) {
          window.Nuvem.atualizarStatus(item.nuvemId, item.status);
        } else {
          salvar();
        }
        desenharLista();
        desenharFocos();
        window.App.mostrarToast(item.protocolo + " agora está " + item.status.toLowerCase(), "neutro");
      });

      li.appendChild(info);
      li.appendChild(selo);
      alvo.appendChild(li);
    });
  }

  function limparFormulario() {
    document.getElementById("form-denuncia").reset();
    document.getElementById("campo-detalhes").value = "";
    tipoEscolhido = null;
    document.querySelectorAll("#chips-tipo .chip-selecionavel").forEach(function (chip) {
      chip.classList.remove("ativo");
      chip.setAttribute("aria-checked", "false");
    });
    removerFoto();
  }

  function removerFoto() {
    var previa = document.getElementById("previa-foto");
    previa.hidden = true;
    previa.removeAttribute("src");
    document.getElementById("area-foto-vazia").hidden = false;
    document.getElementById("btn-remover-foto").hidden = true;
    document.getElementById("campo-foto").value = "";
  }

  function ligarFoto() {
    var campo = document.getElementById("campo-foto");
    campo.addEventListener("change", function () {
      var arquivo = campo.files && campo.files[0];
      if (!arquivo) {
        removerFoto();
        return;
      }
      var leitor = new FileReader();
      leitor.onload = function () {
        var previa = document.getElementById("previa-foto");
        previa.src = leitor.result;
        previa.hidden = false;
        document.getElementById("area-foto-vazia").hidden = true;
        document.getElementById("btn-remover-foto").hidden = false;
      };
      leitor.readAsDataURL(arquivo);
    });
    document.getElementById("btn-remover-foto").addEventListener("click", removerFoto);
  }

  function ligarTipos() {
    document.querySelectorAll("#chips-tipo .chip-selecionavel").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll("#chips-tipo .chip-selecionavel").forEach(function (outro) {
          outro.classList.remove("ativo");
          outro.setAttribute("aria-checked", "false");
        });
        chip.classList.add("ativo");
        chip.setAttribute("aria-checked", "true");
        tipoEscolhido = chip.getAttribute("data-valor");
        document.getElementById("erro-tipo").hidden = true;
      });
    });
  }

  function ligarLocalizacao() {
    document.getElementById("btn-localizacao").addEventListener("click", function () {
      if (!navigator.geolocation) {
        window.App.mostrarToast("Este aparelho não informa a localização", "erro");
        return;
      }
      window.App.mostrarToast("Buscando a sua localização", "neutro");
      navigator.geolocation.getCurrentPosition(function (posicao) {
        montarMapa();
        var lat = posicao.coords.latitude;
        var lng = posicao.coords.longitude;
        marcarPonto(lat, lng, true);
        if (mapa) {
          mapa.setView([lat, lng], 16);
        }
      }, function () {
        window.App.mostrarToast("Não foi possível obter a localização, toque no mapa", "erro");
      }, { enableHighAccuracy: true, timeout: 10000 });
    });
  }

  function enviar(evento) {
    evento.preventDefault();
    var valido = true;

    if (!tipoEscolhido) {
      document.getElementById("erro-tipo").hidden = false;
      valido = false;
    }
    if (!pontoEscolhido) {
      document.getElementById("erro-local").hidden = false;
      valido = false;
    }
    if (!valido) {
      window.App.mostrarToast("Confira os campos destacados", "erro");
      var primeiroErro = document.querySelector(".erro-campo:not([hidden])");
      if (primeiroErro) {
        primeiroErro.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    var nova = {
      protocolo: proximoProtocolo(),
      tipo: tipoEscolhido,
      detalhes: document.getElementById("campo-detalhes").value.trim(),
      lat: pontoEscolhido.lat,
      lng: pontoEscolhido.lng,
      data: new Date().toISOString(),
      status: "Aberta"
    };

    if (window.Nuvem.ativa()) {
      daNuvem.push(nova);
      recompor();
      window.Nuvem.enviar({
        protocolo: nova.protocolo,
        tipo: nova.tipo,
        detalhes: nova.detalhes,
        lat: nova.lat,
        lng: nova.lng,
        data: nova.data,
        status: nova.status
      }).then(function (id) {
        if (id) {
          nova.nuvemId = id;
          return;
        }
        locais.push(nova);
        salvar();
        window.App.mostrarToast("Sem conexão, salvo só neste aparelho", "neutro");
      });
    } else {
      locais.push(nova);
      salvar();
      recompor();
    }

    desenharLista();
    desenharFocos();

    if (marcadorNovo && mapa) {
      mapa.removeLayer(marcadorNovo);
      marcadorNovo = null;
    }
    pontoEscolhido = null;
    document.getElementById("coordenada").textContent = "Nenhum ponto escolhido.";
    limparFormulario();

    window.App.mostrarToast("Denúncia " + nova.protocolo + " enviada", "sucesso");
    document.getElementById("cartao-mapa").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function iniciar() {
    carregar();
    desenharLista();
    ligarFoto();
    ligarTipos();
    ligarLocalizacao();
    ligarSincronia();
    sincronizar();
    document.getElementById("form-denuncia").addEventListener("submit", enviar);
  }

  return {
    iniciar: iniciar,
    ajustarMapa: ajustarMapa
  };
})();
