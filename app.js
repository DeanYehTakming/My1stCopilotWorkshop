// 這段程式碼用來管理待辦清單的資料與互動行為。
// 程式會將資料存放在 localStorage 中，讓重新整理後仍然保留原本的待辦事項。

const STORAGE_KEY = 'todo-list-data';

const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const todoCount = document.getElementById('todoCount');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

// 讀取 localStorage 中的待辦資料。
// 如果沒有資料，則回傳空陣列。
function loadTodos() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return [];
  }

  try {
    const parsedData = JSON.parse(savedData);
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error('讀取待辦資料失敗：', error);
    return [];
  }
}

let todos = loadTodos();

// 將目前待辦資料存回 localStorage。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 取得已完成項目的數量。
function getCompletedCount() {
  return todos.filter((todo) => todo.completed).length;
}

// 取得依照目前篩選條件，要顯示的待辦事項。
function getVisibleTodos() {
  if (currentFilter === 'active') {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === 'completed') {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

// 依照目前篩選條件決定空狀態訊息。
function getEmptyMessage() {
  if (todos.length === 0) {
    return '還沒有任何待辦事項,新增一個吧!';
  }

  if (currentFilter === 'active') {
    return '太棒了,目前沒有未完成的事項!';
  }

  if (currentFilter === 'completed') {
    return '目前沒有已完成的事項。這些項目只是被目前篩選條件過濾掉,並未被刪除。';
  }

  return '還沒有任何待辦事項,新增一個吧!';
}

// 更新底部顯示的未完成數量。
function updateTodoCount() {
  const remainingCount = todos.filter((todo) => !todo.completed).length;
  todoCount.textContent = `未完成: ${remainingCount} 項`;
}

// 更新清除已完成按鈕的顯示狀態。
function updateClearCompletedButton() {
  const completedCount = getCompletedCount();
  const hasCompletedTodos = completedCount > 0;

  clearCompletedBtn.hidden = !hasCompletedTodos;
  clearCompletedBtn.disabled = !hasCompletedTodos;
  clearCompletedBtn.setAttribute(
    'aria-label',
    hasCompletedTodos ? '清除所有已完成項目' : '目前沒有已完成項目可清除'
  );
}

// 根據目前篩選結果，決定是否顯示空狀態提示。
function updateEmptyState(visibleTodos) {
  const shouldShowEmptyState = visibleTodos.length === 0;
  emptyState.textContent = getEmptyMessage();
  emptyState.classList.toggle('visible', shouldShowEmptyState);
}

// 建立一個待辦項目 DOM 節點。
function createTodoItem(todo) {
  const item = document.createElement('li');
  item.className = 'todo-item';
  item.dataset.id = String(todo.id);

  if (todo.completed) {
    item.classList.add('completed');
  }

  const main = document.createElement('label');
  main.className = 'todo-main';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.dataset.id = String(todo.id);
  checkbox.setAttribute('aria-label', '完成待辦事項');

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = todo.text;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.dataset.id = String(todo.id);
  deleteBtn.textContent = '刪除';
  deleteBtn.setAttribute('aria-label', '刪除待辦事項');

  main.appendChild(checkbox);
  main.appendChild(text);
  item.appendChild(main);
  item.appendChild(deleteBtn);

  return item;
}

// 重新繪製整份待辦清單。
function renderTodos() {
  const visibleTodos = getVisibleTodos();
  todoList.innerHTML = '';

  visibleTodos.forEach((todo) => {
    const item = createTodoItem(todo);
    todoList.appendChild(item);
  });

  updateTodoCount();
  updateClearCompletedButton();
  updateEmptyState(visibleTodos);
}

// 切換篩選條件。
function setFilter(filterName) {
  currentFilter = filterName;

  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === filterName;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  renderTodos();
}

// 新增待辦事項。
function addTodo() {
  const text = todoInput.value.trim();

  // 若輸入內容為空白，直接忽略，不新增項目。
  if (!text) {
    todoInput.focus();
    return;
  }

  const newTodo = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false,
  };

  todos.unshift(newTodo);
  saveTodos();
  renderTodos();
  todoInput.value = '';
  todoInput.focus();
}

// 切換待辦完成狀態。
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
}

// 刪除指定待辦事項。
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// 一次刪除所有已完成項目。
function clearCompletedTodos() {
  const completedCount = getCompletedCount();

  if (completedCount === 0) {
    return;
  }

  const confirmed = window.confirm(`確定要刪除 ${completedCount} 個已完成項目嗎？`);

  if (!confirmed) {
    return;
  }

  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

// 事件綁定：新增按鈕與 Enter 鍵。
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTodo();
  }
});

// 事件代理：處理勾選完成與刪除按鈕。
todoList.addEventListener('change', (event) => {
  const target = event.target;

  if (target.matches('input[type="checkbox"]')) {
    const item = target.closest('.todo-item');
    if (!item) {
      return;
    }

    toggleTodo(item.dataset.id);
  }
});

todoList.addEventListener('click', (event) => {
  const target = event.target;

  if (target.matches('.delete-btn')) {
    const item = target.closest('.todo-item');
    if (!item) {
      return;
    }

    deleteTodo(item.dataset.id);
  }
});

clearCompletedBtn.addEventListener('click', clearCompletedTodos);
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setFilter(button.dataset.filter);
  });
});

// 啟動畫面時先渲染既有資料。
renderTodos();
