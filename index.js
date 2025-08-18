const display = document.querySelector('.display');
const buttons = document.querySelectorAll('.buttons div');

display.textContent = "0";
let current = ""; // одоогийн бичигдэж буй тоо/томъёо

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const val = btn.textContent;

    if (val === "C") {
      current = "";
      display.textContent = "0";
    } else if (val === "=") {
      try {
        // ×, ÷ тэмдгийг JS оператор болгон сольж байна
        const expression = current.replace(/×/g, "*").replace(/÷/g, "/");
        current = eval(expression).toString();
        display.textContent = current;
      } catch {
        display.textContent = "Error";
        current = "";
      }
    } else {
      current += val;
      display.textContent = current;
    }
  });
});