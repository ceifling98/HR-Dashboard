let employees = JSON.parse(localStorage.getItem("employees")) || [];

const form = document.getElementById("addEmployeeForm");
const fileInput = document.getElementById("fileInput");
const themeToggle = document.getElementById("themeToggle");
let dataTable;
let chart;

document.addEventListener("DOMContentLoaded", () => {
  dataTable = $('#employeeTable').DataTable();
  updateTable();
  updateChart();
  applySavedTheme();
});

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const employee = {
    name: document.getElementById("name").value.trim(),
    department: document.getElementById("department").value.trim(),
    gender: document.getElementById("gender").value,
    salary: parseFloat(document.getElementById("salary").value),
    status: document.getElementById("status").value
  };

  if (!employee.name || !employee.department || !employee.gender || isNaN(employee.salary) || !employee.status) return;

  employees.push(employee);
  localStorage.setItem("employees", JSON.stringify(employees));
  form.reset();
  updateTable();
  updateChart();
});

function updateTable() {
  dataTable.clear();
  employees.forEach((emp, index) => {
    dataTable.row.add([
      emp.name,
      emp.department,
      `<span class="gender-badge ${genderClass(emp.gender)}">${emp.gender}</span>`,
      emp.salary.toFixed(2),
      `<span class="status-badge ${statusClass(emp.status)}">${emp.status}</span>`,
      `<button onclick="removeEmployee(${index})">Remove</button>`
    ]);
  });
  dataTable.draw();
}

function updateChart() {
  const summary = {};
  employees.forEach(e => {
    summary[e.gender] = (summary[e.gender] || 0) + 1;
  });

  const ctx = document.getElementById("genderChart").getContext("2d");
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(summary),
      datasets: [{
        label: "Gender",
        data: Object.values(summary),
        backgroundColor: Object.keys(summary).map(g => {
          switch (g) {
            case "Male": return "#3498db";
            case "Female": return "#e91e63";
            case "Non-Binary": return "#9c27b0";
            case "Transgender": return "#00bcd4";
            case "Other": return "#795548";
            case "Prefer Not to Say": return "#b0bec5";
            default: return "#cccccc";
          }
        })
      }]
    }
  });
}

function removeEmployee(index) {
  employees.splice(index, 1);
  localStorage.setItem("employees", JSON.stringify(employees));
  updateTable();
  updateChart();
}

function statusClass(status) {
  switch (status) {
    case 'Active': return 'active';
    case 'Inactive': return 'inactive';
    case 'On Vacation': return 'vacation';
    case 'Medical Leave': return 'medical';
    case 'Terminated': return 'terminated';
    case 'Probation': return 'probation';
    default: return 'unknown';
  }
}

function genderClass(gender) {
  switch (gender) {
    case 'Male': return 'male';
    case 'Female': return 'female';
    case 'Non-Binary': return 'nonbinary';
    case 'Transgender': return 'transgender';
    case 'Other': return 'other';
    case 'Prefer Not to Say': return 'unknown';
    default: return 'unknown';
  }
}

// Export Functions
function exportToCSV() {
  let csv = "Name,Department,Gender,Salary,Status\n";
  employees.forEach(e => {
    csv += `${e.name},${e.department},${e.gender},${e.salary},${e.status}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "employees.csv";
  a.click();
}

function exportToExcel() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(employees);
  XLSX.utils.book_append_sheet(wb, ws, "Employees");
  XLSX.writeFile(wb, "employees.xlsx");
}

function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.autoTable({
    head: [["Name", "Department", "Gender", "Salary", "Status"]],
    body: employees.map(e => [e.name, e.department, e.gender, e.salary, e.status])
  });
  doc.save("employees.pdf");
}

function downloadChartImage() {
  const canvas = document.getElementById("genderChart");
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = "gender_chart.png";
  a.click();
}

// File Import
fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    let result = e.target.result;
    if (file.name.endsWith(".json")) {
      const data = JSON.parse(result);
      if (Array.isArray(data)) {
        employees = data;
        localStorage.setItem("employees", JSON.stringify(employees));
        updateTable();
        updateChart();
      }
    } else if (file.name.endsWith(".csv")) {
      const rows = result.split("\n").slice(1);
      employees = rows
        .filter(row => row.trim())
        .map(row => {
          const [name, department, gender, salary, status] = row.split(",");
          return { name, department, gender, salary: parseFloat(salary), status };
        });
      localStorage.setItem("employees", JSON.stringify(employees));
      updateTable();
      updateChart();
    }
  };
  reader.readAsText(file);
});

// Theme toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const theme = document.body.classList.contains("dark") ? "dark" : "light";
  localStorage.setItem("theme", theme);
});

function applySavedTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

