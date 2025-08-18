
let display = document.querySelector('.display');

let current = "";


let buttons = document.querySelectorAll('.buttons div');

buttons.forEach(btn => {
  btn.onclick = function() {
    let val = btn.textContent;

    if (val === "C") {
      current = "";
      display.textContent = "0";
    } else if (val === "=") {
      try {
        
        let expr = current.replace(/×/g, "*").replace(/÷/g, "/");
        current = eval(expr).toString();
        display.textContent = current;
      } catch {
        display.textContent = "Error";
        current = "";
      }
    } else {
      current += val;
      display.textContent = current;
    }
  }
});