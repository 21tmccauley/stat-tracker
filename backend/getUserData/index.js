// backend/getUserData/index.js
// Lambda handler to get user data from DynamoDB

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
// AWS_REGION is automatically provided by Lambda runtime
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Helper function to create standardized API Gateway responses
const createResponse = (statusCode, body, headers = {}) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // CORS - restrict in production
      ...headers
    },
    body: JSON.stringify(body)
  };
};

// Main Lambda handler
export const handler = async (event) => {
  try {
    // Extract userId from event (query params, path params, or Cognito authorizer)
    const userId = event.queryStringParameters?.userId || 
                   event.pathParameters?.userId || 
                   event.requestContext?.authorizer?.claims?.sub;

    // Validate userId exists
    if (!userId) {
      return createResponse(400, { 
        error: 'Missing userId', 
        message: 'userId is required as query parameter, path parameter, or from authentication' 
      });
    }

    // Get table name from environment variable
    const tableName = process.env.USERS_TABLE_NAME;
    if (!tableName) {
      throw new Error('USERS_TABLE_NAME environment variable not set');
    }

    // Query DynamoDB for the user
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: { userId }
    });
    const result = await docClient.send(getCommand);

    // If user exists, return their data
    if (result.Item) {
      return createResponse(200, {
        userId: result.Item.userId,
        level: result.Item.level || 1,
        totalXP: result.Item.totalXP || 0,
        stats: result.Item.stats || {},
        createdAt: result.Item.createdAt,
        updatedAt: result.Item.updatedAt
      });
    }

    // User doesn't exist - create a new user with default values
    const newUser = {
      userId,
      level: 1,
      totalXP: 0,
      stats: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save new user to DynamoDB
    const putCommand = new PutCommand({
      TableName: tableName,
      Item: newUser
    });
    await docClient.send(putCommand);

    // Return the newly created user
    return createResponse(201, {
      ...newUser,
      message: 'New user created'
    });

  } catch (error) {
    // Error handling - log for debugging and return appropriate response
    console.error('Error in getUserData handler:', error);
    return createResponse(500, {
      error: 'Internal server error',
      message: error.message
    });
  }
};