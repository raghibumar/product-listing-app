// URL to get all the products list
const baseUrl = "https://dummyjson.com/products";
const categoryUrl = "https://dummyjson.com/products/category-list"; // URL to get category list

// Default values for pagination and sorting
let currentPage = 1;
const limit = 10;
let currentSearchQuery = ""; // Store the current search query
let currentSortBy = "title"; // Default sort by title
let currentSortOrder = "asc"; // Default sort order
let currentCategory = ""; // Store the currently selected category

// Function to get categories
async function fetchCategories() {
  try {
    const response = await fetch(categoryUrl);
    const data = await response.json();
    console.log("data:", data);
    populateCategoryDropdown(data);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
  }
}

// Function to populate the category dropdown
function populateCategoryDropdown(categories) {
  const categorySelect = document.getElementById("category-select");
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category; // Use the category name as the value
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1); // Capitalize first letter
    categorySelect.appendChild(option);
  });
}

// Function to get products with pagination support or search
async function getProducts(
  page = 1,
  limit = 10,
  searchValue = "",
  sortBy = "title",
  order = "asc",
  category = ""
) {
  const skip = (page - 1) * limit;
  const url = category
    ? `${baseUrl}/category/${category}?limit=${limit}&skip=${skip}`
    : searchValue
    ? `${baseUrl}/search?q=${searchValue}&limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`
    : `${baseUrl}?limit=${limit}&skip=${skip}&sortBy=${sortBy}&order=${order}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error("Something went wrong");
    }
  } catch (error) {
    console.error(error);
  }
}

// Function to display products for a specific page, with optional search query, sorting, and category
async function showProducts(page, limit, searchValue = "") {
  const data = await getProducts(
    page,
    limit,
    searchValue,
    currentSortBy,
    currentSortOrder,
    currentCategory
  );
  const productList = document.querySelector("#product-list");

  productList.innerHTML = "";

  if (data && data.products.length > 0) {
    const productCardContainer = document.createElement("div");
    productCardContainer.classList.add("product-card-container");

    data.products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      const productImageContainer = document.createElement("div");
      productImageContainer.classList.add("product-image-container");

      const productImage = document.createElement("img");
      productImage.src = product.images[0];
      productImage.classList.add("product-image");

      productImageContainer.appendChild(productImage);

      const productDetailsContainer = document.createElement("div");
      productDetailsContainer.classList.add("product-details-container");

      const productTitle = document.createElement("p");
      productTitle.classList.add("product-title");
      productTitle.textContent = product.title;

      const productPrice = document.createElement("p");
      productPrice.classList.add("product-price");
      productPrice.textContent = `Price: $${product.price}`;

      const productRating = generateStars(product.rating);

      const productDescription = document.createElement("p");
      productDescription.classList.add("product-description");
      productDescription.textContent = product.description;

      const readMoreButton = document.createElement("button");
      readMoreButton.textContent = "Read More";
      readMoreButton.classList.add("read-more-btn");

      readMoreButton.addEventListener("click", () => {
        if (productDescription.classList.contains("expanded")) {
          productDescription.classList.remove("expanded");
          readMoreButton.textContent = "Read More";
        } else {
          productDescription.classList.add("expanded");
          readMoreButton.textContent = "Show Less";
        }
      });

      productDetailsContainer.append(
        productTitle,
        productPrice,
        productRating,
        productDescription,
        readMoreButton
      );

      productCard.append(productImageContainer, productDetailsContainer);
      productCardContainer.appendChild(productCard);
    });

    productList.appendChild(productCardContainer);

    // Update pagination controls
    updatePaginationControls(data.total, page, limit, searchValue);
  } else {
    displayNoProductsFound();
  }
}

// Function to update pagination controls
function updatePaginationControls(
  totalItems,
  currentPage,
  limit,
  searchValue = ""
) {
  const totalPages = Math.ceil(totalItems / limit);
  const paginationContainer = document.querySelector("#pagination-container");
  paginationContainer.style.display = "flex";
  paginationContainer.innerHTML = "";

  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showProducts(currentPage, limit, searchValue);
    }
  });

  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showProducts(currentPage, limit, searchValue);
    }
  });

  paginationContainer.append(prevButton, nextButton);
}

// Function to handle "no products found"
function displayNoProductsFound() {
  const productList = document.querySelector("#product-list");
  productList.innerHTML =
    "<p>No products found. Please try a different search.</p>";
}

// Display products for the first page with a limit of 10
showProducts(currentPage, limit);

// Fetch categories and populate the dropdown on page load
fetchCategories();

// Search form event listener
document.querySelector(".search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const searchInput = document.querySelector("#search-input");
  const searchValue = searchInput.value.trim();
  if (searchValue) {
    currentPage = 1;
    currentSearchQuery = searchValue;
    showProducts(currentPage, limit, currentSearchQuery);
  }
});

// Home button listener
document.querySelector(".home").addEventListener("click", () => {
  window.location.reload();
});

// Sorting dropdown event listener
const sortSelect = document.getElementById("sort-select");
sortSelect.addEventListener("change", (e) => {
  const [sortBy, order] = e.target.value.split("_");
  currentSortBy = sortBy;
  currentSortOrder = order;
  currentPage = 1; // Reset to first page on sort change
  showProducts(currentPage, limit, currentSearchQuery);
});

// Category dropdown event listener
const categorySelect = document.getElementById("category-select");
categorySelect.addEventListener("change", (e) => {
  currentCategory = e.target.value; // Set the current category
  currentPage = 1; // Reset to first page on category change
  showProducts(currentPage, limit, currentSearchQuery);
});

// Function to generate stars based on rating
function generateStars(rating) {
  const starContainer = document.createElement("div");
  starContainer.classList.add("star-container");

  const fullStars = Math.floor(rating);
  const decimalPart = rating % 1;

  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.classList.add("star");
    star.textContent = "★";

    if (i <= fullStars) {
      star.classList.add("full");
    } else if (i === fullStars + 1 && decimalPart > 0) {
      star.classList.add("partial");
      const fillPercentage = decimalPart * 100;
      star.style.setProperty("--fill-percent", `${fillPercentage}%`);
    }

    starContainer.appendChild(star);
  }

  return starContainer;
}
