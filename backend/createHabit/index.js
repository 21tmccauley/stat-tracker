// backend/createHabit/index.js
// Lambda handler to create a new habit in DynamoDB

// IMPORTS
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);


// HELPER FUNCTION
const createResponse = (statusCode, body, headers = {}) => {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            ...headers
        },
        body: JSON.stringify(body)
        }
    }

// MAIN HANDLER
export const handler = async (event) => {
    try {
      // STEP 1: Extract userId from Cognito authorizer
        const userId = event.queryStringParameters?.userId || 
                   event.pathParameters?.userId || 
                   event.requestContext?.authorizer?.claims?.sub;
        if (!userId) {
            return createResponse(401, {
                error: 'Unauthorized',
                message: 'User ID is required'
            });
        }
      
      // STEP 2: Parse request body
      // - event.body is a STRING (API Gateway passes it as string)
      // - Use JSON.parse(event.body)
      // - Wrap in try/catch - if parse fails, return 400 Bad Request
      if (!event.body) {
        return createResponse(400, {
            error: 'Missing request body',
            message: 'Request body is required'
        });
      }

      let body;
      try { body = JSON.parse(event.body); }
      catch (error) {
        return createResponse(400, {
            error: 'Invalid request body',
            message: 'Request body must be valid JSON'
        });
      }

      // STEP 3: Input validation
      // - Validate 'name': required, must be string, must not be empty after trim()
      // - Validate 'xpReward': optional, if provided must be number between 1-100, default to 10
      // - Validate 'description': optional string, default to empty string
      // - Validate 'isActive': optional boolean, default to true
      // - Return 400 with error message if validation fails
      if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
        return createResponse(400, {
            error: 'Invalid habit name',
            message: 'Habit name is required and must be a non-empty string'
        });
      }

      // Only validate xpReward if it's provided
      if (body.xpReward !== undefined) {
        if (typeof body.xpReward !== 'number' || body.xpReward < 1 || body.xpReward > 100) {
          return createResponse(400, {
              error: 'Invalid XP reward',
              message: 'XP reward must be a number between 1 and 100'
          });
        }
      }

      // Only validate description if it's provided (it's optional)
      if (body.description !== undefined && typeof body.description !== 'string') {
        return createResponse(400, {
            error: 'Invalid habit description',
            message: 'Habit description must be a string'
        });
      }

      // Only validate isActive if it's provided (it's optional)
      if (body.isActive !== undefined && typeof body.isActive !== 'boolean') {
        return createResponse(400, {
            error: 'Invalid habit status',
            message: 'Habit status must be a boolean'
        });
      }
      
      
      // STEP 4: Generate unique habit ID
      const habitId = randomUUID();
      
      // STEP 5: Create habit object

      const habit = {
        userId,
        habitId,
        name: body.name.trim(),
        description: body.description?.trim() ?? '',
        xpReward: body.xpReward ?? 10,
        isActive: body.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      // STEP 6: Write to DynamoDB
      // - Get HABITS_TABLE_NAME from process.env
      // - Use PutCommand with:
      //   - TableName: HABITS_TABLE_NAME
      //   - Item: habit object
      // - Remember: Habits table has composite key (userId = partition key, habitId = sort key)
      const tableName = process.env.HABITS_TABLE_NAME;
      if (!tableName) {
        throw new Error('HABITS_TABLE_NAME environment variable not set');
      }
      const putCommand = new PutCommand({
        TableName: tableName,
        Item: habit
      });
      await docClient.send(putCommand);

      return createResponse(201, {
        message: 'Habit created successfully',
        habit: habit
      });
      

      
    } catch (error) {
      console.error('Error in createHabit handler:', error);
      return createResponse(500, {
        error: 'Internal server error',
        message: error.message
      });
    }
  };