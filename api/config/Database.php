<?php
/**
 * Database Connection Class - PDO Wrapper
 * Handles all database operations with error handling
 * 
 * Usage:
 *   $db = Database::getInstance();
 *   $result = $db->query("SELECT * FROM users WHERE id = ?", [1]);
 *   $user = $db->fetch($result);
 */

class Database {
    private static $instance = null;
    private $connection;
    private $statement;
    private $last_error;

    /**
     * Singleton pattern - get or create database instance
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor - Initialize PDO connection
     */
    private function __construct() {
        try {
            $host = DB_HOST;
            $port = DB_PORT;
            $database = DB_NAME;
            $user = DB_USER;
            $password = DB_PASSWORD;

            // Create DSN (Data Source Name)
            $dsn = "mysql:host={$host};port={$port};dbname={$database};charset=utf8mb4";

            // PDO options for security and performance
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
            ];

            // Create PDO connection
            $this->connection = new PDO($dsn, $user, $password, $options);
            $this->connection->exec("set names utf8mb4");

            // Set timezone
            $this->connection->exec("SET time_zone = '+00:00'");

        } catch (PDOException $e) {
            $this->handleError($e);
            throw $e;
        }
    }

    /**
     * Execute a query with parameters
     * 
     * @param string $sql SQL query with ? placeholders
     * @param array $params Parameters to bind
     * @return bool True if successful
     */
    public function query($sql, $params = []) {
        try {
            $this->statement = $this->connection->prepare($sql);
            return $this->statement->execute($params);
        } catch (PDOException $e) {
            $this->handleError($e);
            throw $e;
        }
    }

    /**
     * Fetch single row as associative array
     * 
     * @param bool $execute If true, executes the last statement again
     * @return array|null Single row or null if not found
     */
    public function fetch($execute = false) {
        if ($execute && $this->statement) {
            $this->statement->execute();
        }
        return $this->statement ? $this->statement->fetch(PDO::FETCH_ASSOC) : null;
    }

    /**
     * Fetch all rows as associative array
     * 
     * @param bool $execute If true, executes the last statement again
     * @return array Array of rows
     */
    public function fetchAll($execute = false) {
        if ($execute && $this->statement) {
            $this->statement->execute();
        }
        return $this->statement ? $this->statement->fetchAll(PDO::FETCH_ASSOC) : [];
    }

    /**
     * Get last inserted ID
     * 
     * @return string Last insert ID
     */
    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }

    /**
     * Get row count from last execute
     * 
     * @return int Number of affected rows
     */
    public function rowCount() {
        return $this->statement ? $this->statement->rowCount() : 0;
    }

    /**
     * Begin transaction
     */
    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit() {
        return $this->connection->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback() {
        return $this->connection->rollback();
    }

    /**
     * Get last error
     * 
     * @return array Error info
     */
    public function getLastError() {
        return $this->last_error;
    }

    /**
     * Handle database errors with logging
     * 
     * @param Exception $e The exception
     */
    private function handleError($e) {
        $this->last_error = [
            'code' => $e->getCode(),
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ];

        // Log to error log
        if (is_dev()) {
            error_log("Database Error: " . $e->getMessage());
        }
    }

    /**
     * Close connection (called on script end)
     */
    public function closeConnection() {
        $this->connection = null;
        $this->statement = null;
    }

    /**
     * Prevent cloning
     */
    private function __clone() {}

    /**
     * Prevent unserializing
     */
    public function __wakeup() {}
}

// Prevent direct instantiation outside the class
register_shutdown_function(function() {
    if ($db = Database::getInstance()) {
        $db->closeConnection();
    }
});
