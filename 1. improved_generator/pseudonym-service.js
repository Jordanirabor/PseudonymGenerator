const crypto = require('crypto');

/**
 * cryptographically secure pseudonym generator that creates consistent,
 * irreversible pseudonyms for users across different applications while
 * maintaining privacy and preventing data correlation attacks.
 */

class ConsentKeysPseudonymGenerator {
  constructor(secretKey) {
    this.validateSecretKey(secretKey);
    this.secretKey = secretKey;
    this.pseudonymPrefix = 'ck_';
    
    this.firstNames = [
      'Alex', 'Taylor', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
      'Cameron', 'Emery', 'Sage', 'River', 'Rowan', 'Skylar', 'Dakota', 'Phoenix'
    ];
    
    this.lastNames = [
      'Johnson', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
      'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia'
    ];
    
    this.streets = [
      'Oak Ave', 'Main St', 'First Ave', 'Second St', 'Park Rd', 'Hill St', 'Lake Dr',
      'River Rd', 'Pine St', 'Elm Ave', 'Maple St', 'Cedar Ave', 'Birch Dr', 'Ash St'
    ];
    
    this.cities = [
      'Springfield', 'Franklin', 'Georgetown', 'Clinton', 'Greenville', 'Madison',
      'Oakland', 'Salem', 'Fairview', 'Riverside', 'Arlington', 'Ashland', 'Burlington'
    ];
    
    this.states = [
      'NY', 'CA', 'TX', 'FL', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI', 'NJ', 'VA', 'WA'
    ];
  }

  /**
   * Validates the secret key meets security requirements
   */
  validateSecretKey(secretKey) {
    if (!secretKey || typeof secretKey !== 'string') {
      throw new Error('Secret key must be a non-empty string');
    }
    
    if (secretKey.length < 32) {
      throw new Error('Secret key must be at least 32 characters for security');
    }
  }

  /**
   * Validates input parameters for public methods
   */
  validateInputs(userId, clientId, dataType = 'id') {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('userId must be a non-empty string');
    }
    
    if (!clientId || typeof clientId !== 'string' || clientId.trim().length === 0) {
      throw new Error('clientId must be a non-empty string');
    }
    
    const validDataTypes = ['id', 'email', 'name', 'address'];
    if (!validDataTypes.includes(dataType)) {
      throw new Error(`dataType must be one of: ${validDataTypes.join(', ')}`);
    }
  }

  /**
   * Internal method to generate pseudonyms without strict validation
   * Used by fake data generation methods that need custom data types
   */
  _generatePseudonymInternal(userId, clientId, dataType = 'id') {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new Error('userId must be a non-empty string');
    }
    
    if (!clientId || typeof clientId !== 'string' || clientId.trim().length === 0) {
      throw new Error('clientId must be a non-empty string');
    }
    
    try {
      // Create a unique input string with clear separators to prevent collisions
      const inputString = `${userId}::${clientId}::${dataType}`;
      
      // Use HMAC-SHA256 for cryptographic security
      const hmac = crypto.createHmac('sha256', this.secretKey);
      hmac.update(inputString);
      const hash = hmac.digest('hex');
      
      // Take first 16 characters for reasonable length while maintaining security
      const pseudonym = hash.substring(0, 16);
      
      return `${this.pseudonymPrefix}${pseudonym}`;
      
    } catch (error) {
      throw new Error(`Failed to generate pseudonym: ${error.message}`);
    }
  }

  /**
   * Generates a cryptographically secure pseudonym
   * 
   * @param {string} userId - User identifier
   * @param {string} clientId - Client/app identifier  
   * @param {string} dataType - Type of data being pseudonymized
   * @returns {string} Secure pseudonym with ck_ prefix
   */
  generatePseudonym(userId, clientId, dataType = 'id') {
    this.validateInputs(userId, clientId, dataType);
    return this._generatePseudonymInternal(userId, clientId, dataType);
  }

  /**
   * Generates a deterministic integer from hash for consistent fake data selection
   */
  generateDeterministicIndex(userId, clientId, dataType, maxValue) {
    const hash = this._generatePseudonymInternal(userId, clientId, dataType);
    const numericHash = parseInt(hash.replace(this.pseudonymPrefix, ''), 16);
    return numericHash % maxValue;
  }


  generateFakeEmail(userId, clientId) {
    const emailPseudonym = this._generatePseudonymInternal(userId, clientId, 'fake_email');
    return `${emailPseudonym}@consentkeys.local`;
  }


  generateFakeDisplayName(userId, clientId) {
    // Generate a single hash and derive multiple indices from it to avoid collisions
    const baseHash = this._generatePseudonymInternal(userId, clientId, 'fake_display_name');
    const hashWithoutPrefix = baseHash.replace(this.pseudonymPrefix, '');
    
    // Use different parts of the hash for first and last name to avoid collisions
    const firstNameHash = hashWithoutPrefix.substring(0, 8);
    const lastNameHash = hashWithoutPrefix.substring(8, 16);
    
    const firstIndex = parseInt(firstNameHash, 16) % this.firstNames.length;
    const lastIndex = parseInt(lastNameHash, 16) % this.lastNames.length;
    
    return `${this.firstNames[firstIndex]} ${this.lastNames[lastIndex]}`;
  }


  generateFakeAddress(userId, clientId) {
    // Generate a single hash and derive multiple indices from it to avoid collisions
    const baseHash = this._generatePseudonymInternal(userId, clientId, 'fake_address');
    const hashWithoutPrefix = baseHash.replace(this.pseudonymPrefix, '');
    
    // Use different parts of the hash for each address component
    const streetNumHash = hashWithoutPrefix.substring(0, 3);
    const streetHash = hashWithoutPrefix.substring(3, 6);
    const cityHash = hashWithoutPrefix.substring(6, 9);
    const stateHash = hashWithoutPrefix.substring(9, 12);
    const zipHash = hashWithoutPrefix.substring(12, 16);
    
    const streetNumIndex = parseInt(streetNumHash, 16) % 999;
    const streetIndex = parseInt(streetHash, 16) % this.streets.length;
    const cityIndex = parseInt(cityHash, 16) % this.cities.length;
    const stateIndex = parseInt(stateHash, 16) % this.states.length;
    const zipIndex = parseInt(zipHash, 16) % 99999;
    
    return {
      street: `${streetNumIndex + 1} ${this.streets[streetIndex]}`,
      city: this.cities[cityIndex],
      state: this.states[stateIndex],
      zip: String(zipIndex + 10000).padStart(5, '0')
    };
  }

  /**
   * Verifies if a string is a valid ConsentKeys pseudonym
   */
  verifyPseudonym(pseudonym) {
    if (!pseudonym || typeof pseudonym !== 'string') {
      return false;
    }
    
    // Check format: ck_ + 16 hex characters
    const regex = /^ck_[a-f0-9]{16}$/;
    return regex.test(pseudonym);
  }

  /**
   * Utility method to check if two pseudonyms were generated from the same inputs
   * This is useful for debugging but should not be used in production for security reasons
   */
  comparePseudonyms(pseudonym1, pseudonym2) {
    return pseudonym1 === pseudonym2;
  }
}

module.exports = ConsentKeysPseudonymGenerator;

// only run if this file is executed directly
if (require.main === module) {
  const generator = new ConsentKeysPseudonymGenerator('super-secret-key-at-least-32-chars-long-for-safe-use');
  
  console.log('=== Consistency Tests ===');
  console.log('User123 + shopping-app:', generator.generatePseudonym('user123', 'shopping-app'));
  console.log('User123 + shopping-app (again):', generator.generatePseudonym('user123', 'shopping-app'));
  console.log('Same user, different app:', generator.generatePseudonym('user123', 'social-app'));
  
  console.log('\n=== App Isolation Tests ===');
  console.log('User456 + shopping-app:', generator.generatePseudonym('user456', 'shopping-app'));
  console.log('User456 + social-app:', generator.generatePseudonym('user456', 'social-app'));
  
  console.log('\n=== Data Type Variations ===');
  console.log('ID pseudonym:', generator.generatePseudonym('user123', 'shopping-app', 'id'));
  console.log('Email pseudonym:', generator.generatePseudonym('user123', 'shopping-app', 'email'));
  console.log('Name pseudonym:', generator.generatePseudonym('user123', 'shopping-app', 'name'));
  
  console.log('\n=== Fake Profile Generation ===');
  console.log('Email:', generator.generateFakeEmail('user123', 'shopping-app'));
  console.log('Display Name:', generator.generateFakeDisplayName('user123', 'shopping-app'));
  console.log('Address:', generator.generateFakeAddress('user123', 'shopping-app'));
  
  console.log('\n=== Cross-App Profile Consistency ===');
  console.log('Same user, different apps should get different fake data:');
  console.log('Shopping app email:', generator.generateFakeEmail('user123', 'shopping-app'));
  console.log('Social app email:', generator.generateFakeEmail('user123', 'social-app'));
  
  console.log('\n=== Edge Cases & Error Handling ===');
  try {
    generator.generatePseudonym('', 'test');
  } catch (e) {
    console.log('Empty userId error:', e.message);
  }
  
  try {
    generator.generatePseudonym('user123', '');
  } catch (e) {
    console.log('Empty clientId error:', e.message);
  }
  
  try {
    new ConsentKeysPseudonymGenerator('short');
  } catch (e) {
    console.log('Weak secret key error:', e.message);
  }
  
  console.log('\n=== Pseudonym Verification ===');
  const testPseudonym = generator.generatePseudonym('user123', 'shopping-app');
  console.log('Valid pseudonym check:', generator.verifyPseudonym(testPseudonym));
  console.log('Invalid pseudonym check:', generator.verifyPseudonym('invalid_pseudonym'));
  
  console.log('\n=== Security Demonstration ===');
  console.log('Pseudonyms are NOT reversible (unlike the original base64 approach):');
  const pseudonym = generator.generatePseudonym('user123', 'shopping-app');
  console.log('Generated pseudonym:', pseudonym);
  console.log('Cannot reverse engineer userId or clientId from this hash!');
}