// create new tasks
const columns = document.querySelectorAll(".column");
function createTaskElement(task) {
  const div = document.createElement("div");
  div.classList.add("task");

  const input = document.createElement("input");
  input.classList.add("input");
  input.type = "text";
  input.value = task.name;
  input.placeholder = "Enter new task";
  input.disabled = true;
  input.addEventListener("input", (e) => {
    task.name = input.value;
    saveData();
    if (input.value != "") {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          input.disabled = true;
          saveData();
        }
      });
      input.addEventListener("blur", () => {
        input.disabled = true;
        saveData();
      });
    } else {
      input.disabled = false;
    }
  });

  const span = document.createElement("span");
  span.classList.add("icons");

  const firstIcon = document.createElement("i");
  firstIcon.classList.add("fa-solid", "fa-pen-to-square", "first");
  span.appendChild(firstIcon);
  firstIcon.addEventListener("click", () => {
    div.classList.toggle("editing");
    input.disabled = !input.disabled; // toggle input field disabled state
    if (!input.disabled) {
      input.focus(); // focus input field when editing
    }
  });

  const secondIcon = document.createElement("i");
  secondIcon.classList.add("fa-solid", "fa-trash-can", "second");
  span.appendChild(secondIcon);

  div.appendChild(span);
  div.appendChild(input);

  div.setAttribute("draggable", "true");
  div.addEventListener("dragstart", () => {
    div.classList.add("dragging");
    div.style.opacity = ".5";
  });
  div.addEventListener("dragend", () => {
    div.classList.remove("dragging");
    div.style.opacity = "1";
    saveData();
  });

  return div;
}

// Save data to local storage  function
const saveData = () => {
  const data = [];
  columns.forEach((column) => {
    const tasks = column.querySelector(".tasks");
    const taskArray = [];
    tasks.querySelectorAll(".task").forEach((task) => {
      taskArray.push({
        name: task.querySelector("input").value,
      });
    });
    data.push(taskArray);
  });
  localStorage.setItem("tasks", JSON.stringify(data));
};

// Load saved data from local storage
const savedData = JSON.parse(localStorage.getItem("tasks"));
if (savedData) {
  columns.forEach((column, i) => {
    const tasks = column.querySelector(".tasks");
    savedData[i].forEach((task) => {
      const div = createTaskElement(task);
      tasks.appendChild(div);
    });
  });
}

// Drop area
columns.forEach((column) => {
  column.addEventListener("dragenter", () => {
    column.classList.add("dragover");
  });

  column.addEventListener("dragleave", () => {
    column.classList.remove("dragover");
  });

  column.addEventListener("dragend", () => {
    column.classList.remove("dragover");
  });
  column.addEventListener("dragstart", () => {
    column.classList.add("dragover");
  });
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
    const sort = sorting(column, e.clientY);
    const draggable = document.querySelector(".dragging");
    if (sort == null) {
      column.querySelector(".tasks").appendChild(draggable);
    } else {
      column.querySelector(".tasks").insertBefore(draggable, sort);
    }
    saveData();
  });
});

//sorting tasks
function sorting(column, y) {
  const draggableElements = [
    ...column.querySelectorAll(".task:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// Delete tasks
const tasks = document.querySelectorAll(".task");
function deleteTask(task) {
  const deleteIcon = task.querySelector(".second");

  deleteIcon.addEventListener("click", () => {
    task.remove();
    saveData();
  });
}

function editTask(task) {
  const editIcon = task.querySelector(".first");
  editIcon.addEventListener("click", () => {
    if (task.input.disabled == true) {
      input.disabled = false;
    }
  });
}

// Drag tasks

tasks.forEach((task) => {
  task.addEventListener("dragstart", () => {
    task.classList.add("dragging");
    saveData();
  });

  task.addEventListener("dragend", () => {
    task.classList.remove("dragging");
    saveData();
  });
  deleteTask(task);
});

// Add button
const addBtns = document.querySelectorAll("button");

addBtns.forEach((btn) => {
  const taskEl = btn.closest(".column").querySelector(".tasks");
  btn.addEventListener("click", () => {
    const div = createTaskElement({ name: "" });
    div.querySelector(".input").disabled = false;
    deleteTask(div);
    taskEl.appendChild(div);
    saveData();
  });
});
