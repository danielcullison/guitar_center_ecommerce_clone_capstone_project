const client = require("../client.js");

/**
 * Create a new product in the database.
 * @param {string} name - The name of the product.
 * @param {string} description - The description of the product.
 * @param {number} price - The price of the product.
 * @param {number} category_id - The category ID of the product.
 * @param {string} image_url - The image URL of the product.
 * @returns {object} - Result of the operation, indicating success and the created product or error message.
 */
const createProduct = async (
  name,
  description,
  price,
  category_id,
  image_url
) => {
  try {
    // Insert the new product into the products table
    const { rows } = await client.query(
      `
      INSERT INTO products (name, description, price, category_id, image_url) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name, description, price, category_id, image_url, created_at, updated_at;
      `,
      [name, description, price, category_id, image_url]
    );
    // Return success status and the created product details
    return { success: true, product: rows[0] };
  } catch (error) {
    console.error("ERROR CREATING PRODUCT: ", error);
    // Return error information if the operation fails
    return { success: false, error: error.message };
  }
};

/**
 * Get all products from the database.
 * @returns {object} - Result of the operation, including success status and an array of products or error message.
 */
const getProducts = async () => {
  try {
    // Query the database to fetch all products
    const { rows } = await client.query(`
      SELECT * FROM products
      ORDER BY created_at DESC;
    `);
    // Return success status and the list of products
    return { success: true, products: rows };
  } catch (error) {
    console.error("ERROR FETCHING PRODUCTS: ", error);
    // Return error information if fetching fails
    return { success: false, error: error.message };
  }
};

/**
 * Get a single product by ID from the database.
 * @param {number} product_id - The ID of the product to retrieve.
 * @returns {object} - Result of the operation, including success status and the product or error message.
 */
const getSingleProduct = async (product_id) => {
  try {
    // Query the database to fetch a product by its ID
    const { rows } = await client.query(
      `
      SELECT * FROM products
      WHERE id = $1;
      `,
      [product_id]
    );

    // If no product is found, return an error message
    if (rows.length === 0) {
      console.error("Item not found");
      return { success: false, error: "Item not found" };
    }

    // Return success status and the found product
    return { success: true, item: rows[0] };
  } catch (error) {
    console.error("ERROR FETCHING PRODUCT: ", error);
    // Return error information if fetching fails
    return { success: false, error: error.message };
  }
};

/**
 * Update an existing product in the database.
 * @param {number} product_id - The ID of the product to update.
 * @param {object} data - The product data to update, which can include name, description, price, category_id, and image_url.
 * @returns {object} - Result of the operation, indicating success and the updated product or error message.
 */
const updateProduct = async (product_id, data) => {
  try {
    // Build the update query dynamically based on provided fields
    const fields = [];
    const values = [];

    if (data.name) {
      fields.push(`name = $${fields.length + 1}`);
      values.push(data.name);
    }
    if (data.description) {
      fields.push(`description = $${fields.length + 1}`);
      values.push(data.description);
    }
    if (data.price) {
      if (data.price <= 0) {
        return { success: false, error: "Price must be a positive number." }; // Validation for price
      }
      fields.push(`price = $${fields.length + 1}`);
      values.push(data.price);
    }
    if (data.category_id) {
      fields.push(`category_id = $${fields.length + 1}`);
      values.push(data.category_id);
    }
    if (data.image_url) {
      fields.push(`image_url = $${fields.length + 1}`);
      values.push(data.image_url);
    }

    // Ensure at least one field is being updated
    if (fields.length === 0) {
      return { success: false, error: "No fields to update." }; // Respond if no fields are provided
    }

    // Create the SQL update query
    const query = `
      UPDATE products 
      SET ${fields.join(", ")} 
      WHERE id = $${fields.length + 1} 
      RETURNING id, name, description, price, category_id, image_url, created_at, updated_at;
    `;
    values.push(product_id); // Add product ID to the values for the query

    // Execute the update query
    const { rows } = await client.query(query, values);

    // If no rows are returned, the product was not found
    if (rows.length === 0) {
      return { success: false, error: "Product not found." };
    }

    // Return success status and the updated product details
    return { success: true, product: rows[0] };
  } catch (error) {
    console.error("ERROR UPDATING PRODUCT: ", error);
    // Return error information if the operation fails
    return { success: false, error: error.message };
  }
};

/**
 * Delete a product from the database.
 * @param {number} product_id - The ID of the product to delete.
 * @returns {object} - Result of the operation, indicating success or error message.
 */
const deleteProduct = async (product_id) => {
  try {
    // Execute the delete query
    const { rowCount } = await client.query(
      `
      DELETE FROM products 
      WHERE id = $1;
      `,
      [product_id]
    );

    // Check if any rows were affected (product was found and deleted)
    if (rowCount === 0) {
      return { success: false, error: "Product not found." }; // Return error if product not found
    }

    // Return success status
    return { success: true };
  } catch (error) {
    console.error("ERROR DELETING PRODUCT: ", error);
    // Return error information if the operation fails
    return { success: false, error: error.message };
  }
};

// Export the functions to be used in other modules
module.exports = {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct
};
