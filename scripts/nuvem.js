window.Nuvem = (function () {
  var CONFIG = {
    base: "",
    tempoLimite: 8000,
    intervaloSincronia: 12000
  };

  function ativa() {
    return typeof CONFIG.base === "string" && CONFIG.base.indexOf("https://") === 0 && Boolean(window.fetch);
  }

  function endereco(caminho) {
    return CONFIG.base.replace(/\/+$/, "") + "/denuncias" + caminho + ".json";
  }

  function requisitar(caminho, opcoes) {
    var configuracao = opcoes || {};
    var controle = window.AbortController ? new window.AbortController() : null;
    var relogio = null;

    if (controle) {
      configuracao.signal = controle.signal;
      relogio = window.setTimeout(function () {
        controle.abort();
      }, CONFIG.tempoLimite);
    }

    return window.fetch(endereco(caminho), configuracao)
      .then(function (resposta) {
        if (relogio) {
          window.clearTimeout(relogio);
        }
        if (!resposta.ok) {
          throw new Error("resposta " + resposta.status);
        }
        return resposta.json();
      })
      .catch(function (erro) {
        if (relogio) {
          window.clearTimeout(relogio);
        }
        throw erro;
      });
  }

  function paraLista(objeto) {
    var lista = [];
    var chave;
    if (!objeto) {
      return lista;
    }
    for (chave in objeto) {
      if (Object.prototype.hasOwnProperty.call(objeto, chave) && objeto[chave]) {
        var item = objeto[chave];
        item.nuvemId = chave;
        lista.push(item);
      }
    }
    return lista;
  }

  function listar() {
    if (!ativa()) {
      return Promise.resolve(null);
    }
    return requisitar("", { cache: "no-store" })
      .then(paraLista)
      .catch(function () {
        return null;
      });
  }

  function enviar(denuncia) {
    if (!ativa()) {
      return Promise.resolve(null);
    }
    return requisitar("", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(denuncia)
    })
      .then(function (resposta) {
        return resposta && resposta.name ? resposta.name : null;
      })
      .catch(function () {
        return null;
      });
  }

  function atualizarStatus(nuvemId, status) {
    if (!ativa() || !nuvemId) {
      return Promise.resolve(false);
    }
    return requisitar("/" + nuvemId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status })
    })
      .then(function () {
        return true;
      })
      .catch(function () {
        return false;
      });
  }

  return {
    ativa: ativa,
    listar: listar,
    enviar: enviar,
    atualizarStatus: atualizarStatus,
    intervalo: CONFIG.intervaloSincronia
  };
})();
