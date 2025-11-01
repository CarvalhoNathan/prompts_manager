// Chave para indenficar os dados salvos pela nossa aplicação no navegador.
const STORAGE_KEY = "prompts_storage"

// Estado carregar os prompts salvos e exibir.
const state = {
  prompts: [],
  selectedID: null,
}

// Seletores dos elementos HTML por ID
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
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
  const isMobile = window.matchMedia("(max-width: 950px)").matches

  if (isMobile) {
    // Comportamento móvel
    if (show) {
      sidebar.classList.add("open")
    } else {
      sidebar.classList.remove("open")
    }
  } else {
    // Comportamento desktop
    if (show) {
      sidebar.style.width = "400px"
      sidebar.style.display = "flex"
    } else {
      sidebar.style.width = "0"
      setTimeout(() => {
        sidebar.style.display = "none"
      }, 200)
    }
  }

  btnOpen.style.display = show ? "none" : "flex"
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

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()

  if (!title || !hasContent) {
    alert(
      "Por favor, preencha tanto o título quanto o conteúdo do prompt antes de salvar."
    )
    return
  }

  if (state.selectedID) {
    // Editando um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedID)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || "Sem conteúdo"
    }
  } else {
    // Criando um novo prompt
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
    }

    state.prompts.unshift(newPrompt) // Adiciona no início da lista
    state.selectedID = newPrompt.id // Seleciona o novo prompt
  }

  renderList(elements.search.value) // Re-renderiza a lista com o filtro atual
  persist() // Salva no armazenamento local
  alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.log("Erro ao salvar os prompts no armazenamento local:", error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedID = null
  } catch (error) {
    console.log("Erro ao carregar os prompts do armazenamento local:", error)
  }
}

// Cria o HTML de um item de prompt para a lista
function createPromptItem(prompt) {
  const tmp = document.createElement("div")
  tmp.innerHTML = prompt.content
  return `
    <li class="prompt-item" data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-content">
        <h3 class="prompt-item-title">${prompt.title}</h3>
        <p class="prompt-item-description">${tmp.textContent}</p>
      </div>
      <button class="btn-icon" title="Remover" data-action="remove">
        <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
      </button>
    </li>
  `
}

// Renderiza a lista de prompts na sidebar
function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML = filteredPrompts
}

function newPrompt() {
  state.selectedID = null
  elements.promptTitle.textContent = ""
  elements.promptContent.innerHTML = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

function copySelected() {
  try {
    const content = elements.promptContent

    if (!navigator.clipboard) {
      alert("A API de área de transferência não é suportada neste navegador.")
      return
    }

    navigator.clipboard.writeText(content.innerText)

    alert("Conteúdo do prompt copiado para a área de transferência!")
  } catch (error) {
    console.log("Erro ao copiar o conteúdo do prompt:", error)
  }
}

// Eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.search.addEventListener("input", function (event) {
  renderList(event.target.value)
})

elements.list.addEventListener("click", function (event) {
  const removeBtn = event.target.closest('button[data-action="remove"]')
  const item = event.target.closest("[data-id]")

  if (!item) return // Sai se não clicou em um item válido

  const id = item.getAttribute("data-id")
  state.selectedID = id

  // Remover prompt
  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  }

  if (event.target.closest('[data-action="select"]')) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

function init() {
  load() // Carrega os prompts salvos
  renderList() // Renderiza a lista de prompts
  attachAllEditableHandlers() // Adiciona handlers de edição
  updateAllEditableStates() // Initialize states on load
  attachSidebarHandlers() // Adiciona handlers da sidebar
  toggleSidebar(true) // Inicializa com a sidebar aberta
}

init() // Start the application
