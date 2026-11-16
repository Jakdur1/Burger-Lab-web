function formatEur(num) {
  return num.toFixed(2).replace(".", ",") + " €";
}

let builderState = {
  bunName: "Maslová brioška",
  bunPrice: 0,
  pattyName: "100% Hovädzie",
  pattyPrice: 7.5,
  cheeseName: "Cheddar",
  cheesePrice: 1,
  extras: ["Čerstvý šalát & paradajka"],
  sauce: "Burger Lab dresing",
  totalPrice: 8.5,
};

let cart = [];
let orderMode = "delivery";
let cutleryPreference = "Drevený príbor";
let toastTimer;

function filterMenu(category) {
  document.querySelectorAll(".filter-btn").forEach((button) => {
    const active = button.dataset.filter === category;
    button.className = active
      ? "filter-btn px-5 py-2.5 rounded-2xl text-sm font-bold bg-oliveAccent text-white shadow-sm transition-all"
      : "filter-btn px-5 py-2.5 rounded-2xl text-sm font-bold bg-white text-darkCharcoal hover:bg-limeAccent/30 border border-oliveAccent/10 transition-all";
  });

  document.querySelectorAll(".menu-card").forEach((card) => {
    card.style.display =
      category === "all" || card.dataset.category === category ? "flex" : "none";
  });
}

function selectBuilderOption(selector, name, price, button) {
  document.querySelectorAll(selector).forEach((item) => {
    item.className = `${selector.slice(1)} p-3 rounded-2xl border-2 border-gray-200 bg-white hover:border-limeAccent text-left transition-all`;
  });
  button.className = `${selector.slice(1)} p-3 rounded-2xl border-2 border-oliveAccent bg-creamCard text-left transition-all`;
  return { name, price };
}

function selectBun(name, price, button) {
  const selected = selectBuilderOption(".builder-bun-btn", name, price, button);
  builderState.bunName = selected.name;
  builderState.bunPrice = selected.price;
  updateBuilder();
}

function selectPatty(name, price, button) {
  const selected = selectBuilderOption(".builder-patty-btn", name, price, button);
  builderState.pattyName = selected.name;
  builderState.pattyPrice = selected.price;
  updateBuilder();
}

function selectCheese(name, price, button) {
  const selected = selectBuilderOption(".builder-cheese-btn", name, price, button);
  builderState.cheeseName = selected.name;
  builderState.cheesePrice = selected.price;
  updateBuilder();
}

function updateBuilder() {
  const selectedExtras = [...document.querySelectorAll(".builder-extra:checked")];
  const extrasTotal = selectedExtras.reduce(
    (total, extra) => total + Number(extra.dataset.price),
    0,
  );
  const sauceElement = document.getElementById("builder-sauce");

  builderState.extras = selectedExtras.map((extra) => extra.value);
  builderState.sauce = sauceElement.value;
  builderState.totalPrice =
    builderState.bunPrice +
    builderState.pattyPrice +
    builderState.cheesePrice +
    extrasTotal;

  document.getElementById("summary-bun-top").textContent = builderState.bunName;
  document.getElementById("summary-bun-bottom").textContent = builderState.bunName;
  document.getElementById("summary-patty-layer").textContent = builderState.pattyName;
  document.getElementById("summary-cheese-layer").textContent =
    builderState.cheeseName === "Bez syra"
      ? "Bez syra"
      : `Syr: ${builderState.cheeseName}`;
  document.getElementById("summary-sauce-layer").textContent = builderState.sauce;
  document.getElementById("summary-extras-layer").textContent =
    builderState.extras.length > 0
      ? builderState.extras.join(", ")
      : "Bez extra príloh";
  document.getElementById("builder-total-price").textContent = formatEur(
    builderState.totalPrice,
  );
}

function addCustomBurgerToCart() {
  const parts = [
    builderState.bunName,
    builderState.pattyName,
    builderState.cheeseName !== "Bez syra" ? builderState.cheeseName : null,
    ...builderState.extras,
    builderState.sauce,
  ].filter(Boolean);
  addToCart(`Vlastný burger (${parts.join(", ")})`, builderState.totalPrice);
}

function toggleCart() {
  document.getElementById("cart-modal").classList.toggle("hidden");
}

function setOrderMode(mode) {
  orderMode = mode;
  const delivery = document.getElementById("mode-delivery");
  const pickup = document.getElementById("mode-pickup");
  const active = "py-2 rounded-xl text-xs font-extrabold bg-limeBright text-darkCharcoal transition-all";
  const inactive = "py-2 rounded-xl text-xs font-bold text-darkCharcoal/70 hover:text-darkCharcoal transition-all";
  delivery.className = mode === "delivery" ? active : inactive;
  pickup.className = mode === "pickup" ? active : inactive;
  updateCartUI();
}

function addToCart(name, price) {
  const existing = cart.find((item) => item.name === name && item.price === price);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
  showToast(`${name} bolo pridané do košíka.`);
}

function changeQty(index, amount) {
  const item = cart[index];
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) cart.splice(index, 1);
  updateCartUI();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

function updateCartUI() {
  const itemsContainer = document.getElementById("cart-items");
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee =
    orderMode === "delivery" && subtotal > 0 && subtotal < 15 ? 1.9 : 0;

  document.getElementById("cart-badge").textContent = cart.reduce(
    (sum, item) => sum + item.qty,
    0,
  );
  if (cart.length === 0) {
    itemsContainer.innerHTML = `<div class="text-center py-16 space-y-3"><div class="w-16 h-16 mx-auto rounded-3xl bg-creamCard text-oliveAccent flex items-center justify-center text-2xl"><i class="fa-solid fa-burger"></i></div><p class="font-extrabold text-darkCharcoal">Váš košík je zatiaľ prázdny</p><p class="text-xs text-darkCharcoal/60 max-w-xs mx-auto">Vyberte si niektorý z našich čerstvých burgrov alebo si vyskladajte vlastný podľa chuti.</p></div>`;
  } else {
    itemsContainer.innerHTML = cart
      .map(
        (item, index) => `<div class="p-4 rounded-2xl bg-creamCard border border-oliveAccent/10 flex items-start justify-between gap-3"><div class="min-w-0 flex-1"><h4 class="font-extrabold text-darkCharcoal text-sm leading-snug">${item.name}</h4><span class="text-xs font-bold text-oliveAccent mt-1 inline-block">${formatEur(item.price)} / ks</span></div><div class="flex items-center space-x-1.5 shrink-0"><button onclick="changeQty(${index}, -1)" class="w-7 h-7 rounded-xl bg-white border border-oliveAccent/20 text-darkCharcoal font-extrabold text-xs hover:bg-limeAccent/40 transition-colors">-</button><span class="w-5 text-center text-xs font-extrabold text-darkCharcoal">${item.qty}</span><button onclick="changeQty(${index}, 1)" class="w-7 h-7 rounded-xl bg-white border border-oliveAccent/20 text-darkCharcoal font-extrabold text-xs hover:bg-limeAccent/40 transition-colors">+</button><button onclick="removeFromCart(${index})" aria-label="Odstrániť položku" class="w-7 h-7 rounded-xl bg-white border border-red-200 text-red-600 text-xs hover:bg-red-50 transition-colors ml-1"><i class="fa-solid fa-trash-can"></i></button></div></div>`,
      )
      .join("");
  }
  document.getElementById("cart-subtotal").textContent = formatEur(subtotal);
  document.getElementById("cart-delivery-fee").textContent =
    deliveryFee > 0 ? formatEur(deliveryFee) : "Zdarma";
  document.getElementById("cart-total").textContent = formatEur(
    subtotal + deliveryFee,
  );
}

function checkout() {
  if (cart.length === 0) {
    showToast("Najprv pridajte burger do košíka.");
    return;
  }
  const selectedCutlery = document.querySelector(
    'input[name="cutlery-choice"]:checked',
  );
  cutleryPreference = selectedCutlery
    ? selectedCutlery.value
    : "Bez príboru – mám vlastný";
  document.getElementById("checkout-cutlery-summary").textContent =
    `Príbor: ${cutleryPreference}.`;
  toggleCart();
  cart = [];
  updateCartUI();
  document.getElementById("checkout-modal").classList.remove("hidden");
}

function closeCheckoutModal() {
  document.getElementById("checkout-modal").classList.add("hidden");
}

function submitReservation(event) {
  event.preventDefault();
  const name = document.getElementById("res-name").value;
  const guests = document.getElementById("res-guests").value;
  const date = document.getElementById("res-date").value;
  const time = document.getElementById("res-time").value;
  document.getElementById("reservation-summary-text").textContent =
    `Ďakujeme, ${name}. Rezervovali sme stôl pre ${guests} na dátum ${date} o ${time}.`;
  document.getElementById("reservation-confirmation").classList.remove("hidden");
  showToast("Rezervácia stola bola potvrdená!");
  event.target.reset();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = message;
  toast.classList.remove("translate-y-24", "opacity-0");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(
    () => toast.classList.add("translate-y-24", "opacity-0"),
    3200,
  );
}

document.getElementById("mobile-menu-btn").addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("hidden");
});
document.querySelectorAll(".mobile-link").forEach((link) => {
  link.addEventListener("click", () =>
    document.getElementById("mobile-menu").classList.add("hidden"),
  );
});
document.querySelectorAll(".builder-extra").forEach((checkbox) => {
  checkbox.addEventListener("change", updateBuilder);
});
document.getElementById("builder-sauce").addEventListener("change", updateBuilder);
document.querySelectorAll('input[name="cutlery-choice"]').forEach((choice) => {
  choice.addEventListener("change", (event) => {
    cutleryPreference = event.target.value;
  });
});
updateBuilder();
updateCartUI();