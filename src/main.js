import "./style.css";

const apiUrl = "https://dummyjson.com/products?limit=0";
const searchInput = document.querySelector("#search");
const productList = document.querySelector("#product-list");
const productCount = document.querySelector("#product-count");
const status = document.querySelector("#status");
const statusMessage = document.querySelector("#status-message");
const retryButton = document.querySelector("#retry-button");
const priceFormat = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "USD",
});

let products = [];

function showStatus(message, isError = false) {
  status.hidden = false;
  statusMessage.textContent = message;
  retryButton.hidden = !isError;
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const image = document.createElement("img");
  image.src = product.thumbnail;
  image.alt = product.title;
  image.loading = "lazy";
  image.width = 280;
  image.height = 220;

  const details = document.createElement("div");
  details.className = "product-details";

  const category = document.createElement("p");
  category.className = "category";
  category.textContent = product.category;

  const title = document.createElement("h3");
  title.textContent = product.title;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = priceFormat.format(product.price);

  details.append(category, title, price);
  card.append(image, details);
  return card;
}

function renderProducts() {
  const searchText = searchInput.value.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchText),
  );

  productList.replaceChildren(...filteredProducts.map(createProductCard));
  productCount.textContent = "Показано: " + filteredProducts.length + " из " + products.length;
  status.hidden = true;

  if (filteredProducts.length === 0) {
    showStatus("Ничего не найдено");
  }
}

async function loadProducts() {
  products = [];
  productList.replaceChildren();
  productCount.textContent = "";
  productList.setAttribute("aria-busy", "true");
  searchInput.disabled = true;
  showStatus("Загрузка…");

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Ошибка HTTP: " + response.status);
    }

    const data = await response.json();
    if (!Array.isArray(data.products)) {
      throw new Error("В ответе API отсутствует список товаров");
    }

    products = data.products;
    renderProducts();
    searchInput.disabled = false;
  } catch (error) {
    console.error("Не удалось загрузить товары:", error);
    showStatus("Не удалось загрузить товары. Проверьте подключение к интернету и попробуйте снова.", true);
  } finally {
    productList.setAttribute("aria-busy", "false");
  }
}

searchInput.addEventListener("input", renderProducts);
retryButton.addEventListener("click", loadProducts);
loadProducts();
