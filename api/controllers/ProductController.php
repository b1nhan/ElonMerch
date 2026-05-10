<?php
/**
 * Product Controller
 * Handles merchandise/product operations
 */

class ProductController extends BaseController {

    /**
     * Get all products with pagination and filtering
     * Endpoint: GET /products?page=1&per_page=10&category=Áo&status=available
     * 
     * Query Parameters:
     * - page: Page number (default: 1)
     * - per_page: Items per page (default: 10, max: 100)
     * - category: Filter by category
     * - status: Filter by status (available, unavailable, discontinued)
     * - sort: Sort by (price, name - default: name)
     * - order: asc or desc (default: asc)
     * 
     * Response includes pagination metadata
     */
    public function list() {
        try {
            // Get pagination parameters
            $page = max(1, (int)$this->getInput('page', 1));
            $per_page = min(100, max(1, (int)$this->getInput('per_page', 10)));
            $category = $this->getInput('category', null);
            $status = $this->getInput('status', null);
            $sort = in_array($this->getInput('sort'), ['price', 'name']) ? $this->getInput('sort') : 'name';
            $order = strtoupper($this->getInput('order', 'ASC')) === 'DESC' ? 'DESC' : 'ASC';

            // Build query
            $where = "1=1";
            $params = [];

            if ($category) {
                $where .= " AND category = ?";
                $params[] = $category;
            }

            if ($status) {
                $where .= " AND status = ?";
                $params[] = $status;
            }

            // Get total count
            $count_result = $this->fetchOne(
                "SELECT COUNT(*) as total FROM products WHERE {$where}",
                $params
            );
            $total = $count_result['total'] ?? 0;

            // Calculate offset
            $offset = ($page - 1) * $per_page;

            // Get products
            $products = $this->fetchAll(
                "SELECT id, name, description, price, colors, sizes, image, category, stock, sku, status 
                 FROM products 
                 WHERE {$where} 
                 ORDER BY {$sort} {$order} 
                 LIMIT ? OFFSET ?",
                array_merge($params, [$per_page, $offset])
            );

            // Parse JSON fields for each product
            foreach ($products as &$product) {
                $product['colors'] = json_decode($product['colors'], true) ?? [];
                $product['sizes'] = json_decode($product['sizes'], true) ?? [];
                $product['in_stock'] = $product['stock'] > 0;
            }

            Response::paginated($products, $total, $per_page, $page, 'Products retrieved successfully');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Get single product by ID
     * Endpoint: GET /products/:id
     * 
     * URL Parameters:
     * - id: Product ID
     * 
     * Response: Single product object with all details including variants
     */
    public function show() {
        try {
            $product_id = (int)$this->getParam('id');

            if (!$product_id) {
                Response::error('Product ID is required', null, 400);
            }

            $product = $this->fetchOne(
                "SELECT id, name, description, price, colors, sizes, image, category, stock, sku, status, created_at, updated_at 
                 FROM products 
                 WHERE id = ?",
                [$product_id]
            );

            if (!$product) {
                Response::notFound('Product not found');
            }

            // Parse JSON fields
            $product['colors'] = json_decode($product['colors'], true) ?? [];
            $product['sizes'] = json_decode($product['sizes'], true) ?? [];
            $product['in_stock'] = $product['stock'] > 0;
            $product['stock_status'] = $product['stock'] > 10 ? 'In Stock' : ($product['stock'] > 0 ? 'Low Stock' : 'Out of Stock');

            Response::success($product, 'Product retrieved successfully');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Create new product (Admin only)
     * Endpoint: POST /products
     */
    public function create() {
        try {
            $this->requireRole('admin');

            $errors = $this->validate(['name', 'price']);
            if ($errors) {
                Response::validationError($errors);
            }

            $name = $this->sanitize($this->getInput('name'));
            $description = $this->sanitize($this->getInput('description', ''));
            $price = (float)$this->getInput('price');
            $colors = json_encode($this->getInput('colors', []));
            $sizes = json_encode($this->getInput('sizes', []));
            $image = $this->getInput('image', '');
            $category = $this->sanitize($this->getInput('category', ''));
            $stock = (int)$this->getInput('stock', 0);
            $sku = $this->sanitize($this->getInput('sku', ''));

            $this->executeQuery(
                "INSERT INTO products (name, description, price, colors, sizes, image, category, stock, sku) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [$name, $description, $price, $colors, $sizes, $image, $category, $stock, $sku]
            );

            $product_id = $this->lastInsertId();
            $product = $this->fetchOne("SELECT * FROM products WHERE id = ?", [$product_id]);

            Response::created($product, 'Product created successfully');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Update product (Admin only)
     * Endpoint: PUT /products/:id
     */
    public function update() {
        try {
            $this->requireRole('admin');

            $product_id = (int)$this->getParam('id');
            if (!$product_id) {
                Response::error('Product ID is required', null, 400);
            }

            $product = $this->fetchOne("SELECT id FROM products WHERE id = ?", [$product_id]);
            if (!$product) {
                Response::notFound('Product not found');
            }

            $data = $this->getAllInput();
            $updates = [];
            $params = [];

            foreach (['name', 'description', 'price', 'image', 'category', 'stock', 'sku', 'status'] as $field) {
                if (isset($data[$field])) {
                    $updates[] = "{$field} = ?";
                    $params[] = $data[$field];
                }
            }

            if (isset($data['colors'])) {
                $updates[] = "colors = ?";
                $params[] = json_encode($data['colors']);
            }

            if (isset($data['sizes'])) {
                $updates[] = "sizes = ?";
                $params[] = json_encode($data['sizes']);
            }

            if (empty($updates)) {
                Response::error('No fields to update', null, 400);
            }

            $params[] = $product_id;
            $this->executeQuery("UPDATE products SET " . implode(', ', $updates) . " WHERE id = ?", $params);

            $updated = $this->fetchOne("SELECT * FROM products WHERE id = ?", [$product_id]);
            Response::success($updated, 'Product updated successfully');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Delete product (Admin only)
     * Endpoint: DELETE /products/:id
     */
    public function delete() {
        try {
            $this->requireRole('admin');

            $product_id = (int)$this->getParam('id');
            if (!$product_id) {
                Response::error('Product ID is required', null, 400);
            }

            $product = $this->fetchOne("SELECT id FROM products WHERE id = ?", [$product_id]);
            if (!$product) {
                Response::notFound('Product not found');
            }

            $this->executeQuery("DELETE FROM products WHERE id = ?", [$product_id]);

            Response::success(null, 'Product deleted successfully');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }
}
