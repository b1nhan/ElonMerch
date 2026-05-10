/**
 * Verification Utilities for CRUD Operations
 * 
 * These utilities help verify that the backend actually updated the database
 * and that the API response is valid and complete.
 * 
 * Place this in: src/utils/verificationUtils.js
 */

import { apiGet } from './api';

/**
 * Verify that API response contains valid data
 * @param {Object} response - API response object
 * @param {string} operation - 'create', 'update', or 'delete'
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const verifyApiResponse = (response, operation = 'create') => {
  const errors = [];

  if (!response) {
    errors.push('Response is null or undefined');
    return { isValid: false, errors };
  }

  // Check status
  if (response.status !== 'success') {
    errors.push(`Response status is "${response.status}", expected "success"`);
  }

  // For create/update, verify data is returned
  if (operation === 'create' || operation === 'update') {
    if (!response.data) {
      errors.push('Response data is missing');
    } else if (!response.data.id) {
      errors.push('Response data has no id field');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Verify that an event actually exists in the database
 * @param {number} eventId - Event ID to verify
 * @returns {Promise<Object>} { exists: boolean, event: Object|null, error: string|null }
 */
export const verifyEventExists = async (eventId) => {
  try {
    const response = await apiGet(`/events/${eventId}`);
    
    if (response && response.data && response.data.id === eventId) {
      return {
        exists: true,
        event: response.data,
        error: null,
      };
    } else {
      return {
        exists: false,
        event: null,
        error: 'Event not found in database',
      };
    }
  } catch (err) {
    return {
      exists: false,
      event: null,
      error: err.message,
    };
  }
};

/**
 * Verify that event data matches what was submitted
 * @param {Object} submitted - Data that was submitted
 * @param {Object} returned - Data returned from API
 * @returns {Object} { matches: boolean, differences: Object[] }
 */
export const verifyDataMatch = (submitted, returned) => {
  const differences = [];

  // Fields to verify
  const fieldsToCheck = [
    'title',
    'date',
    'time',
    'location',
    'cast',
    'reg_price',
    'vip_price',
    'total_tickets',
    'status',
  ];

  for (const field of fieldsToCheck) {
    const submittedValue = submitted[field];
    const returnedValue = returned[field];

    // Skip if field wasn't submitted
    if (submittedValue === undefined || submittedValue === '') continue;

    // Convert to string for comparison
    const submittedStr = String(submittedValue).trim();
    const returnedStr = String(returnedValue).trim();

    if (submittedStr !== returnedStr) {
      differences.push({
        field,
        submitted: submittedValue,
        returned: returnedValue,
      });
    }
  }

  return {
    matches: differences.length === 0,
    differences,
  };
};

/**
 * Verify database change by comparing event count
 * @param {number} beforeCount - Event count before operation
 * @param {number} afterCount - Event count after operation
 * @param {string} operation - 'create', 'update', or 'delete'
 * @returns {Object} { success: boolean, message: string }
 */
export const verifyCountChange = (beforeCount, afterCount, operation) => {
  let expectedDifference;

  switch (operation) {
    case 'create':
      expectedDifference = 1;
      break;
    case 'delete':
      expectedDifference = -1;
      break;
    case 'update':
      expectedDifference = 0;
      break;
    default:
      return {
        success: false,
        message: 'Unknown operation',
      };
  }

  const actualDifference = afterCount - beforeCount;

  if (actualDifference === expectedDifference) {
    return {
      success: true,
      message: `Database verified: ${operation} operation successful`,
    };
  } else {
    return {
      success: false,
      message: `Database mismatch: expected ${expectedDifference} difference, got ${actualDifference}`,
    };
  }
};

/**
 * Complete verification flow for a CRUD operation
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Complete verification result
 */
export const verifyCrudOperation = async (options) => {
  const {
    operation = 'create', // 'create', 'update', 'delete'
    apiResponse,
    submittedData = null,
    eventId = null,
    allEvents = null, // Array of events before operation
    fetchAllEvents = null, // Function to fetch events
  } = options;

  const result = {
    operation,
    timestamp: new Date().toISOString(),
    checks: {},
    warnings: [],
    errors: [],
    summary: 'Verification pending...',
  };

  try {
    // Check 1: Verify API response is valid
    const responseCheck = verifyApiResponse(apiResponse, operation);
    result.checks.apiResponse = responseCheck;

    if (!responseCheck.isValid) {
      result.errors.push('API response validation failed');
      responseCheck.errors.forEach(e => result.errors.push(`  - ${e}`));
    }

    // Check 2: Verify event exists in database
    if (eventId && (operation === 'create' || operation === 'update')) {
      const existsCheck = await verifyEventExists(eventId);
      result.checks.databaseExists = existsCheck;

      if (!existsCheck.exists) {
        result.errors.push(`Event ID ${eventId} not found in database`);
      }
    }

    // Check 3: Verify data matches
    if (submittedData && apiResponse?.data && operation !== 'delete') {
      const matchCheck = verifyDataMatch(submittedData, apiResponse.data);
      result.checks.dataMatch = matchCheck;

      if (!matchCheck.matches) {
        result.warnings.push('Some fields do not match submitted data');
        matchCheck.differences.forEach(diff => {
          result.warnings.push(
            `  - ${diff.field}: submitted "${diff.submitted}", got "${diff.returned}"`
          );
        });
      }
    }

    // Check 4: Verify database count change
    if (allEvents && fetchAllEvents) {
      try {
        const newEvents = await fetchAllEvents();
        const beforeCount = allEvents.length;
        const afterCount = newEvents.length;

        const countCheck = verifyCountChange(beforeCount, afterCount, operation);
        result.checks.databaseCount = countCheck;

        if (!countCheck.success) {
          result.warnings.push(countCheck.message);
        }
      } catch (err) {
        result.warnings.push(`Could not verify event count: ${err.message}`);
      }
    }

    // Summary
    if (result.errors.length === 0 && result.warnings.length === 0) {
      result.summary = `✅ ${operation} verified successfully`;
    } else if (result.errors.length === 0) {
      result.summary = `⚠️  ${operation} completed with warnings`;
    } else {
      result.summary = `❌ ${operation} verification failed`;
    }

  } catch (err) {
    result.errors.push(`Verification error: ${err.message}`);
    result.summary = `❌ Verification error: ${err.message}`;
  }

  return result;
};

/**
 * Log verification result
 * @param {Object} verificationResult - Result from verifyCrudOperation
 */
export const logVerificationResult = (verificationResult) => {
  console.group(`🔍 Verification: ${verificationResult.operation}`);
  console.log('Summary:', verificationResult.summary);
  console.log('Timestamp:', verificationResult.timestamp);

  if (Object.keys(verificationResult.checks).length > 0) {
    console.group('Checks');
    for (const [checkName, checkResult] of Object.entries(verificationResult.checks)) {
      if (checkResult.isValid !== undefined) {
        console.log(`  ${checkName}:`, checkResult.isValid ? '✅' : '❌', checkResult);
      } else if (checkResult.exists !== undefined) {
        console.log(`  ${checkName}:`, checkResult.exists ? '✅' : '❌', checkResult);
      } else if (checkResult.matches !== undefined) {
        console.log(`  ${checkName}:`, checkResult.matches ? '✅' : '❌', checkResult);
      } else if (checkResult.success !== undefined) {
        console.log(`  ${checkName}:`, checkResult.success ? '✅' : '❌', checkResult.message);
      } else {
        console.log(`  ${checkName}:`, checkResult);
      }
    }
    console.groupEnd();
  }

  if (verificationResult.warnings.length > 0) {
    console.group('⚠️  Warnings');
    verificationResult.warnings.forEach(w => console.warn(w));
    console.groupEnd();
  }

  if (verificationResult.errors.length > 0) {
    console.group('❌ Errors');
    verificationResult.errors.forEach(e => console.error(e));
    console.groupEnd();
  }

  console.groupEnd();
};

/**
 * Export all utilities
 */
export default {
  verifyApiResponse,
  verifyEventExists,
  verifyDataMatch,
  verifyCountChange,
  verifyCrudOperation,
  logVerificationResult,
};
