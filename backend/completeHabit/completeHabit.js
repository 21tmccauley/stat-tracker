// backend/completeHabit/index.js
// Lambda handler to complete a habit, award XP, and check for level-up

// IMPORTS
// - DynamoDBClient, DynamoDBDocumentClient
// - GetCommand, PutCommand, UpdateCommand (new!)

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// INITIALIZE
// - Same DynamoDB client setup as createHabit
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// HELPER FUNCTIONS
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
  
// - getLevelFromXP(totalXP) - calculates level from XP
//   Formula: level = Math.floor(totalXP / 100) + 1
//   Example: 0 XP = level 1, 100 XP = level 2, 200 XP = level 3, probably make exponential growth required for level ups
const getLevelFromXP = (totalXP) => {
    return Math.floor(totalXP / 100) + 1;
  };

// MAIN HANDLER
export const handler = async (event) => {
    try {
      // STEP 1: Extract userId from Cognito authorizer
      // - Same pattern as createHabit
      // - Validate userId exists
      
      // STEP 2: Parse request body
      // - Parse JSON body
      // - Validate habitId is provided (required)
      
      // STEP 3: Verify habit exists and belongs to user
      // - Use GetCommand to read from HABITS_TABLE_NAME
      // - Key: { userId, habitId }
      // - If not found, return 404 error
      // - Check if habit.isActive === true (can't complete inactive habits)
      
      // STEP 4: Check if already completed today
      // - Format: today = new Date().toISOString().split('T')[0] // "YYYY-MM-DD"
      // - Completion key format: `${today}#${habitId}`
      // - Use GetCommand to check COMPLETIONS_TABLE_NAME
      // - Key: { userId, 'completionDate#habitId': completionKey }
      // - If found, return 400 error (already completed today)
      
      // STEP 5: Get current user data
      // - Use GetCommand to read from USERS_TABLE_NAME
      // - Key: { userId }
      // - If user doesn't exist, create default values:
      //   { level: 1, totalXP: 0, stats: {} }
      
      // STEP 6: Calculate new XP and level
      // - newXP = currentXP + habit.xpReward
      // - newLevel = getLevelFromXP(newXP)
      // - leveledUp = newLevel > currentLevel
      
      // STEP 7: Record completion
      // - Create completion object:
      //   {
      //     userId,
      //     'completionDate#habitId': completionKey,
      //     habitId,
      //     completedAt: new Date().toISOString(),
      //     xpEarned: habit.xpReward
      //   }
      // - Use PutCommand to write to COMPLETIONS_TABLE_NAME
      
      // STEP 8: Update user XP and level
      // - Use UpdateCommand (new!) to update USERS_TABLE_NAME
      // - Key: { userId }
      // - UpdateExpression: 'ADD totalXP :xp SET #level = :level, updatedAt = :updatedAt'
      // - ExpressionAttributeNames: { '#level': 'level' } // 'level' is reserved word
      // - ExpressionAttributeValues: { ':xp': xpReward, ':level': newLevel, ... }
      // - If user doesn't exist, use PutCommand instead (create user)
      
      // STEP 9: Return success response
      // - Status: 200 OK
      // - Body: {
      //     message: 'Habit completed successfully',
      //     completion: { habitId, xpEarned, completedAt },
      //     user: { level: newLevel, totalXP: newXP, leveledUp, previousLevel }
      //   }
      
    } catch (error) {
      // Error handling
    }
  };