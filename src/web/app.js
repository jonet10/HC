const API_BASE = "/api/v1";

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const welcomeText = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

function formatMoney(value) {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("fr-FR")} HTG`;
}

function getToken() {
  return localStorage.getItem("hc_token");
}

function setSession(token, user) {
  localStorage.setItem("hc_token", token);
  localStorage.setItem("hc_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("hc_token");
  localStorage.removeItem("hc_user");
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = body?.message || "Une erreur est survenue.";
    throw new Error(message);
  }
  return body;
}

function renderRows(targetId, rows, rowBuilder, emptyText) {
  const target = document.getElementById(targetId);
  if (!rows.length) {
    target.innerHTML = `<tr><td colspan="4">${emptyText}</td></tr>`;
    return;
  }
  target.innerHTML = rows.map(rowBuilder).join("");
}

function renderSummary(summary) {
  document.getElementById("tuitionExpected").textContent = formatMoney(summary.tuitionExpected);
  document.getElementById("totalPaid").textContent = formatMoney(summary.totalPaid);
  document.getElementById("totalDue").textContent = formatMoney(summary.totalDue);
  document.getElementById("paymentRate").textContent = `${summary.paymentRate || 0}%`;
}

async function loadDashboard() {
  const [summary, students, payments, grades, bulletins] = await Promise.all([
    apiRequest("/reports/financial-summary"),
    apiRequest("/students"),
    apiRequest("/payments"),
    apiRequest("/grades"),
    apiRequest("/bulletins"),
  ]);

  renderSummary(summary);

  document.getElementById("studentsCount").textContent = students.length;
  renderRows(
    "studentsBody",
    students.slice(0, 8),
    (item) =>
      `<tr><td>${item.studentCode || "-"}</td><td>${item.firstName} ${item.lastName}</td><td>${item.classLevel || "-"}</td><td>${formatMoney(item.tuitionAmount)}</td></tr>`,
    "Aucun eleve."
  );

  document.getElementById("paymentsCount").textContent = payments.length;
  renderRows(
    "paymentsBody",
    payments.slice(0, 8),
    (item) => {
      const student = item.studentId
        ? `${item.studentId.firstName || ""} ${item.studentId.lastName || ""}`.trim()
        : "-";
      return `<tr><td>${item.receiptNumber || "-"}</td><td>${student}</td><td>${formatMoney(item.amount)}</td><td>${item.method || "-"}</td></tr>`;
    },
    "Aucun paiement."
  );

  document.getElementById("gradesCount").textContent = grades.length;
  renderRows(
    "gradesBody",
    grades.slice(0, 8),
    (item) => {
      const student = item.studentId
        ? `${item.studentId.firstName || ""} ${item.studentId.lastName || ""}`.trim()
        : "-";
      return `<tr><td>${student}</td><td>${item.subject || "-"}</td><td>${item.score ?? "-"}</td><td>${item.period || "-"}</td></tr>`;
    },
    "Aucune note."
  );

  document.getElementById("bulletinsCount").textContent = bulletins.length;
  renderRows(
    "bulletinsBody",
    bulletins.slice(0, 8),
    (item) => {
      const student = item.studentId
        ? `${item.studentId.firstName || ""} ${item.studentId.lastName || ""}`.trim()
        : "-";
      const pdf = item.filePdf ? `<a href="/public/${item.filePdf}" target="_blank">ouvrir</a>` : "-";
      return `<tr><td>${student}</td><td>${item.period || "-"}</td><td>${item.status || "-"}</td><td>${pdf}</td></tr>`;
    },
    "Aucun bulletin."
  );
}

async function handleLogin(event) {
  event.preventDefault();
  loginError.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!["DIRECTOR", "SUPER_ADMIN", "CASHIER"].includes(result.user?.role)) {
      loginError.textContent = "Ce compte n'a pas les droits admin pour ce tableau de bord.";
      return;
    }

    setSession(result.token, result.user);
    await showDashboard();
  } catch (error) {
    loginError.textContent = error.message;
  }
}

async function showDashboard() {
  const user = JSON.parse(localStorage.getItem("hc_user") || "{}");
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  welcomeText.textContent = `${user.firstName || ""} ${user.lastName || ""} (${user.role || "-"})`;

  try {
    await loadDashboard();
  } catch (error) {
    alert(`Erreur chargement dashboard: ${error.message}`);
  }
}

function showLogin() {
  dashboardView.classList.add("hidden");
  loginView.classList.remove("hidden");
}

loginForm.addEventListener("submit", handleLogin);
logoutBtn.addEventListener("click", () => {
  clearSession();
  showLogin();
});

if (getToken()) {
  showDashboard();
} else {
  showLogin();
}
