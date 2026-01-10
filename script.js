const input = document.getElementById("todo-input");
const topicSelect = document.getElementById("topic-select");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");
const clearBtn = document.getElementById("clear-btn");

// Sidebar Elements
const menuBtn = document.getElementById("menu-btn");
const closeMenuBtn = document.getElementById("close-menu");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const filterItems = document.querySelectorAll("#topic-filters li");

// State
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  setupSidebar();
});

// --- Sidebar Logic ---
function setupSidebar() {
  function toggleMenu() {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("visible");
  }

  menuBtn.addEventListener("click", toggleMenu);
  closeMenuBtn.addEventListener("click", toggleMenu);
  overlay.addEventListener("click", toggleMenu);

  // Filter Logic
  filterItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      // UI Update
      filterItems.forEach((i) => i.classList.remove("active"));
      e.target.classList.add("active");

      // Logic Update
      currentFilter = e.target.getAttribute("data-filter");
      loadTasks(); // Re-render list based on filter
      toggleMenu(); // Close menu on selection
    });
  });
}

// --- Task CRUD ---

function addTaskHandler() {
  const text = input.value.trim();
  const topic = topicSelect.value;

  if (text !== "") {
    const newTask = {
      text: text,
      completed: false,
      topic: topic, // Include topic in schema
    };
    saveTaskToStorage(newTask);
    input.value = "";
    loadTasks(); // Re-render to show new task (if matches filter)
  }
}

addBtn.addEventListener("click", addTaskHandler);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTaskHandler();
});

// Clear All Logic
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all tasks?")) {
    localStorage.removeItem("todos");
    loadTasks();
  }
});

function createDOMElement(taskObj, index, allTasks) {
  const li = document.createElement("li");
  if (taskObj.completed) li.classList.add("completed");

  li.innerHTML = `
        <div class="task-left">
            <input type="checkbox" class="status-check" ${
              taskObj.completed ? "checked" : ""
            }>
            <div class="task-info">
                <span class="task-topic">${taskObj.topic || "General"}</span>
                <span class="task-text">${taskObj.text}</span>
            </div>
        </div>
        <button class="delete-btn">&times;</button>
    `;

  // Toggle Complete
  li.querySelector(".status-check").addEventListener("change", (e) => {
    allTasks[index].completed = e.target.checked;
    localStorage.setItem("todos", JSON.stringify(allTasks));
    li.classList.toggle("completed", e.target.checked);
  });

  // Delete Single
  li.querySelector(".delete-btn").addEventListener("click", () => {
    allTasks.splice(index, 1);
    localStorage.setItem("todos", JSON.stringify(allTasks));
    loadTasks(); // Re-render
  });

  return li;
}

function saveTaskToStorage(task) {
  const tasks = JSON.parse(localStorage.getItem("todos")) || [];
  tasks.push(task);
  localStorage.setItem("todos", JSON.stringify(tasks));
}

function loadTasks() {
  todoList.innerHTML = ""; // Clear current view
  const allTasks = JSON.parse(localStorage.getItem("todos")) || [];

  allTasks.forEach((task, index) => {
    // Filter logic
    if (currentFilter === "all" || task.topic === currentFilter) {
      const li = createDOMElement(task, index, allTasks);
      todoList.appendChild(li);
    }
  });
}
