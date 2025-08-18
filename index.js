let display = document.getElementById('display');
let current = "";

function append(val) {
  current += val;
  display.textContent = current;
}

function clearDisplay() {
  current = "";
  display.textContent = "0";
}

function calculate() {
  try {
    // ×÷ тэмдгийг JS оператор болгон сольж болно
    const expr = current.replace(/×/g, "*").replace(/÷/g, "/");
    current = eval(expr).toString();
    display.textContent = current;
  } catch {
    display.textContent = "Error";
    current = "";
  }
}