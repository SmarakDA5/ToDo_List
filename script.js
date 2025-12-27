const input = document.getElementById("todo-input");
const addBtn = document.getElementById("add-btn");
const todoList = document.getElementById("todo-list");

document.addEventListener("DOMContentLoaded", loadTasks);

addBtn.addEventListener("click", () => {
  const text = input.value.trim();
  if (text !== "") {
    addTask({ text: text, completed: false });
    input.value = "";
  }
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const text = input.value.trim();
    if (text !== "") {
      addTask({ text: text, completed: false });
      input.value = "";
    }
  }
});

function addTask(taskObj, save = true) {
  const li = document.createElement("li");
  if (taskObj.completed) li.classList.add("completed");

  li.innerHTML = `
        <div class="task-content">
            <input type="checkbox" class="status-check" ${
              taskObj.completed ? "checked" : ""
            }>
            <span>${taskObj.text}</span>
        </div>
        <button class="delete-btn">&times;</button>
    `;

  li.querySelector(".status-check").addEventListener("change", (e) => {
    li.classList.toggle("completed", e.target.checked);
    updateLocalStorage();
  });

  li.querySelector(".delete-btn").addEventListener("click", () => {
    li.remove();
    updateLocalStorage();
  });

  todoList.appendChild(li);
  if (save) updateLocalStorage();
}

function updateLocalStorage() {
  const tasks = [];
  document.querySelectorAll("#todo-list li").forEach((li) => {
    tasks.push({
      text: li.querySelector("span").innerText,
      completed: li.querySelector(".status-check").checked,
    });
  });
  localStorage.setItem("todos", JSON.stringify(tasks));
}

function loadTasks() {
  const tasks = JSON.parse(localStorage.getItem("todos")) || [];
  tasks.forEach((task) => addTask(task, false));
}
