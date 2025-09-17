// Elementos del DOM
const ProductList = document.getElementById('product-list');
const CheckoutBtn = document.getElementById('checkout-btn');
const ToggleCartBtn = document.getElementById('toggle-cart-btn');
const CartItemsContainer = document.getElementById('cart-items');
const CartDropdown = document.getElementById('cart-dropdown');
const CartTotalElement = document.getElementById('cart-total');
const CartCountElement = document.getElementById('cart-count');

const TeamFilter = document.getElementById('team-filter');
const SeasonFilter = document.getElementById('season-filter');
const StateFilter = document.getElementById('state-filter');
const SizeFilter = document.getElementById('size-filter');
const BrandFilter = document.getElementById('brand-filter');
const PriceFilter = document.getElementById('price-filter');
const PriceValue = document.getElementById('price-value');
const ApplyFiltersBtn = document.getElementById('apply-filters-btn');
const ClearFiltersBtn = document.getElementById('clear-filters-btn');

let cart = [];
let allProducts = [];

// Cargar productos al iniciar la página
document.addEventListener('DOMContentLoaded', fetchAndSetupProducts);

async function fetchAndSetupProducts() 
{
    try 
    {
        let response = await fetch("http://localhost:8000/api/products", { method: "GET" });
        
        if (!response.ok) 
        {
            throw new Error(`HTTP error! state: ${response.state}`);
        }
        
        allProducts = await response.json(); 
        renderProducts(allProducts); 
        setupFilters(allProducts); 
    } 
    catch (error) 
    {
        console.error("Error fetching products:", error);
        ProductList.innerHTML = '<p>Error al cargar los productos. Por favor, intente de nuevo más tarde.</p>';
    }
}

// Función para renderizar los productos en la lista
function renderProducts(productsToRender) 
{
    ProductList.innerHTML = '';
    if (productsToRender.length === 0) 
    {
        ProductList.innerHTML = '<p>No se encontraron productos que coincidan con los filtros.</p>';
        return;
    }

    productsToRender.forEach(product => 
        {
            let imageUrls = product.images.split(",");
            let primaryImage = imageUrls.length > 0 ? `http://localhost:8000/api${imageUrls[0].slice(2,-1)}` : '';
            let secondaryImage = imageUrls.length > 1 ? `http://localhost:8000/api${imageUrls[1].slice(2,-2)}` : primaryImage;

            let productItem = document.createElement('div');
            productItem.classList.add('product-item');
            productItem.innerHTML = `
                <img src="${primaryImage}" alt="${product.name} (Anverso)">
                <img src="${secondaryImage}" alt="${product.name} (Reverso)" style="display:none;">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p><strong>Marca:</strong> ${product.brand || 'Sin marca'}</p>
                <p><strong>Talla:</strong> ${product.size || 'Sin talla'}</p>
                <p><strong>Calidad:</strong> ${product.state !== undefined ? product.state : 'N/A'}</p>
                <p class="price">€${parseFloat(product.price).toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}">Agregar al Carrito</button>
            `;
            ProductList.appendChild(productItem);
        }
    );

    ProductList.querySelectorAll('.add-to-cart-btn').forEach(button => 
        {
            button.addEventListener('click', (e) => 
                {
                    let productId = e.target.dataset.id;
                    let productToAdd = allProducts.find(p => p.id == productId);
                    if (productToAdd) 
                    {
                        addToCart(productToAdd);
                    }
                }
            );
        }
    );
}

// Función para configurar las opciones de los filtros
function setupFilters(products) 
{
    let teams = new Set();
    let seasons = new Set();
    let brands = new Set();
    let sizes = new Set();
    let maxPrice = 0;

    products.forEach(product => 
        {
            if (product.name) 
            {
                teams.add(product.name);
            }
            if (product.description)
            {
                seasons.add(product.description);
            }
            if (product.brand) 
            {
                brands.add(product.brand);
            }
            if (product.size) 
            {
                sizes.add(product.size);
            }
            if (product.price && parseFloat(product.price) > maxPrice) 
            {
                maxPrice = parseFloat(product.price);
            }
        }
    );

    // Rellenar filtro de equipo
    teams.forEach(team => 
        {
            let option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            TeamFilter.appendChild(option);
        }
    );

    // Rellenar filtro de temporada
    seasons.forEach(season =>
        {
            let option = document.createElement('option');
            option.value = season;  
            option.textContent = season;
            SeasonFilter.appendChild(option);
        }   
    );

    // Rellenar filtro de marcas
    brands.forEach(brand => 
        {
            let option = document.createElement('option');
            option.value = brand;
            option.textContent = brand;
            BrandFilter.appendChild(option);
        }
    );

    // Rellenar filtro de tallas
    sizes.forEach(size => 
        {
            let option = document.createElement('option');
            option.value = size;
            option.textContent = size;
            SizeFilter.appendChild(option);
        }  
    );

    // Configurar rango de precio
    PriceFilter.max = Math.ceil(maxPrice);
    PriceFilter.value = Math.ceil(maxPrice);
    PriceValue.textContent = `€${Math.ceil(maxPrice).toFixed(2)}`;
}

// Lógica de filtros
PriceFilter.addEventListener('input', () => 
    {
        PriceValue.textContent = `€${parseFloat(PriceFilter.value).toFixed(2)}`;
    }
);

ApplyFiltersBtn.addEventListener('click', () => 
    {
        let selectedTeam = TeamFilter.value.toLowerCase();
        let selectedSeason = StateFilter.value.toLowerCase();
        let selectedState = StateFilter.value;
        let selectedBrand = BrandFilter.value;
        let selectedSize = SizeFilter.value;
        let maxPrice = parseFloat(PriceFilter.value);

        let filteredProducts = allProducts.filter(product => 
            {
                let productName = product.name ? product.name.toLowerCase() : '';
                let productDescription = product.description ? product.description.toLowerCase() : '';
                let productBrand = product.brand ? product.brand : '';
                let productState = product.state ? product.state : '';
                let productSize = product.size ? product.size : '';
                let productPrice = parseFloat(product.price);

                // Filtrar por equipo (basado en el nombre o descripción del producto)
                let matchesTeam = selectedTeam === '' || productName.includes(selectedTeam) || productDescription.includes(selectedTeam);

                // Filtrar por temporada (basado en la descripción del producto)
                let matchesSeason = selectedSeason === '' || productDescription.includes(selectedSeason);
                
                // Filtrar por estado (basado en la descripción del producto)
                let matchesState = selectedState === '' || productState.includes(selectedState);

                // Filtrar por marca
                let matchesBrand = selectedBrand === '' || productBrand.includes(selectedBrand);

                // Filtrar por talla
                let matchesSize = selectedSize === '' || productSize.includes(selectedSize);

                // Filtrar por precio
                let matchesPrice = productPrice <= maxPrice;

                return matchesTeam && matchesSeason && matchesState && matchesBrand  && matchesSize && matchesPrice;
            }  
        );
        renderProducts(filteredProducts);
    }
);

ClearFiltersBtn.addEventListener('click', () => 
    {
        TeamFilter.value = '';
        StateFilter.value = '';
        BrandFilter.value = '';
        SizeFilter.value = '';
        PriceFilter.value = PriceFilter.max;
        PriceValue.textContent = `€${parseFloat(PriceFilter.max).toFixed(2)}`;
        renderProducts(allProducts);
    }
);

// Lógica del carrito
CheckoutBtn.addEventListener('click', () => 
    {
        if (cart.length === 0) 
        {
            alert('Tu carrito está vacío. Agrega productos antes de finalizar la compra.');
        } 
        else 
        {
            alert('¡Gracias por tu compra!');
            cart = [];
            renderCart();
        }
    }
);

ToggleCartBtn.addEventListener('click', () => 
    {
        CartDropdown.style.display = CartDropdown.style.display === 'block' ? 'none' : 'block';
    }
);

CartItemsContainer.addEventListener('click', (e) => 
    {
        let productId = e.target.dataset.id;
        if (!productId) return;

        let productToUpdate = cart.find(item => item.id == productId);
        if (!productToUpdate) return;

        if (e.target.classList.contains('increase-btn')) 
        {
            productToUpdate.quantity += 1;
        } 
        else if (e.target.classList.contains('decrease-btn')) 
        {
            if (productToUpdate.quantity > 1) 
            {
                productToUpdate.quantity -= 1;
            } 
            else 
            {
                cart = cart.filter(item => item.id != productId);
            }
        }
        renderCart();
    }
);

// Función para agregar un producto al carrito
function addToCart(product) 
{
    let existingProduct = cart.find(item => item.id == product.id);
    if (existingProduct) 
    {
        existingProduct.quantity += 1;
    } 
    else 
    {
        // Asegurarse de que el objeto product tenga las propiedades necesarias para el carrito
        cart.push(
            {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                images: product.images ? product.images.split(',')[0] : '',
                quantity: 1
            }
        );
    }
    renderCart();
}

// Función para renderizar el carrito
function renderCart() 
{
    CartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) 
    {
        CartItemsContainer.innerHTML = '<p>El carrito está vacío.</p>';
    } 
    else 
    {
        cart.forEach(item => 
            {
                let cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <img src="http://localhost:8000/${item.images}" alt="${item.name}" width="50">
                    <span>${item.name}</span>
                    <div class="quantity">
                        <button class="decrease-btn" data-id="${item.id}">-</button>
                        <input type="number" value="${item.quantity}" min="1" data-id="${item.id}" class="quantity-input" readonly>
                        <button class="increase-btn" data-id="${item.id}">+</button>
                    </div>
                    <span>€${(item.price * item.quantity).toFixed(2)}</span>
                `;
                CartItemsContainer.appendChild(cartItem);
                total += item.price * item.quantity;
            }
        );
    }

    CartTotalElement.textContent = total.toFixed(2);
    CartCountElement.textContent = cart.length;
}