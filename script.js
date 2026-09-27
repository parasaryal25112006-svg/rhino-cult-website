const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const year = document.querySelector("#year");
const signupDialog = document.querySelector(".signup-dialog");
const cartDialog = document.querySelector(".cart-dialog");
const cartItems = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartFooter = document.querySelector(".cart-footer");
const checkoutNote = document.querySelector(".checkout-note");
const wishlistDialog = document.querySelector(".wishlist-dialog");
const wishlistItems = document.querySelector(".wishlist-items");
const wishlistEmpty = document.querySelector(".wishlist-empty");

const products = {
  "stamp-tee": {
    name: "STAMP TEE — BONE",
    price: 1499,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=75",
  },
  "territory-hoodie": {
    name: "TERRITORY HOODIE — ASH",
    price: 2899,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=75",
  },
  "outsider-tee": {
    name: "OUTSIDER TEE — INK",
    price: 1699,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=300&q=75",
  },
  "heavy-duty-cap": {
    name: "HEAVY DUTY CAP — BLACK",
    price: 999,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=300&q=75",
  },
};

const indianRupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

let cart = loadCart();
let wishlist = loadWishlist();
year.textContent = new Date().getFullYear();

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("rhino-cult-cart") || "[]");
    if (!Array.isArray(saved)) return [];
    return saved.filter((item) =>
      products[item.id]
      && typeof item.size === "string"
      && Number.isInteger(item.quantity)
      && item.quantity > 0,
    );
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem("rhino-cult-cart", JSON.stringify(cart));
}

function loadWishlist() {
  try {
    const saved = JSON.parse(localStorage.getItem("rhino-cult-wishlist") || "[]");
    if (!Array.isArray(saved)) return [];
    return [...new Set(saved.filter((id) => typeof id === "string" && products[id]))];
  } catch {
    return [];
  }
}

function saveWishlist() {
  localStorage.setItem("rhino-cult-wishlist", JSON.stringify(wishlist));
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderCart() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((element) => {
    element.textContent = String(count);
  });
  cartItems.replaceChildren();

  let subtotal = 0;
  cart.forEach((item) => {
    const product = products[item.id];
    subtotal += product.price * item.quantity;

    const line = makeElement("article", "cart-line");
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    image.loading = "lazy";

    const details = makeElement("div");
    details.append(
      makeElement("h3", "", product.name),
      makeElement("p", "", `SIZE ${item.size}`),
    );
    const actions = makeElement("div", "cart-line-actions");
    const decrease = makeElement("button", "", "−");
    decrease.type = "button";
    decrease.setAttribute("aria-label", `Remove one ${product.name}`);
    decrease.dataset.cartAction = "decrease";
    const quantity = makeElement("span", "", String(item.quantity));
    const increase = makeElement("button", "", "+");
    increase.type = "button";
    increase.setAttribute("aria-label", `Add one ${product.name}`);
    increase.dataset.cartAction = "increase";
    actions.append(decrease, quantity, increase);
    details.append(actions);
    line.append(image, details, makeElement("span", "cart-line-price", indianRupees.format(product.price * item.quantity)));
    line.dataset.cartKey = `${item.id}:${item.size}`;
    cartItems.append(line);
  });

  const isEmpty = cart.length === 0;
  cartEmpty.hidden = !isEmpty;
  cartFooter.hidden = isEmpty;
  document.querySelector("[data-cart-subtotal]").textContent = indianRupees.format(subtotal);
}

function renderWishlist() {
  document.querySelectorAll("[data-wishlist-count]").forEach((element) => {
    element.textContent = String(wishlist.length);
  });
  document.querySelectorAll("[data-toggle-wishlist]").forEach((button) => {
    const isSaved = wishlist.includes(button.dataset.toggleWishlist);
    button.classList.toggle("is-saved", isSaved);
    button.setAttribute("aria-pressed", String(isSaved));
    button.setAttribute(
      "aria-label",
      `${isSaved ? "Remove" : "Add"} ${products[button.dataset.toggleWishlist].name} ${isSaved ? "from" : "to"} wishlist`,
    );
    button.textContent = isSaved ? "♥" : "♡";
  });

  wishlistItems.replaceChildren();
  wishlist.forEach((id) => {
    const product = products[id];
    const line = makeElement("article", "cart-line wishlist-line");
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = "";
    image.loading = "lazy";

    const details = makeElement("div");
    details.append(makeElement("h3", "", product.name));
    const actions = makeElement("div", "wishlist-line-actions");
    const addButton = makeElement("button", "wishlist-add-button", "ADD TO BAG");
    addButton.type = "button";
    addButton.dataset.wishlistAdd = id;
    const removeButton = makeElement("button", "wishlist-remove-button", "REMOVE");
    removeButton.type = "button";
    removeButton.dataset.toggleWishlist = id;
    removeButton.setAttribute("aria-label", `Remove ${product.name} from wishlist`);
    actions.append(addButton, removeButton);
    details.append(actions);
    line.append(image, details, makeElement("span", "cart-line-price", indianRupees.format(product.price)));
    wishlistItems.append(line);
  });
  wishlistEmpty.hidden = wishlist.length > 0;
}

function openDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

function closeCart() {
  if (cartDialog.open) cartDialog.close();
}

function closeMobileNav() {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  siteNav.classList.remove("is-open");
}

document.querySelectorAll("[data-open-signup]").forEach((button) => {
  button.addEventListener("click", () => {
    openDialog(signupDialog);
    closeMobileNav();
  });
});

document.querySelector("[data-close-signup]").addEventListener("click", () => {
  signupDialog.close();
});

signupDialog.addEventListener("click", (event) => {
  if (event.target === signupDialog) signupDialog.close();
});

document.querySelectorAll("[data-open-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    renderCart();
    openDialog(cartDialog);
    closeMobileNav();
  });
});

document.querySelector("[data-open-wishlist]").addEventListener("click", () => {
  renderWishlist();
  openDialog(wishlistDialog);
});

document.querySelector("[data-close-wishlist]").addEventListener("click", () => {
  wishlistDialog.close();
});

wishlistDialog.addEventListener("click", (event) => {
  if (event.target === wishlistDialog) wishlistDialog.close();
});

document.querySelector("[data-close-wishlist-link]").addEventListener("click", () => {
  wishlistDialog.close();
});

document.querySelector("[data-close-cart]").addEventListener("click", closeCart);
cartDialog.addEventListener("click", (event) => {
  if (event.target === cartDialog) closeCart();
});

document.querySelector("[data-close-cart-link]").addEventListener("click", closeCart);

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Open menu" : "Close menu");
  siteNav.classList.toggle("is-open", !isExpanded);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMobileNav();
  }
});

const bottomNavLinks = document.querySelectorAll("[data-bottom-section]");
const bottomNavObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    bottomNavLinks.forEach((link) => {
      const isCurrent = link.dataset.bottomSection === entry.target.id;
      link.classList.toggle("is-active", isCurrent);
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-25% 0px -60% 0px" });

bottomNavLinks.forEach((link) => {
  const section = document.getElementById(link.dataset.bottomSection);
  if (section) bottomNavObserver.observe(section);
});

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.dataset.filter;
    document.querySelectorAll(".filter-button").forEach((filter) => {
      const isActive = filter === button;
      filter.classList.toggle("is-active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
    document.querySelectorAll(".product-card").forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
    });
  });
});

document.querySelectorAll("[data-toggle-wishlist]").forEach((button) => {
  button.addEventListener("click", () => {
    const productId = button.dataset.toggleWishlist;
    wishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];
    saveWishlist();
    renderWishlist();
  });
});

wishlistItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-toggle-wishlist]");
  if (removeButton) {
    wishlist = wishlist.filter((id) => id !== removeButton.dataset.toggleWishlist);
    saveWishlist();
    renderWishlist();
    return;
  }

  const addButton = event.target.closest("[data-wishlist-add]");
  if (!addButton) return;
  const productId = addButton.dataset.wishlistAdd;
  const sizeSelector = document.querySelector(
    `.product-card[data-product-id="${productId}"] select`,
  );
  const size = sizeSelector.value;
  const existingItem = cart.find((item) => item.id === productId && item.size === size);
  if (existingItem) existingItem.quantity += 1;
  else cart.push({ id: productId, size, quantity: 1 });
  saveCart();
  renderCart();
  wishlistDialog.close();
  openDialog(cartDialog);
});

document.querySelectorAll("[data-add-product]").forEach((button) => {
  button.addEventListener("click", () => {
    const productId = button.dataset.addProduct;
    const productCard = button.closest(".product-card");
    const size = productCard.querySelector("select").value;
    const existingItem = cart.find((item) => item.id === productId && item.size === size);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ id: productId, size, quantity: 1 });

    saveCart();
    renderCart();
    checkoutNote.textContent = "";
    openDialog(cartDialog);
  });
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) return;
  const line = button.closest("[data-cart-key]");
  const [id, size] = line.dataset.cartKey.split(":");
  const item = cart.find((entry) => entry.id === id && entry.size === size);
  if (!item) return;

  if (button.dataset.cartAction === "increase") item.quantity += 1;
  else if (item.quantity > 1) item.quantity -= 1;
  else cart = cart.filter((entry) => entry !== item);

  saveCart();
  renderCart();
});

document.querySelector("[data-checkout]").addEventListener("click", () => {
  checkoutNote.textContent = "Checkout is coming soon. Your bag is saved on this device.";
});

renderCart();
renderWishlist();
