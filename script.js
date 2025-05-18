let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task, index) => {
    if (
      currentFilter === "completed" && !task.completed ||
      currentFilter === "pending" && task.completed
    ) return;

    const li = document.createElement("li");
    const checked = task.completed ? "checked" : "";

    const priorityLabel = task.priority ? `<span class="priority-${task.priority}">[${task.priority}]</span>` : "";
const dueText = task.dueDate ? `<small>(Due: ${task.dueDate})</small>` : "";

li.innerHTML = `
  <input type="checkbox" onclick="toggleTask(${index})" ${checked}>
  <span contenteditable="true" onblur="editTask(${index}, this)" class="${task.completed ? 'completed' : ''}">
    ${task.text} ${priorityLabel} ${dueText}
  </span>
  <button onclick="deleteTask(${index})">Delete</button>
`;


    list.appendChild(li);
  });
const completedCount = tasks.filter(task => task.completed).length;
const totalCount = tasks.length;
const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

document.getElementById("progressFill").style.width = `${percentage}%`;
document.getElementById("progressText").innerText = `Completed: ${completedCount} / ${totalCount} (${percentage}%)`;
new Sortable(document.getElementById("taskList"), {
  animation: 150,
  onEnd: function (evt) {
    const movedItem = tasks.splice(evt.oldIndex, 1)[0];
    tasks.splice(evt.newIndex, 0, movedItem);
    saveTasks();
    renderTasks();
  }
});
}

function addTask() {
  const input = document.getElementById("taskInput");
  const dueDateInput = document.getElementById("taskDueDate");
  const priorityInput = document.getElementById("taskPriority");

  if (input.value.trim() !== "") {
    tasks.push({
      text: input.value.trim(),
      completed: false,
      dueDate: dueDateInput ? dueDateInput.value : null,
      priority: priorityInput ? priorityInput.value : "Low"
    });

    input.value = "";
    if (dueDateInput) dueDateInput.value = "";
    if (priorityInput) priorityInput.value = "Low";

    saveTasks();
    renderTasks();
  }
}


function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function editTask(index, element) {
  const newText = element.innerText.replace(/\[.*?\]/, "").replace(/\(Due:.*?\)/, "").trim();
  tasks[index].text = newText;
  saveTasks();
}


function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

function filterTasks(type) {
  currentFilter = type;

  // Remove 'active' class from all buttons
  document.querySelectorAll(".filter-buttons button").forEach(btn => btn.classList.remove("active"));

  // Add 'active' to the selected button
  document.getElementById(`btn-${type}`).classList.add("active");

  renderTasks();
}

renderTasks();
function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}
function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  document.getElementById("themeLabel").innerText = isDark ? "Dark Mode" : "Light Mode";
}
function exportTasks() {
  const dataStr = JSON.stringify(tasks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tasks.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importTasks(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        tasks = imported;
        saveTasks();
        renderTasks();
        alert("Tasks imported successfully!");
      } else {
        alert("Invalid file format.");
      }
    } catch (error) {
      alert("Failed to import file. Please upload a valid JSON.");
    }
  };
  reader.readAsText(file);
}



