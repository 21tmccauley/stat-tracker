// backend/completeHabit/index.js
// Lambda handler to complete a habit, award XP, and check for level-up

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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

// Calculate level from total XP
// Formula: level = Math.floor(totalXP / 100) + 1
// 0-99 XP = level 1, 100-199 XP = level 2, 200-299 XP = level 3, etc.
const getLevelFromXP = (totalXP) => {
  return Math.floor(totalXP / 100) + 1;
};

// Main Lambda handler
export const handler = async (event) => {
  try {
    // STEP 1: Extract userId from Cognito authorizer (same pattern as other Lambdas)
    const userId = event.queryStringParameters?.userId || 
                   event.pathParameters?.userId || 
                   event.requestContext?.authorizer?.claims?.sub;

    if (!userId) {
      return createResponse(401, {
        error: 'Unauthorized',
        message: 'User ID is required'
      });
    }

    // STEP 2: Parse request body and extract habitId
    if (!event.body) {
      return createResponse(400, {
        error: 'Missing request body',
        message: 'Request body with habitId is required'
      });
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return createResponse(400, {
        error: 'Invalid request body',
        message: 'Request body must be valid JSON'
      });
    }

    const { habitId } = body;
    if (!habitId || typeof habitId !== 'string' || habitId.trim() === '') {
      return createResponse(400, {
        error: 'Invalid habitId',
        message: 'habitId is required and must be a non-empty string'
      });
    }

    // Get table names from environment variables
    const habitsTableName = process.env.HABITS_TABLE_NAME;
    const completionsTableName = process.env.COMPLETIONS_TABLE_NAME;
    const usersTableName = process.env.USERS_TABLE_NAME;

    if (!habitsTableName || !completionsTableName || !usersTableName) {
      throw new Error('Required environment variables not set');
    }

    // STEP 3: Verify habit exists and belongs to user
    const getHabitCommand = new GetCommand({
      TableName: habitsTableName,
      Key: { userId, habitId }
    });
    const habitResult = await docClient.send(getHabitCommand);

    if (!habitResult.Item) {
      return createResponse(404, {
        error: 'Habit not found',
        message: 'The specified habit does not exist or does not belong to you'
      });
    }

    const habit = habitResult.Item;

    // Check if habit is active
    if (habit.isActive === false) {
      return createResponse(400, {
        error: 'Habit inactive',
        message: 'Cannot complete an inactive habit'
      });
    }

    // STEP 4: Check if already completed today
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const completionKey = `${today}#${habitId}`;

    const getCompletionCommand = new GetCommand({
      TableName: completionsTableName,
      Key: { 
        userId, 
        'completionDate#habitId': completionKey 
      }
    });
    const completionResult = await docClient.send(getCompletionCommand);

    if (completionResult.Item) {
      return createResponse(400, {
        error: 'Already completed',
        message: 'You have already completed this habit today',
        completedAt: completionResult.Item.completedAt
      });
    }

    // STEP 5: Get current user data
    const getUserCommand = new GetCommand({
      TableName: usersTableName,
      Key: { userId }
    });
    const userResult = await docClient.send(getUserCommand);

    // Default user values if user doesn't exist
    const currentUser = userResult.Item || {
      userId,
      level: 1,
      totalXP: 0,
      stats: {}
    };

    const currentLevel = currentUser.level || 1;
    const currentXP = currentUser.totalXP || 0;

    // STEP 6: Calculate new XP and level
    const xpReward = habit.xpReward || 10;
    const newXP = currentXP + xpReward;
    const newLevel = getLevelFromXP(newXP);
    const leveledUp = newLevel > currentLevel;

    // STEP 7: Record completion
    const completedAt = new Date().toISOString();
    const completion = {
      userId,
      'completionDate#habitId': completionKey,
      habitId,
      habitName: habit.name,
      completedAt,
      xpEarned: xpReward,
      date: today
    };

    const putCompletionCommand = new PutCommand({
      TableName: completionsTableName,
      Item: completion
    });
    await docClient.send(putCompletionCommand);

    // STEP 8: Update user XP and level
    if (userResult.Item) {
      // User exists - use UpdateCommand
      const updateUserCommand = new UpdateCommand({
        TableName: usersTableName,
        Key: { userId },
        UpdateExpression: 'SET totalXP = :newXP, #level = :newLevel, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#level': 'level' // 'level' is a reserved word in DynamoDB
        },
        ExpressionAttributeValues: {
          ':newXP': newXP,
          ':newLevel': newLevel,
          ':updatedAt': new Date().toISOString()
        }
      });
      await docClient.send(updateUserCommand);
    } else {
      // User doesn't exist - create new user with PutCommand
      const newUser = {
        userId,
        level: newLevel,
        totalXP: newXP,
        stats: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const putUserCommand = new PutCommand({
        TableName: usersTableName,
        Item: newUser
      });
      await docClient.send(putUserCommand);
    }

    // STEP 9: Return success response
    return createResponse(200, {
      message: leveledUp 
        ? `Habit completed! You leveled up to level ${newLevel}!` 
        : 'Habit completed successfully!',
      completion: {
        habitId,
        habitName: habit.name,
        xpEarned: xpReward,
        completedAt
      },
      user: {
        level: newLevel,
        totalXP: newXP,
        leveledUp,
        previousLevel: currentLevel,
        xpToNextLevel: (newLevel * 100) - newXP
      }
    });

  } catch (error) {
    console.error('Error in completeHabit handler:', error);
    return createResponse(500, {
      error: 'Internal server error',
      message: error.message
    });
  }
};

