// Seletores dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
}

// Atualiza o estado do wrapper conforme o conteúdo do elemento
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim()

  if (!element.textContent.trim()) {
    wrapper.classList.add("is-empty")
  } else {
    wrapper.classList.remove("is-empty")
  }
}

// Atualiza o estado de todos os elementos editáveis
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Adiciona ouvintes de input para atualizar wrappers em tempo real
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })

  elements.promptContent.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
}

// Função para alternar a visibilidade da sidebar
function toggleSidebar(show) {
  const sidebar = document.querySelector(".sidebar")
  const btnOpen = elements.btnOpen

  if (show) {
    sidebar.style.display = "flex"
    btnOpen.style.display = "none"
  } else {
    sidebar.style.display = "none"
    btnOpen.style.display = "flex"
  }
}

function attachSidebarHandlers() {
  // Botão de abrir a sidebar
  elements.btnOpen.addEventListener("click", () => {
    toggleSidebar(true)
  })

  // Botão de fechar a sidebar
  elements.btnCollapse.addEventListener("click", () => {
    toggleSidebar(false)
  })
}

function init() {
  attachAllEditableHandlers()
  updateAllEditableStates() // Initialize states on load
  attachSidebarHandlers() // Adiciona handlers da sidebar
  toggleSidebar(true) // Inicializa com a sidebar aberta
}

init() // Start the application
