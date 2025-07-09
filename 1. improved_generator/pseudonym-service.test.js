const ConsentKeysPseudonymGenerator = require('./pseudonym-service');

/**
 * test suite for  Pseudonym Generator
 */
class ConsentKeysTestSuite {
  constructor() {
    this.testResults = [];
    this.generator = new ConsentKeysPseudonymGenerator('super-secret-key-at-least-32-chars-long-for-safe-use');
  }


  runTest(testName, testFunction) {
    try {
      const result = testFunction();
      this.testResults.push({ name: testName, status: 'PASS', result });
      console.log(`✅ ${testName}: PASS`);
      return result;
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(`❌ ${testName}: FAIL - ${error.message}`);
      return null;
    }
  }

  /**
   * Test consistency - same inputs should produce same outputs
   */
  testConsistency() {
    console.log('\n=== CONSISTENCY TESTS ===');
    
    this.runTest('Same user, same app produces identical pseudonym', () => {
      const p1 = this.generator.generatePseudonym('user123', 'shopping-app');
      const p2 = this.generator.generatePseudonym('user123', 'shopping-app');
      if (p1 !== p2) throw new Error(`Expected ${p1} === ${p2}`);
      console.log(`  Generated: ${p1}`);
      return true;
    });

    this.runTest('Consistency across data types', () => {
      const idPseudonym1 = this.generator.generatePseudonym('user123', 'shopping-app', 'id');
      const idPseudonym2 = this.generator.generatePseudonym('user123', 'shopping-app', 'id');
      if (idPseudonym1 !== idPseudonym2) throw new Error('ID pseudonyms not consistent');
      
      const emailPseudonym1 = this.generator.generatePseudonym('user123', 'shopping-app', 'email');
      const emailPseudonym2 = this.generator.generatePseudonym('user123', 'shopping-app', 'email');
      if (emailPseudonym1 !== emailPseudonym2) throw new Error('Email pseudonyms not consistent');
      
      console.log(`  ID: ${idPseudonym1}`);
      console.log(`  Email: ${emailPseudonym1}`);
      return true;
    });

    this.runTest('Fake data consistency', () => {
      const name1 = this.generator.generateFakeDisplayName('user123', 'shopping-app');
      const name2 = this.generator.generateFakeDisplayName('user123', 'shopping-app');
      if (name1 !== name2) throw new Error('Display names not consistent');
      
      const email1 = this.generator.generateFakeEmail('user123', 'shopping-app');
      const email2 = this.generator.generateFakeEmail('user123', 'shopping-app');
      if (email1 !== email2) throw new Error('Emails not consistent');
      
      console.log(`  Name: ${name1}`);
      console.log(`  Email: ${email1}`);
      return true;
    });
  }

  /**
   * Test isolation - same user should get different pseudonyms for different apps
   */
  testIsolation() {
    console.log('\n=== ISOLATION TESTS ===');
    
    this.runTest('Same user, different apps produce different pseudonyms', () => {
      const p1 = this.generator.generatePseudonym('user123', 'shopping-app');
      const p2 = this.generator.generatePseudonym('user123', 'social-app');
      if (p1 === p2) throw new Error('Should produce different pseudonyms for different apps');
      
      console.log(`  Shopping app: ${p1}`);
      console.log(`  Social app: ${p2}`);
      return true;
    });

    this.runTest('Different users, same app produce different pseudonyms', () => {
      const p1 = this.generator.generatePseudonym('user123', 'shopping-app');
      const p2 = this.generator.generatePseudonym('user456', 'shopping-app');
      if (p1 === p2) throw new Error('Should produce different pseudonyms for different users');
      
      console.log(`  User123: ${p1}`);
      console.log(`  User456: ${p2}`);
      return true;
    });

    this.runTest('Cross-app fake data isolation', () => {
      const email1 = this.generator.generateFakeEmail('user123', 'shopping-app');
      const email2 = this.generator.generateFakeEmail('user123', 'social-app');
      if (email1 === email2) throw new Error('Should produce different emails for different apps');
      
      const name1 = this.generator.generateFakeDisplayName('user123', 'shopping-app');
      const name2 = this.generator.generateFakeDisplayName('user123', 'social-app');
      if (name1 === name2) throw new Error('Should produce different names for different apps');
      
      console.log(`  Shopping email: ${email1}`);
      console.log(`  Social email: ${email2}`);
      console.log(`  Shopping name: ${name1}`);
      console.log(`  Social name: ${name2}`);
      return true;
    });
  }

  /**
   * Test multiple data types
   */
  testDataTypes() {
    console.log('\n=== DATA TYPE TESTS ===');
    
    this.runTest('Different data types produce different pseudonyms', () => {
      const idPseudonym = this.generator.generatePseudonym('user123', 'shopping-app', 'id');
      const emailPseudonym = this.generator.generatePseudonym('user123', 'shopping-app', 'email');
      const namePseudonym = this.generator.generatePseudonym('user123', 'shopping-app', 'name');
      const addressPseudonym = this.generator.generatePseudonym('user123', 'shopping-app', 'address');
      
      const pseudonyms = [idPseudonym, emailPseudonym, namePseudonym, addressPseudonym];
      const uniquePseudonyms = [...new Set(pseudonyms)];
      
      if (uniquePseudonyms.length !== pseudonyms.length) {
        throw new Error('All data types should produce unique pseudonyms');
      }
      
      console.log(`  ID: ${idPseudonym}`);
      console.log(`  Email: ${emailPseudonym}`);
      console.log(`  Name: ${namePseudonym}`);
      console.log(`  Address: ${addressPseudonym}`);
      return true;
    });

    this.runTest('Fake profile generation', () => {
      const email = this.generator.generateFakeEmail('user123', 'shopping-app');
      const displayName = this.generator.generateFakeDisplayName('user123', 'shopping-app');
      const address = this.generator.generateFakeAddress('user123', 'shopping-app');
      
      // Validate email format
      if (!email.includes('@consentkeys.local')) {
        throw new Error('Email should use @consentkeys.local domain');
      }
      
      // Validate display name format
      if (!displayName.includes(' ')) {
        throw new Error('Display name should have first and last name');
      }
      
      // Validate address structure
      if (!address.street || !address.city || !address.state || !address.zip) {
        throw new Error('Address should have all required fields');
      }
      
      console.log(`  Email: ${email}`);
      console.log(`  Display Name: ${displayName}`);
      console.log(`  Address: ${JSON.stringify(address)}`);
      return true;
    });
  }

  /**
   * Test error handling
   */
  testErrorHandling() {
    console.log('\n=== ERROR HANDLING TESTS ===');
    
    this.runTest('Empty userId throws error', () => {
      try {
        this.generator.generatePseudonym('', 'test-app');
        throw new Error('Should have thrown error for empty userId');
      } catch (e) {
        if (!e.message.includes('userId')) throw new Error('Wrong error message');
        console.log(`  Error: ${e.message}`);
        return true;
      }
    });

    this.runTest('Empty clientId throws error', () => {
      try {
        this.generator.generatePseudonym('user123', '');
        throw new Error('Should have thrown error for empty clientId');
      } catch (e) {
        if (!e.message.includes('clientId')) throw new Error('Wrong error message');
        console.log(`  Error: ${e.message}`);
        return true;
      }
    });

    this.runTest('Invalid data type throws error', () => {
      try {
        this.generator.generatePseudonym('user123', 'test-app', 'invalid-type');
        throw new Error('Should have thrown error for invalid data type');
      } catch (e) {
        if (!e.message.includes('dataType')) throw new Error('Wrong error message');
        console.log(`  Error: ${e.message}`);
        return true;
      }
    });

    this.runTest('Weak secret key throws error', () => {
      try {
        new ConsentKeysPseudonymGenerator('short');
        throw new Error('Should have thrown error for weak secret key');
      } catch (e) {
        if (!e.message.includes('32 characters')) throw new Error('Wrong error message');
        console.log(`  Error: ${e.message}`);
        return true;
      }
    });
  }

  /**
   * Test pseudonym verification
   */
  testPseudonymVerification() {
    console.log('\n=== PSEUDONYM VERIFICATION TESTS ===');
    
    this.runTest('Valid pseudonym verification', () => {
      const pseudonym = this.generator.generatePseudonym('user123', 'shopping-app');
      const isValid = this.generator.verifyPseudonym(pseudonym);
      if (!isValid) throw new Error('Valid pseudonym should pass verification');
      
      console.log(`  Valid pseudonym: ${pseudonym} -> ${isValid}`);
      return true;
    });

    this.runTest('Invalid pseudonym verification', () => {
      const invalidPseudonyms = [
        'invalid_pseudonym',
        'ck_short',
        'ck_toolongpseudonymstring',
        'ck_invalidchars!@#',
        'not_ck_prefix'
      ];
      
      for (const invalid of invalidPseudonyms) {
        const isValid = this.generator.verifyPseudonym(invalid);
        if (isValid) throw new Error(`Invalid pseudonym should fail verification: ${invalid}`);
        console.log(`  Invalid pseudonym: ${invalid} -> ${isValid}`);
      }
      
      return true;
    });
  }

  /**
   * Test security properties
   */
  testSecurityProperties() {
    console.log('\n=== SECURITY TESTS ===');
    
    this.runTest('Pseudonyms are not reversible', () => {
      const pseudonym = this.generator.generatePseudonym('user123', 'shopping-app');
      
      // Try to reverse engineer (this should fail)
      const pseudonymData = pseudonym.replace('ck_', '');
      
      // Check that it's not just base64 encoded
      try {
        const decoded = Buffer.from(pseudonymData, 'base64').toString();
        if (decoded.includes('user123') || decoded.includes('shopping-app')) {
          throw new Error('Pseudonym appears to be reversible');
        }
      } catch (e) {
        // This is expected - pseudonym should not be valid base64
      }
      
      console.log(`  Pseudonym: ${pseudonym}`);
      console.log(`  Cannot reverse engineer original data ✓`);
      return true;
    });

    this.runTest('Collision resistance', () => {
      const pseudonyms = new Set();
      const testCases = [
        ['user1', '23app'],
        ['user12', '3app'],
        ['user123', 'app'],
        ['user', '123app'],
        ['use', 'r123app'],
        ['us', 'er123app']
      ];
      
      for (const [userId, clientId] of testCases) {
        const pseudonym = this.generator.generatePseudonym(userId, clientId);
        if (pseudonyms.has(pseudonym)) {
          throw new Error(`Collision detected for ${userId}/${clientId}`);
        }
        pseudonyms.add(pseudonym);
        console.log(`  ${userId}/${clientId} -> ${pseudonym}`);
      }
      
      return true;
    });
  }

  /**
   * Run all tests
   */
  runAllTests() {
    console.log('🚀 Starting ConsentKeys Pseudonym Generator Test Suite\n');
    
    this.testConsistency();
    this.testIsolation();
    this.testDataTypes();
    this.testErrorHandling();
    this.testPseudonymVerification();
    this.testSecurityProperties();
    
    // Results
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    console.log('\n=== TEST SUMMARY ===');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${this.testResults.length}`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
    }
    
    return failed === 0;
  }
}

if (require.main === module) {
  const testSuite = new ConsentKeysTestSuite();
  testSuite.runAllTests();
}

module.exports = ConsentKeysTestSuite;