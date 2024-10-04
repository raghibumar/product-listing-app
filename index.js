// URL to get all the products list
const baseUrl = "https://dummyjson.com/products";

// Default values for pagination
let currentPage = 1;
const limit = 10;

// Function to get products with pagination support
async function getProducts(page = 1, limit = 10) {
  // Calculate the skip value for the API (products to skip based on current page)
  const skip = (page - 1) * limit;
  const url = `${baseUrl}?limit=${limit}&skip=${skip}`;

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

// Function to display products for a specific page
async function showProducts(page, limit) {
  const data = await getProducts(page, limit);
  console.log("data:", data);

  // Get the container where you want to display products
  const mainContainer = document.querySelector("#main-container");

  // Empty the container before displaying new products
  mainContainer.innerHTML = "";

  const productCardContainer = document.createElement("div");
  productCardContainer.classList.add("product-card-container");

  // Loop through each product and create elements
  data.products.forEach((product) => {
    // Create product card elements
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    // Create product image container
    const productImageContainer = document.createElement("div");
    productImageContainer.classList.add("product-image-container");

    const productImage = document.createElement("img");
    productImage.src = product.images[0];
    productImage.classList.add("product-image");

    productImageContainer.appendChild(productImage);

    // Create product details container
    const productDetailsContainer = document.createElement("div");
    productDetailsContainer.classList.add("product-details-container");

    // Create product title element
    const productTitle = document.createElement("p");
    productTitle.classList.add("product-title");
    productTitle.textContent = product.title;

    // Create product price element
    const productPrice = document.createElement("p");
    productPrice.classList.add("product-price");
    productPrice.textContent = `Price: $${product.price}`;

    // Product rating (with dynamic stars)
    const productRating = generateStars(product.rating); // Generate stars based on rating

    // Create product description element
    const productDescription = document.createElement("p");
    productDescription.classList.add("product-description");
    productDescription.textContent = product.description;

    // Initially, show only 2 lines of description (CSS handles this)
    const readMoreButton = document.createElement("button");
    readMoreButton.textContent = "Read More";
    readMoreButton.classList.add("read-more-btn");

    // Add the "Read More" functionality
    readMoreButton.addEventListener("click", () => {
      if (productDescription.classList.contains("expanded")) {
        productDescription.classList.remove("expanded");
        readMoreButton.textContent = "Read More";
      } else {
        productDescription.classList.add("expanded");
        readMoreButton.textContent = "Show Less";
      }
    });

    // Append elements to the product details container
    productDetailsContainer.append(
      productTitle,
      productPrice,
      productRating,
      productDescription,
      readMoreButton
    );

    // Append image and details containers to the product card
    productCard.append(productImageContainer, productDetailsContainer);

    // Append the product card to the main product card container
    productCardContainer.appendChild(productCard);
  });

  // Append the product card container to the main container
  mainContainer.appendChild(productCardContainer);

  // Update pagination controls
  updatePaginationControls(data.total, page, limit);
}

// Function to update pagination buttons
function updatePaginationControls(totalItems, currentPage, limit) {
  const totalPages = Math.ceil(totalItems / limit);
  console.log("totalPages:", totalPages);

  // Get the pagination container
  const paginationContainer = document.querySelector("#pagination-container");

  // Clear the previous buttons
  paginationContainer.innerHTML = "";

  // Create "Previous" button
  const prevButton = document.createElement("button");
  prevButton.textContent = "Previous";
  prevButton.disabled = currentPage === 1; // Disable if on the first page
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      showProducts(currentPage, limit);
    }
  });

  // Create "Next" button
  const nextButton = document.createElement("button");
  nextButton.textContent = "Next";
  nextButton.disabled = currentPage === totalPages; // Disable if on the last page
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      showProducts(currentPage, limit);
    }
  });

  // Append buttons to the pagination container
  paginationContainer.append(prevButton, nextButton);
}

// Display products for the first page with a limit of 10
showProducts(currentPage, limit);

// Function to generate stars based on rating with decimals
function generateStars(rating) {
  const starContainer = document.createElement("div");
  starContainer.classList.add("star-container");

  // Tooltip element to show the exact rating
  const tooltip = document.createElement("span");
  tooltip.classList.add("tooltip");
  tooltip.textContent = `Rating: ${rating.toFixed(1)}`; // Show rating with 1 decimal precision
  starContainer.appendChild(tooltip);

  // Full stars
  const fullStars = Math.floor(rating); // Get integer part (e.g., 4 from 4.7)
  const decimalPart = rating % 1; // Get decimal part (e.g., 0.7 from 4.7)

  // Add 5 stars (either full or empty)
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.classList.add("star");
    star.textContent = "★"; // Use star character

    if (i <= fullStars) {
      // Full stars
      star.classList.add("full");
    } else if (i === fullStars + 1 && decimalPart > 0) {
      // Partially filled star for the decimal part
      star.classList.add("partial");
      const fillPercentage = decimalPart * 100; // Convert decimal to percentage (e.g., 0.7 -> 70%)
      star.style.setProperty("--fill-percent", `${fillPercentage}%`);
    }

    starContainer.appendChild(star);
  }

  return starContainer;
}
