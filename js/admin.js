// Variables globales
const ApiUrl = "http://localhost:8000/api/products";

const ProductForm = document.getElementById('product-form');
const ProductIdInput = document.getElementById('product-id');
const ProductTeamInput = document.getElementById('product-team');
const ProductSeasonInput = document.getElementById('product-season');
const ProductBrandInput = document.getElementById('product-brand');
const ProductPriceInput = document.getElementById('product-price');
const ProductSizeInput = document.getElementById('product-size');
const ProductStateInput = document.getElementById('product-state');
const ProductImageInput = document.getElementById('product-image');
const SaveProductBtn = document.getElementById('save-product-btn');
const CancelEditBtn = document.getElementById('cancel-edit-btn');
const ProductTableBody = document.querySelector('#product-table tbody');

// Cargar productos al iniciar la página
document.addEventListener('DOMContentLoaded', fetchAndRenderProducts);

// Función para obtener y renderizar productos
async function fetchAndRenderProducts() 
{
    try 
    {
        let response = await fetch(ApiUrl, { method: "GET" });
        if (!response.ok) 
        {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let products = await response.json();
        renderProducts(products);
    } 
    catch (error) 
    {
        console.error("Error fetching products:", error);
        alert("Error al cargar los productos. Por favor, intente de nuevo más tarde.");
    }
}

// Función para renderizar los productos en la tabla
function renderProducts(products) 
{
    ProductTableBody.innerHTML = ''; // Limpiar tabla
    if (products.length === 0) 
    {
        ProductTableBody.innerHTML = '<tr><td colspan="6">No hay productos disponibles.</td></tr>';
        return;
    }

    products.forEach(product => 
        {
            let row = ProductTableBody.insertRow();
            
            // Asegurarse de que product.images sea un array y tomar la primera imagen si existe
            let imageUrl = product.images && product.images.length > 0 ? `http://localhost:8000/${product.images[0]}` : '';
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.brand}</td>
                <td>${parseFloat(product.price).toFixed(2)}€</td>
                <td>${product.size}</td>
                <td>${product.state}</td>
                <td><img src="${imageUrl}" alt="${product.name}" width="50"></td>
                <td class="actions">
                    <button class="edit-btn" data-id="${product.id}">Editar</button>
                    <button class="delete-btn" data-id="${product.id}">Eliminar</button>
                </td>
            `;
        }
    );

    // Añadir event listeners a los botones de editar y eliminar
    addEventListenersToProductButtons(products);
}

// Función para añadir event listeners a los botones de producto
function addEventListenersToProductButtons(products) 
{
    ProductTableBody.querySelectorAll('.edit-btn').forEach(button => 
        {
            button.onclick = (e) => editProduct(e.target.dataset.id, products);
        }
    );
    
    ProductTableBody.querySelectorAll('.delete-btn').forEach(button => 
        {
            button.onclick = (e) => deleteProduct(e.target.dataset.id);
        }
    );
}

// Función para editar un producto
function editProduct(idToEdit, products) 
{
    let productToEdit = products.find(p => p.id == idToEdit); 
    if (productToEdit) 
    {
        ProductIdInput.value = productToEdit.id;
        ProductTeamInput.value = productToEdit.name;
        ProductSeasonInput.value = productToEdit.description;
        ProductBrandInput.value = productToEdit.brand;
        ProductPriceInput.value = productToEdit.price;
        ProductSizeInput.value = productToEdit.size;
        ProductStateInput.value = productToEdit.state;

        SaveProductBtn.textContent = 'Actualizar Producto';
        CancelEditBtn.style.display = 'inline-block';
    }
}

// Función para eliminar un producto
async function deleteProduct(idToDelete) 
{
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) 
    {
        try 
        {
            let response = await fetch(`${ApiUrl}/${idToDelete}`, {method: 'DELETE'});
            
            if (!response.ok) 
            {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert('Producto eliminado con éxito.');
            fetchAndRenderProducts();
            resetForm();
        } 
        catch (error) 
        {
            console.error("Error deleting product:", error);
            alert("Error al eliminar el producto. Por favor, intente de nuevo más tarde.");
        }
    }
}

// Manejar el envío del formulario
ProductForm.onsubmit = async function(e) 
{
    e.preventDefault();
        
    let form = e.target
    let formData = new FormData(form);

    let productId = ProductIdInput.value;
    let method = 'POST';
    let url = ApiUrl;

    if (productId) 
    {
        method = 'PUT';
        url = `${ApiUrl}/${productId}`;
        formData=JSON.stringify(
            {
                name: ProductTeamInput.value,
                description: ProductSeasonInput.value,
                price: parseFloat(ProductPriceInput.value).toFixed(2),
                state: ProductStateInput.value,
                size: ProductSizeInput.value,
                brand: ProductBrandInput.value,

            }
        );
    }

    try 
    {
        let response = await fetch(url, 
            {
                method: method,
                body: formData
            }
        );

        if (!response.ok) 
        {
            let errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || response.statusText}`);
        }

        alert(`Producto ${productId ? 'actualizado' : 'agregado'} con éxito.`);
        fetchAndRenderProducts();
        resetForm();
    } 
    catch (error) 
    {
        console.error("Error saving product:", error);
        alert(`Error al ${productId ? 'actualizar' : 'agregar'} el producto: ${error.message}.`);
    }
}

// Función para cancelar la edición y limpiar el formulario
CancelEditBtn.addEventListener('click', resetForm);

// Función para resetear el formulario
function resetForm() 
{
    ProductForm.reset();
    ProductIdInput.value = '';
    SaveProductBtn.textContent = 'Guardar Producto';
    CancelEditBtn.style.display = 'none';
    ProductImageInput.value = ''; 
}




