// backend/deleteHabit/index.js
// Lambda handler to delete a habit from DynamoDB

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
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
    // Extract userId from Cognito authorizer
    const userId = event.queryStringParameters?.userId || 
                   event.pathParameters?.userId || 
                   event.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
      return createResponse(401, {
        error: 'Unauthorized',
        message: 'User ID is required'
      });
    }

    // Extract habitId from path parameters
    // For DELETE /habits/{habitId}, the habitId will be in pathParameters
    const habitId = event.pathParameters?.habitId;

    if (!habitId || typeof habitId !== 'string' || habitId.trim() === '') {
      return createResponse(400, {
        error: 'Invalid habitId',
        message: 'habitId is required in the URL path'
      });
    }

    // Get table name from environment variable
    const tableName = process.env.HABITS_TABLE_NAME;
    if (!tableName) {
      throw new Error('HABITS_TABLE_NAME environment variable not set');
    }

    // First, verify the habit exists and belongs to the user
    // This prevents users from deleting other users' habits
    const getCommand = new GetCommand({
      TableName: tableName,
      Key: {
        userId: userId,
        habitId: habitId.trim()
      }
    });

    const existingHabit = await docClient.send(getCommand);

    if (!existingHabit.Item) {
      return createResponse(404, {
        error: 'Habit not found',
        message: 'The habit does not exist or you do not have permission to delete it'
      });
    }

    // Delete the habit from DynamoDB
    const deleteCommand = new DeleteCommand({
      TableName: tableName,
      Key: {
        userId: userId,
        habitId: habitId.trim()
      }
    });

    await docClient.send(deleteCommand);

    return createResponse(200, {
      message: 'Habit deleted successfully',
      habitId: habitId
    });

  } catch (error) {
    // Error handling - log for debugging and return appropriate response
    console.error('Error in deleteHabit handler:', error);
    return createResponse(500, {
      error: 'Internal server error',
      message: error.message
    });
  }
};
