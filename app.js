const STORAGE_KEY = 'todo-items-v1';

/** @type {{ id: string; text: string; completed: boolean }[]} */
let todos = loadTodos();
let currentFilter = 'all';

const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed');
const template = document.getElementById('todo-item-template');
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: crypto.randomUUID(),
    text,
    completed: false,
  });

  input.value = '';
  persistAndRender();
});

clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter((todo) => !todo.completed);
  persistAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    render();
  });
});

list.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const item = target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  if (target.classList.contains('delete')) {
    todos = todos.filter((todo) => todo.id !== id);
    persistAndRender();
  }
});

list.addEventListener('change', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.classList.contains('toggle')) {
    return;
  }

  const item = target.closest('.todo-item');
  if (!item) return;
  const id = item.dataset.id;

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: target.checked } : todo,
  );
  persistAndRender();
});

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item) => item && typeof item.id === 'string' && typeof item.text === 'string',
    );
  } catch {
    return [];
  }
}

function persistAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  render();
}

function getVisibleTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

function render() {
  list.innerHTML = '';
  const visibleTodos = getVisibleTodos();

  visibleTodos.forEach((todo) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = todo.id;

    const checkbox = node.querySelector('.toggle');
    const text = node.querySelector('.text');

    checkbox.checked = todo.completed;
    text.textContent = todo.text;

    node.classList.toggle('completed', todo.completed);
    list.appendChild(node);
  });

  const activeCount = todos.filter((todo) => !todo.completed).length;
  itemsLeft.textContent = `${activeCount} 项未完成`;
}

render();
