const STORAGE_KEY = 'todo-list-items';
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const filterButtons = document.querySelectorAll('.filter-button');
const clearCompletedButton = document.getElementById('clear-completed');

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
let currentFilter = 'all';

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function getVisibleTasks() {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateTaskCount() {
  const remainingTasks = tasks.filter((task) => !task.completed).length;
  const label = remainingTasks === 1 ? 'task left' : 'tasks left';
  taskCount.textContent = `${remainingTasks} ${label}`;
}

function renderTasks() {
  const visibleTasks = getVisibleTasks();

  if (visibleTasks.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No tasks here yet.</li>';
    updateTaskCount();
    return;
  }

  todoList.innerHTML = visibleTasks
    .map(
      (task) => `
        <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <div class="task-main">
            <input
              class="task-checkbox"
              type="checkbox"
              ${task.completed ? 'checked' : ''}
              aria-label="Mark task as complete"
            />
            <span class="task-text">${escapeHtml(task.text)}</span>
          </div>
          <button class="task-delete" type="button" aria-label="Delete task">Delete</button>
        </li>
      `
    )
    .join('');

  updateTaskCount();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addTask(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  tasks.unshift({
    id: Date.now() + Math.random(),
    text: trimmedText,
    completed: false,
  });

  saveTasks();
  renderTasks();
}

function toggleTask(taskId) {
  tasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task
  );

  saveTasks();
  renderTasks();
}

function deleteTask(taskId) {
  const item = todoList.querySelector(`.todo-item[data-id="${taskId}"]`);

  if (item) {
    item.classList.add('removing');
    setTimeout(() => {
      tasks = tasks.filter((task) => task.id !== taskId);
      saveTasks();
      renderTasks();
    }, 180);
    return;
  }

  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === filter);
  });

  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTask(todoInput.value);
  todoInput.value = '';
  todoInput.focus();
});

todoList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.task-delete');
  const checkbox = event.target.closest('.task-checkbox');

  if (deleteButton) {
    const item = deleteButton.closest('.todo-item');
    deleteTask(Number(item.dataset.id));
    return;
  }

  if (checkbox) {
    const item = checkbox.closest('.todo-item');
    toggleTask(Number(item.dataset.id));
  }
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

clearCompletedButton.addEventListener('click', clearCompleted);

renderTasks();
