#!/usr/bin/env node
// scripts/test-api.js
// Helper script to test API endpoints with Cognito authentication

import { CognitoIdentityProviderClient, InitiateAuthCommand, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { execSync } from 'child_process';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Get Terraform outputs
function getTerraformOutput(outputName) {
  try {
    const result = execSync(`cd infrastructure && terraform output -raw ${outputName}`, { encoding: 'utf-8' });
    return result.trim();
  } catch (error) {
    console.error(`${colors.red}Error getting Terraform output: ${outputName}${colors.reset}`);
    console.error('Make sure you\'ve run terraform apply and are in the project root');
    process.exit(1);
  }
}

// Get configuration from Terraform outputs
const config = {
  apiGatewayUrl: getTerraformOutput('api_gateway_url'),
  cognitoUserPoolId: getTerraformOutput('cognito_user_pool_id'),
  cognitoClientId: getTerraformOutput('cognito_client_id'),
  region: getTerraformOutput('aws_region')
};

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({ region: config.region });

// Create or get test user
async function ensureTestUser(username, password) {
  console.log(`${colors.cyan}Setting up test user: ${username}${colors.reset}`);
  
  try {
    // Try to create user
    // Username must be an email since Cognito is configured with username_attributes = ["email"]
    await cognitoClient.send(new AdminCreateUserCommand({
      UserPoolId: config.cognitoUserPoolId,
      Username: username, // username is already an email
      UserAttributes: [
        { Name: 'email', Value: username } // Use the email as the email attribute
      ],
      TemporaryPassword: password,
      MessageAction: 'SUPPRESS'
    }));
    
    // Set permanent password
    await cognitoClient.send(new AdminSetUserPasswordCommand({
      UserPoolId: config.cognitoUserPoolId,
      Username: username,
      Password: password,
      Permanent: true
    }));
    
    console.log(`${colors.green}✓ Test user created${colors.reset}`);
  } catch (error) {
    if (error.name === 'UsernameExistsException') {
      console.log(`${colors.yellow}User already exists, setting password...${colors.reset}`);
      try {
        await cognitoClient.send(new AdminSetUserPasswordCommand({
          UserPoolId: config.cognitoUserPoolId,
          Username: username,
          Password: password,
          Permanent: true
        }));
        console.log(`${colors.green}✓ Password updated${colors.reset}`);
      } catch (setPasswordError) {
        console.log(`${colors.yellow}Note: ${setPasswordError.message}${colors.reset}`);
      }
    } else {
      throw error;
    }
  }
}

// Get authentication token
async function getAuthToken(username, password) {
  console.log(`${colors.cyan}Authenticating...${colors.reset}`);
  
  try {
    const response = await cognitoClient.send(new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: config.cognitoClientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    }));
    
    if (response.AuthenticationResult?.IdToken) {
      console.log(`${colors.green}✓ Authentication successful${colors.reset}`);
      return response.AuthenticationResult.IdToken;
    } else {
      throw new Error('No token received');
    }
  } catch (error) {
    console.error(`${colors.red}Authentication failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Make API request
async function makeApiRequest(method, endpoint, token, body = null) {
  const url = `${config.apiGatewayUrl}${endpoint}`;
  
  console.log(`${colors.cyan}Making ${method} request to: ${url}${colors.reset}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const responseBody = await response.text();
    
    let parsedBody;
    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      parsedBody = responseBody;
    }
    
    return {
      status: response.status,
      statusText: response.statusText,
      body: parsedBody
    };
  } catch (error) {
    console.error(`${colors.red}Request failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  // Default test user credentials
  // Note: Cognito is configured to use email as username
  const testUsername = 'testuser@test.com';
  const testPassword = 'TestPassword123!';
  
  console.log(`${colors.blue}=== API Test Helper ===${colors.reset}\n`);
  
  // Ensure test user exists
  await ensureTestUser(testUsername, testPassword);
  
  // Get authentication token
  const token = await getAuthToken(testUsername, testPassword);
  
  console.log(); // Blank line
  
  // Handle different commands
  if (command === 'create-habit') {
    // Parse habit data from args or use defaults
    const habitName = args[1] || 'Exercise daily';
    const xpReward = args[2] ? parseInt(args[2]) : 15;
    const description = args[3] || '30 minutes of exercise';
    
    const habitData = {
      name: habitName,
      xpReward: xpReward,
      description: description
    };
    
    console.log(`${colors.cyan}Creating habit: ${JSON.stringify(habitData, null, 2)}${colors.reset}`);
    
    const result = await makeApiRequest('POST', '/habits', token, habitData);
    
    console.log(`\n${colors.blue}Response:${colors.reset}`);
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log(`Body: ${JSON.stringify(result.body, null, 2)}`);
    
    if (result.status === 201) {
      console.log(`\n${colors.green}✓ Habit created successfully!${colors.reset}`);
    } else {
      console.log(`\n${colors.red}✗ Request failed${colors.reset}`);
    }
    
  } else if (command === 'get-user-data') {
    const result = await makeApiRequest('GET', '/user-data', token);
    
    console.log(`\n${colors.blue}Response:${colors.reset}`);
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log(`Body: ${JSON.stringify(result.body, null, 2)}`);
    
  } else {
    console.log(`${colors.yellow}Usage:${colors.reset}`);
    console.log(`  node scripts/test-api.js create-habit [name] [xpReward] [description]`);
    console.log(`  node scripts/test-api.js get-user-data`);
    console.log(`\n${colors.cyan}Examples:${colors.reset}`);
    console.log(`  node scripts/test-api.js create-habit`);
    console.log(`  node scripts/test-api.js create-habit "Read 30 minutes" 20 "Read for 30 minutes daily"`);
    console.log(`  node scripts/test-api.js get-user-data`);
  }
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});

