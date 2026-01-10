// script.js - Fixed & Improved Version (January 2025)

const input = document.getElementById("todo-input");
const topicSelect = document.getElementById("topic-select");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const clearBtn = document.getElementById("clear-btn");
const emptyState = document.getElementById("empty-state");

// Sidebar elements
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const topicFilters = document.getElementById("topic-filters");
const addTopicBtn = document.getElementById("add-topic-btn");
const closeMenuBtn = document.getElementById("close-menu");

// State
let topics = JSON.parse(localStorage.getItem("todo_topics")) || [
  "Personal",
  "Work",
  "Study",
];
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  renderTopics();
  loadTasks();
  initSortable();
});

// ── Core Storage Helpers ───────────────────────────────────────
function getTasks() {
  return JSON.parse(localStorage.getItem("todos")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("todos", JSON.stringify(tasks));
}

// ── Topic Management ───────────────────────────────────────────
function renderTopics() {
  topicFilters.innerHTML = "";
  topicSelect.innerHTML = "";

  // "All Tasks" (special non-deletable filter)
  const allLi = document.createElement("li");
  allLi.dataset.filter = "all";
  allLi.className = currentFilter === "all" ? "active" : "";
  allLi.innerHTML = `<span>All Tasks</span>`;
  allLi.onclick = () => {
    currentFilter = "all";
    renderTopics();
    loadTasks();
    toggleMenu();
  };
  topicFilters.appendChild(allLi);

  // Dynamic topics
  topics.forEach((topic) => {
    const li = document.createElement("li");
    li.className = `topic-item ${currentFilter === topic ? "active" : ""}`;
    li.innerHTML = `
      <span>${topic}</span>
      <span class="del-topic" data-topic="${topic}" title="Delete Category">×</span>
    `;

    li.addEventListener("click", (e) => {
      if (e.target.classList.contains("del-topic")) return;
      currentFilter = topic;
      renderTopics();
      loadTasks();
      toggleMenu();
    });

    topicFilters.appendChild(li);

    // Dropdown option
    topicSelect.add(new Option(topic, topic));
  });

  localStorage.setItem("todo_topics", JSON.stringify(topics));
  attachTopicDeleteListeners();
}

function attachTopicDeleteListeners() {
  document.querySelectorAll(".del-topic").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const topic = e.target.dataset.topic;

      if (confirm(`Delete category "${topic}" and all its tasks?`)) {
        topics = topics.filter((t) => t !== topic);

        let tasks = getTasks();
        tasks = tasks.filter((t) => t.topic !== topic);
        saveTasks(tasks);

        if (currentFilter === topic) currentFilter = "all";

        renderTopics();
        loadTasks();
      }
    };
  });
}

addTopicBtn.onclick = () => {
  const name = prompt("New Category Name:").trim();
  if (!name) return;
  if (topics.includes(name)) {
    alert("Category already exists!");
    return;
  }
  topics.push(name);
  renderTopics();
};

// ── Task CRUD ──────────────────────────────────────────────────
function createDOMElement(task) {
  const li = document.createElement("li");
  li.dataset.id = task.id;
  li.className = task.completed ? "completed" : "";

  li.innerHTML = `
    <div class="task-left">
      <input type="checkbox" class="status-check" ${
        task.completed ? "checked" : ""
      }>
      <div class="task-info">
        <span class="task-topic">${task.topic}</span>
        <span class="task-text">${task.text}</span>
      </div>
    </div>
    <button class="delete-btn" title="Delete Task">×</button>
  `;

  li.querySelector(".status-check").onchange = (e) => {
    const checked = e.target.checked;
    li.classList.toggle("completed", checked);
    updateTaskCompletion(task.id, checked);
  };

  li.querySelector(".delete-btn").onclick = () => {
    deleteTask(task.id);
    li.remove();
    toggleEmptyState();
  };

  return li;
}

function addTaskHandler() {
  const text = input.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now() + Math.random().toString(36).slice(2, 11), // very safe unique id
    text,
    topic: topicSelect.value || "Personal",
    completed: false,
  };

  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);

  input.value = "";
  loadTasks();
}

function updateTaskCompletion(taskId, completed) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === taskId);
  if (task) {
    task.completed = completed;
    saveTasks(tasks);
  }
}

function deleteTask(taskId) {
  let tasks = getTasks();
  tasks = tasks.filter((t) => t.id !== taskId);
  saveTasks(tasks);
  loadTasks();
}

function loadTasks() {
  todoList.innerHTML = "";
  const allTasks = getTasks();

  const visibleTasks = allTasks.filter(
    (t) => currentFilter === "all" || t.topic === currentFilter
  );

  visibleTasks.forEach((task) => {
    todoList.appendChild(createDOMElement(task));
  });

  toggleEmptyState();
}

function toggleEmptyState() {
  emptyState.classList.toggle("hidden", todoList.children.length > 0);
}

// ── Drag & Drop (Sortable) ─────────────────────────────────────
function initSortable() {
  new Sortable(todoList, {
    animation: 150,
    ghostClass: "sortable-ghost",
    delay: 100,
    delayOnTouchOnly: true,
    onEnd: () => {
      if (currentFilter !== "all") {
        alert("Reordering is only saved when viewing 'All Tasks'");
        return;
      }

      const newOrderIds = [...todoList.querySelectorAll("li")].map(
        (li) => li.dataset.id
      );

      let tasks = getTasks();
      const newTasks = newOrderIds
        .map((id) => tasks.find((t) => t.id === id))
        .filter(Boolean);

      saveTasks(newTasks);
    },
  });
}

// ── Event Listeners ────────────────────────────────────────────
addBtn.onclick = addTaskHandler;
input.onkeypress = (e) => {
  if (e.key === "Enter") addTaskHandler();
};

menuBtn.onclick = toggleMenu;
overlay.onclick = toggleMenu;
closeMenuBtn.onclick = toggleMenu;

clearBtn.onclick = () => {
  if (confirm("Permanently delete ALL tasks? This cannot be undone.")) {
    localStorage.removeItem("todos");
    loadTasks();
  }
};

function toggleMenu() {
  sidebar.classList.toggle("open");
  overlay.classList.toggle("visible");
}
