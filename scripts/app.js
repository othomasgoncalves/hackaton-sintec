window.App = (function () {
  var CHAVE_ABERTURA = "dengue-zero-nl-abertura";
  var TELAS = ["abertura", "inicio", "checklist", "denunciar", "sintomas"];

  var irParaMapa = false;

  function mostrarToast(mensagem, tipo) {
    var area = document.getElementById("area-toast");
    var toast = document.createElement("div");
    toast.className = "toast toast-" + (tipo || "neutro");
    toast.textContent = mensagem;
    area.appendChild(toast);
    window.setTimeout(function () {
      toast.classList.add("toast-saindo");
      window.setTimeout(function () {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 260);
    }, 2600);
  }

  function aberturaVista() {
    try {
      return window.localStorage.getItem(CHAVE_ABERTURA) === "1";
    } catch (erro) {
      return false;
    }
  }

  function marcarAberturaVista() {
    try {
      window.localStorage.setItem(CHAVE_ABERTURA, "1");
    } catch (erro) {
      return;
    }
  }

  function atualizarNavegacao(destino) {
    document.querySelectorAll(".item-nav").forEach(function (item) {
      var alvo = item.getAttribute("data-nav");
      var ativo = alvo === destino || (destino === "denunciar" && alvo === "denunciar");
      item.classList.toggle("ativo", ativo);
      if (ativo) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  function rolarAoMapa() {
    var cartao = document.getElementById("cartao-mapa");
    window.setTimeout(function () {
      cartao.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 220);
  }

  function mostrarTela(destino) {
    if (TELAS.indexOf(destino) === -1) {
      destino = aberturaVista() ? "inicio" : "abertura";
    }
    if (destino === "abertura" && aberturaVista()) {
      destino = "inicio";
    }

    TELAS.forEach(function (nome) {
      var secao = document.getElementById(nome);
      secao.classList.remove("tela-visivel");
      secao.hidden = nome !== destino;
    });

    var atual = document.getElementById(destino);
    void atual.offsetWidth;
    atual.classList.add("tela-visivel");

    document.body.classList.toggle("sem-nav", destino === "abertura");
    atualizarNavegacao(destino);

    var topo = document.getElementById("aparelho");
    topo.scrollTop = 0;
    window.scrollTo(0, 0);

    if (destino === "denunciar") {
      window.Denuncia.ajustarMapa();
      if (irParaMapa) {
        rolarAoMapa();
      }
    }
    irParaMapa = false;
  }

  function telaDoHash() {
    return window.location.hash.replace("#", "");
  }

  function tratarHash() {
    mostrarTela(telaDoHash());
  }

  function navegar(destino) {
    if (telaDoHash() === destino) {
      mostrarTela(destino);
      return;
    }
    window.location.hash = destino;
  }

  function ligarAtalhosDeMapa() {
    document.querySelectorAll("[data-ir-mapa]").forEach(function (link) {
      link.addEventListener("click", function () {
        irParaMapa = true;
        if (telaDoHash() === "denunciar") {
          window.Denuncia.ajustarMapa();
          rolarAoMapa();
          irParaMapa = false;
        }
      });
    });
  }

  function iniciar() {
    document.getElementById("btn-comecar").addEventListener("click", function () {
      marcarAberturaVista();
      navegar("inicio");
    });

    ligarAtalhosDeMapa();
    window.addEventListener("hashchange", tratarHash);

    window.Clima.iniciar();
    window.Checklist.iniciar();
    window.Denuncia.iniciar();
    window.Sintomas.iniciar();

    var inicial = telaDoHash();
    if (TELAS.indexOf(inicial) === -1) {
      inicial = aberturaVista() ? "inicio" : "abertura";
    }
    mostrarTela(inicial);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }

  return {
    mostrarToast: mostrarToast,
    navegar: navegar
  };
})();
