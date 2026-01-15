// backend/getHabits/index.js
// Lambda handler to get all habits for a user from DynamoDB

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

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
    // For authenticated requests, userId comes from Cognito JWT token claims
    const userId = event.queryStringParameters?.userId || 
                   event.pathParameters?.userId || 
                   event.requestContext?.authorizer?.claims?.sub;

    // Validate userId exists
    if (!userId) {
      return createResponse(401, { 
        error: 'Unauthorized', 
        message: 'User ID is required' 
      });
    }

    // Get table name from environment variable
    const tableName = process.env.HABITS_TABLE_NAME;
    if (!tableName) {
      throw new Error('HABITS_TABLE_NAME environment variable not set');
    }

    // Query DynamoDB for all habits belonging to this user
    // Since userId is the partition key, we use QueryCommand (not ScanCommand)
    // QueryCommand is efficient because it only reads items with matching partition key
    const queryCommand = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
      // Note: We could add FilterExpression here to filter by isActive if needed
      // For now, we'll return all habits and let the frontend filter
    });

    const result = await docClient.send(queryCommand);

    // Return the habits array (or empty array if user has no habits)
    return createResponse(200, {
      habits: result.Items || [],
      count: result.Items?.length || 0
    });

  } catch (error) {
    // Error handling - log for debugging and return appropriate response
    console.error('Error in getHabits handler:', error);
    return createResponse(500, {
      error: 'Internal server error',
      message: error.message
    });
  }
};
