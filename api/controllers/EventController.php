<?php
/**
 * Event Controller - FIXED VERSION
 * Handles event operations (ticketing) with proper verification
 * 
 * KEY FIX: DELETE method now verifies rows were actually deleted
 */

class EventController extends BaseController {

    /**
     * Get all events with pagination
     * Endpoint: GET /events?page=1&per_page=10&status=upcoming
     * 
     * Query Parameters:
     * - page: Page number (default: 1)
     * - per_page: Items per page (default: 10, max: 100)
     * - status: Filter by status (upcoming, ongoing, completed, cancelled)
     * - sort: Sort by (date, title, price - default: date)
     * - order: asc or desc (default: asc)
     * 
     * Response includes pagination metadata
     */
    public function list() {
        try {
            // Get pagination parameters
            $page = max(1, (int)$this->getInput('page', 1));
            $per_page = min(100, max(1, (int)$this->getInput('per_page', 10)));
            $status = $this->getInput('status', null);
            $sort = in_array($this->getInput('sort'), ['date', 'title', 'price']) ? $this->getInput('sort') : 'date';
            $order = strtoupper($this->getInput('order', 'ASC')) === 'DESC' ? 'DESC' : 'ASC';

            // Build query
            $where = "1=1";
            $params = [];

            if ($status) {
                $where .= " AND status = ?";
                $params[] = $status;
            }

            // Get total count
            $count_result = $this->fetchOne(
                "SELECT COUNT(*) as total FROM events WHERE {$where}",
                $params
            );
            $total = $count_result['total'] ?? 0;

            // Calculate offset
            $offset = ($page - 1) * $per_page;

            // Get events
            $events = $this->fetchAll(
                "SELECT id, title, description, date, time, location, cast, image, reg_price, vip_price, total_tickets, sold_tickets, status 
                 FROM events 
                 WHERE {$where} 
                 ORDER BY {$sort} {$order} 
                 LIMIT ? OFFSET ?",
                array_merge($params, [$per_page, $offset])
            );

            Response::paginated($events, $total, $per_page, $page, 'Events retrieved successfully');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Get single event by ID
     * Endpoint: GET /events/:id
     * 
     * URL Parameters:
     * - id: Event ID
     * 
     * Response: Single event object with all details
     */
    public function show() {
        try {
            $event_id = (int)$this->getParam('id');

            if (!$event_id) {
                Response::error('Event ID is required', null, 400);
            }

            $event = $this->fetchOne(
                "SELECT id, title, description, date, time, location, cast, image, reg_price, vip_price, total_tickets, sold_tickets, status, created_at, updated_at 
                 FROM events 
                 WHERE id = ?",
                [$event_id]
            );

            if (!$event) {
                Response::notFound('Event not found');
            }

            // Add calculated fields
            $event['available_tickets'] = $event['total_tickets'] - $event['sold_tickets'];
            $event['sold_percentage'] = round(($event['sold_tickets'] / $event['total_tickets']) * 100, 2);

            Response::success($event, 'Event retrieved successfully');

        } catch (Exception $e) {
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Create new event (Admin only)
     * Endpoint: POST /events
     */
    public function create() {
        try {
            $this->requireRole('admin');

            $errors = $this->validate(['title', 'date', 'time', 'location']);
            if ($errors) {
                Response::validationError($errors);
            }

            $title = $this->sanitize($this->getInput('title'));
            $description = $this->sanitize($this->getInput('description', ''));
            $date = $this->getInput('date');
            $time = $this->getInput('time');
            $location = $this->sanitize($this->getInput('location'));
            $cast = $this->sanitize($this->getInput('cast', ''));
            $image = $this->getInput('image', '');
            $reg_price = (float)$this->getInput('reg_price', 0);
            $vip_price = (float)$this->getInput('vip_price', 0);
            $total_tickets = (int)$this->getInput('total_tickets', 1000);

            // ====================================================================
            // STEP 1: VERIFY INPUTS
            // ====================================================================
            if (empty($title)) {
                Response::error('Event title cannot be empty', null, 400);
            }
            if (empty($date)) {
                Response::error('Event date is required', null, 400);
            }
            if (empty($location)) {
                Response::error('Event location is required', null, 400);
            }

            // ====================================================================
            // STEP 2: INSERT EVENT
            // ====================================================================
            $this->executeQuery(
                "INSERT INTO events (title, description, date, time, location, cast, image, reg_price, vip_price, total_tickets) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [$title, $description, $date, $time, $location, $cast, $image, $reg_price, $vip_price, $total_tickets]
            );

            // ====================================================================
            // STEP 3: VERIFY INSERT EXECUTED
            // ====================================================================
            $affected_rows = $this->rowCount();
            if ($affected_rows === 0) {
                error_log('[EVENT_CREATE] ERROR: INSERT query did not affect any rows');
                Response::error('Failed to create event - database error', null, 500);
            }

            // ====================================================================
            // STEP 4: GET CREATED EVENT ID
            // ====================================================================
            $event_id = $this->lastInsertId();
            if (!$event_id || $event_id == 0) {
                error_log('[EVENT_CREATE] ERROR: lastInsertId returned invalid value: ' . $event_id);
                Response::error('Failed to retrieve created event ID', null, 500);
            }

            error_log('[EVENT_CREATE] Event created with ID: ' . $event_id);

            // ====================================================================
            // STEP 5: FETCH AND VERIFY CREATED EVENT
            // ====================================================================
            $event = $this->fetchOne("SELECT * FROM events WHERE id = ?", [$event_id]);

            if (!$event) {
                error_log('[EVENT_CREATE] ERROR: Event not found after insert (ID: ' . $event_id . ')');
                Response::error('Event created but could not be retrieved', null, 500);
            }

            error_log('[EVENT_CREATE] Event verified in database: ' . json_encode(['id' => $event['id'], 'title' => $event['title']]));

            Response::created($event, 'Event created successfully');

        } catch (Exception $e) {
            error_log('[EVENT_CREATE] Exception: ' . $e->getMessage());
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Update event (Admin only)
     * Endpoint: PUT /events/:id
     */
    public function update() {
        try {
            $this->requireRole('admin');

            $event_id = (int)$this->getParam('id');
            if (!$event_id) {
                Response::error('Event ID is required', null, 400);
            }

            // ====================================================================
            // STEP 1: VERIFY EVENT EXISTS
            // ====================================================================
            $event = $this->fetchOne("SELECT id FROM events WHERE id = ?", [$event_id]);
            if (!$event) {
                Response::notFound('Event not found');
            }

            // ====================================================================
            // STEP 2: PREPARE UPDATE DATA
            // ====================================================================
            $data = $this->getAllInput();
            $updates = [];
            $params = [];

            foreach (['title', 'description', 'date', 'time', 'location', 'cast', 'image', 'reg_price', 'vip_price', 'total_tickets', 'sold_tickets', 'status'] as $field) {
                if (isset($data[$field])) {
                    $updates[] = "{$field} = ?";
                    $params[] = $data[$field];
                }
            }

            if (empty($updates)) {
                Response::error('No fields to update', null, 400);
            }

            // ====================================================================
            // STEP 3: EXECUTE UPDATE
            // ====================================================================
            $params[] = $event_id;
            $this->executeQuery("UPDATE events SET " . implode(', ', $updates) . " WHERE id = ?", $params);

            // ====================================================================
            // STEP 4: VERIFY UPDATE EXECUTED
            // ====================================================================
            $affected_rows = $this->rowCount();
            error_log('[EVENT_UPDATE] Affected rows: ' . $affected_rows);

            if ($affected_rows === 0) {
                error_log('[EVENT_UPDATE] ERROR: UPDATE query affected 0 rows for ID: ' . $event_id);
                Response::error('Failed to update event - no changes applied', null, 500);
            }

            // ====================================================================
            // STEP 5: FETCH AND VERIFY UPDATED EVENT
            // ====================================================================
            $updated = $this->fetchOne("SELECT * FROM events WHERE id = ?", [$event_id]);

            if (!$updated) {
                error_log('[EVENT_UPDATE] ERROR: Event not found after update (ID: ' . $event_id . ')');
                Response::error('Event updated but could not be retrieved', null, 500);
            }

            error_log('[EVENT_UPDATE] Event verified: ' . json_encode(['id' => $updated['id'], 'title' => $updated['title']]));

            Response::success($updated, 'Event updated successfully');

        } catch (Exception $e) {
            error_log('[EVENT_UPDATE] Exception: ' . $e->getMessage());
            Response::handleException($e, is_dev());
        }
    }

    /**
     * Delete event (Admin only)
     * Endpoint: DELETE /events/:id
     * 
     * ====================================================================
     * FIXED VERSION: Now verifies rows were actually deleted
     * ====================================================================
     */
    public function delete() {
        try {
            $this->requireRole('admin');

            // ====================================================================
            // STEP 1: EXTRACT AND VALIDATE EVENT ID
            // ====================================================================
            $event_id = (int)$this->getParam('id');

            if (!$event_id || $event_id <= 0) {
                error_log('[EVENT_DELETE] ERROR: Invalid event ID: ' . $event_id);
                Response::error('Event ID is required and must be a positive integer', null, 400);
            }

            error_log('[EVENT_DELETE] Attempting to delete event ID: ' . $event_id);

            // ====================================================================
            // STEP 2: VERIFY EVENT EXISTS BEFORE DELETION
            // ====================================================================
            $event = $this->fetchOne("SELECT id, title FROM events WHERE id = ?", [$event_id]);

            if (!$event) {
                error_log('[EVENT_DELETE] ERROR: Event not found (ID: ' . $event_id . ')');
                Response::notFound('Event not found - cannot delete non-existent event');
            }

            error_log('[EVENT_DELETE] Event found: ' . json_encode($event));

            // ====================================================================
            // STEP 3: EXECUTE DELETE QUERY
            // ====================================================================
            $this->executeQuery("DELETE FROM events WHERE id = ?", [$event_id]);

            // ====================================================================
            // STEP 4: VERIFY ROWS WERE ACTUALLY DELETED (CRITICAL!)
            // ====================================================================
            $affected_rows = $this->rowCount();

            error_log('[EVENT_DELETE] Affected rows: ' . $affected_rows);

            if ($affected_rows === 0) {
                error_log('[EVENT_DELETE] ERROR: DELETE query executed but affected 0 rows');
                error_log('[EVENT_DELETE] This suggests the DELETE query did not execute or failed silently');
                Response::error('Delete query failed - database error occurred', null, 500);
            }

            if ($affected_rows !== 1) {
                error_log('[EVENT_DELETE] WARNING: DELETE affected ' . $affected_rows . ' rows (expected 1)');
                // Still return success but log warning
            }

            // ====================================================================
            // STEP 5: VERIFY EVENT NO LONGER EXISTS
            // ====================================================================
            $verify = $this->fetchOne("SELECT id FROM events WHERE id = ?", [$event_id]);

            if ($verify) {
                error_log('[EVENT_DELETE] CRITICAL ERROR: Event still exists after DELETE (ID: ' . $event_id . ')');
                Response::error('Delete query executed but event still exists in database - potential database error', null, 500);
            }

            error_log('[EVENT_DELETE] ✓ Event successfully deleted (ID: ' . $event_id . ')');

            // ====================================================================
            // STEP 6: RETURN SUCCESS (ONLY IF VERIFICATION PASSED)
            // ====================================================================
            Response::success(null, 'Event deleted successfully');

        } catch (Exception $e) {
            error_log('[EVENT_DELETE] Exception: ' . $e->getMessage());
            error_log('[EVENT_DELETE] Stack trace: ' . $e->getTraceAsString());
            Response::handleException($e, is_dev());
        }
    }
}
