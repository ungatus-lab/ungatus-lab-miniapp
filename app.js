let balance = 0;
let doubled = false;

function openProfile() {
  show("profile-screen");
}

function openBuy() {
  show("buy-screen");
}

function openStatus() {
  show("status-screen");
}

function buyPackage() {
  balance = 25000;
  doubled = true;
  document.getElementById("balance").innerText = "Баланс: 25000 UGT";
  document.getElementById("status-text").innerText =
    "До запуска аллокации ваши 25 000 UGT считаются как 50 000 UGT.";
  openProfile();
}

function show(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}
