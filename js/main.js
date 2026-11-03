/* ==========================================================
   Turma do Bem - JavaScript único do site
   ----------------------------------------------------------
   1. Menu do celular
   2. Link da página atual no menu
   3. Ano no rodapé
   4. Animação ao rolar a página
   5. Perguntas frequentes (uma aberta por vez)
   6. Validação dos formulários
   7. Filtro da tabela de doadores
   ========================================================== */

// Avisa o CSS que o JavaScript está ativo (usado nas animações).
document.documentElement.classList.add("js");


// 1. Menu do celular: abre e fecha a lista de links.
const botaoMenu = document.querySelector(".menu-botao");
const navegacao = document.querySelector(".topo nav");

if (botaoMenu && navegacao) {
  botaoMenu.addEventListener("click", function () {
    const aberto = navegacao.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded", aberto);
  });
}


// 2. Destaca no menu o link da página que está aberta.
const paginaAtual = location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".menu a").forEach(function (link) {
  if (link.getAttribute("href") === paginaAtual) {
    link.classList.add("ativo");
    link.setAttribute("aria-current", "page");
  }
});


// 3. Mantém o ano do rodapé sempre atualizado.
document.querySelectorAll("[data-ano]").forEach(function (elemento) {
  elemento.textContent = new Date().getFullYear();
});


// 4. Faz os blocos com a classe "revelar" aparecerem ao rolar.
const blocos = document.querySelectorAll(".revelar");

if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visivel");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15 });

  blocos.forEach(function (bloco) {
    observador.observe(bloco);
  });
} else {
  blocos.forEach(function (bloco) {
    bloco.classList.add("visivel");
  });
}


// 5. Ao abrir uma pergunta, fecha as outras.
const perguntas = document.querySelectorAll(".faq details");

perguntas.forEach(function (pergunta) {
  pergunta.addEventListener("toggle", function () {
    if (!pergunta.open) return;

    perguntas.forEach(function (outra) {
      if (outra !== pergunta) outra.open = false;
    });
  });
});


// 6. Validação dos formulários de cadastro, login e contato.
// Expressão regular (regex) que confere o formato do email:
// ^[^\s@]+  -> começa com 1 ou mais caracteres que não são espaço nem @
// @         -> precisa ter um @
// [^\s@]+   -> depois do @, o domínio (ex.: gmail)
// \.        -> um ponto literal
// [^\s@]+$  -> termina com a extensão (ex.: com)
const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Recebe um campo e devolve o texto do erro.
// Se devolver "" (vazio), o campo está válido.
function validarCampo(campo) {
  // trim() tira os espaços das pontas, assim "   " conta como vazio.
  const valor = campo.value.trim();

  if (campo.required && valor === "") {
    return "Preencha todos os campos.";
  }

  if (campo.type === "email" && !emailValido.test(valor)) {
    return "Digite um email válido.";
  }

  // minLength vale -1 quando o campo não define tamanho mínimo,
  // por isso só comparamos quando ele é maior que 0.
  // TODO: tornar a mensagem genérica (hoje ela fala sempre em "senha").
  if (campo.minLength > 0 && valor.length < campo.minLength) {
    return "A senha precisa ter pelo menos " + campo.minLength + " caracteres.";
  }

  return "";
}

function mostrarAviso(aviso, texto, tipo) {
  aviso.textContent = texto;
  aviso.className = "aviso " + tipo;
}

document.querySelectorAll("form[data-validar]").forEach(function (formulario) {
  const aviso = formulario.querySelector(".aviso");
  const campos = formulario.querySelectorAll("input, select, textarea");

  // Remove a marcação de erro assim que a pessoa corrige o campo.
  campos.forEach(function (campo) {
    campo.addEventListener("input", function () {
      campo.classList.remove("invalido");
      campo.removeAttribute("aria-invalid");
    });
  });

  formulario.addEventListener("submit", function (evento) {
    // preventDefault() impede o envio padrão do navegador, que recarregaria
    // a página. Assim a validação roda antes e podemos mostrar o aviso.
    evento.preventDefault();

    // Guarda só o primeiro erro para mostrar uma mensagem por vez,
    // e leva o foco do teclado para esse campo.
    let primeiroErro = "";

    campos.forEach(function (campo) {
      if (campo.type === "checkbox") return;

      const erro = validarCampo(campo);
      campo.classList.toggle("invalido", erro !== "");

      if (erro) {
        // aria-invalid avisa leitores de tela que o campo está com erro (acessibilidade).
        campo.setAttribute("aria-invalid", "true");
        if (!primeiroErro) {
          primeiroErro = erro;
          campo.focus();
        }
      }
    });

    if (primeiroErro) {
      mostrarAviso(aviso, primeiroErro, "erro");
      return;
    }

    mostrarAviso(aviso, formulario.dataset.sucesso, "sucesso");
    formulario.reset();

    // Leva para a próxima página, quando o formulário pedir.
    // dataset lê atributos "data-*" do HTML. Aqui, data-sucesso e data-destino
    // definem a mensagem e a próxima página de cada formulário,
    // então o mesmo JavaScript serve para login, cadastro e contato.
    const destino = formulario.dataset.destino;
    if (destino) {
      setTimeout(function () {
        location.href = destino;
      }, 1400);
    }
  });
});


// 7. Filtra a tabela de doadores pelo nome e pela situação.
const busca = document.getElementById("busca-doador");
const filtroStatus = document.getElementById("filtro-status");
const linhas = document.querySelectorAll("#doadores tbody tr[data-status]");
const semResultado = document.getElementById("sem-resultado");

function filtrarDoadores() {
  const texto = busca.value.trim().toLowerCase();
  const status = filtroStatus.value;
  let visiveis = 0;

  linhas.forEach(function (linha) {
    const combinaTexto = linha.textContent.toLowerCase().includes(texto);
    const combinaStatus = status === "todos" || linha.dataset.status === status;
    const mostrar = combinaTexto && combinaStatus;

    // linha.hidden = true esconde a linha da tabela sem apagá-la do HTML.
    // includes() procura o texto digitado dentro do texto da linha inteira;
    // toLowerCase() nos dois lados faz a busca ignorar maiúsculas e minúsculas.
    linha.hidden = !mostrar;
    if (mostrar) visiveis++;
  });

  semResultado.hidden = visiveis > 0;
}

// O "if" protege as outras páginas: só liga os eventos se os elementos
// existirem (eles só existem em painel.html).
if (busca && filtroStatus) {
  busca.addEventListener("input", filtrarDoadores);
  filtroStatus.addEventListener("change", filtrarDoadores);
}