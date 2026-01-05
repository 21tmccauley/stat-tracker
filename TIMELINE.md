# Project Timeline & Learning Progression

This timeline breaks down the RPG Habit Tracker project into manageable phases, ordered by dependencies and learning progression. Each phase builds on the previous one.

## Phase 1: Foundation & Infrastructure Setup
**Goal**: Get your development environment and basic AWS infrastructure ready

### 1.1 Local Development Setup
- [ ] Install and configure AWS CLI
- [ ] Install Terraform
- [ ] Install Node.js and npm
- [ ] Set up Git repository
- [ ] Create project directory structure

**Learning Focus**: Understanding the tools you'll use

### 1.2 Terraform Backend Setup
- [ ] Create S3 bucket for Terraform state (one-time setup)
- [ ] Create DynamoDB table for state locking
- [ ] Configure `backend.tf` with remote state
- [ ] Test `terraform init` and state configuration

**Learning Focus**: Understanding Terraform remote state and why it's important

### 1.3 Basic Infrastructure (Terraform)
- [ ] Create `variables.tf` with project variables
- [ ] Create `main.tf` with basic resources:
  - [ ] S3 bucket for frontend
  - [ ] DynamoDB tables (Users, Habits, Completions)
- [ ] Create `outputs.tf` for important values
- [ ] Test `terraform plan` and `terraform apply`

**Learning Focus**: Terraform basics, AWS resource creation, IaC concepts

**Estimated Time**: 2-4 hours

---

## Phase 2: Authentication Foundation
**Goal**: Set up user authentication so you can identify users

### 2.1 Cognito Setup (Terraform)
- [ ] Create Cognito User Pool in `main.tf`
- [ ] Create Cognito User Pool Client
- [ ] Configure authentication settings
- [ ] Output Cognito IDs to use in frontend

**Learning Focus**: Understanding Cognito User Pools, authentication flows

### 2.2 Frontend Auth Setup
- [ ] Set up React project with Vite
- [ ] Install AWS Amplify or Cognito SDK
- [ ] Create `.env.example` and `.env.local`
- [ ] Create basic login/signup components
- [ ] Test authentication flow locally

**Learning Focus**: React setup, environment variables, Cognito integration

**Estimated Time**: 3-5 hours

---

## Phase 3: Backend - First Lambda Function
**Goal**: Create your first working Lambda function and API endpoint

### 3.1 API Gateway Setup (Terraform)
- [ ] Create API Gateway REST API in `lambda.tf`
- [ ] Create IAM role for Lambda functions
- [ ] Set up basic CORS configuration

**Learning Focus**: API Gateway basics, IAM roles, CORS

### 3.2 Create `getUserData` Lambda
- [ ] Create Lambda function structure (`backend/getUserData/`)
- [ ] Write handler to query DynamoDB Users table
- [ ] Package and deploy via Terraform
- [ ] Create API Gateway integration
- [ ] Test endpoint (Postman, curl, or browser)

**Learning Focus**: Lambda function structure, DynamoDB queries, API Gateway integration, Terraform Lambda deployment

**Estimated Time**: 4-6 hours

---

## Phase 4: Backend - Complete CRUD Operations
**Goal**: Build all backend endpoints for habit management

### 4.1 Create `createHabit` Lambda
- [ ] Write handler to create habit in DynamoDB
- [ ] Add input validation
- [ ] Deploy and test

**Learning Focus**: DynamoDB writes, input validation, error handling

### 4.2 Create `completeHabit` Lambda
- [ ] Write handler to:
  - [ ] Record completion in Completions table
  - [ ] Update user XP in Users table
  - [ ] Check for level-up logic
- [ ] Deploy and test

**Learning Focus**: DynamoDB updates, transactions (if needed), business logic

**Estimated Time**: 5-7 hours

---

## Phase 5: Frontend - Core Features
**Goal**: Build the main user interface

### 5.1 Frontend Structure
- [ ] Set up component structure (components/, pages/, contexts/)
- [ ] Create AuthContext for managing auth state
- [ ] Set up API client service (`services/api.js`)
- [ ] Create basic routing (if using React Router)

**Learning Focus**: React architecture, Context API, API integration patterns

### 5.2 Dashboard Page
- [ ] Create Dashboard component
- [ ] Fetch and display user stats (level, XP, stats)
- [ ] Create StatsDisplay component
- [ ] Create LevelProgress component
- [ ] Style with CSS

**Learning Focus**: React components, data fetching, state management

### 5.3 Habits Management
- [ ] Create Habits page/component
- [ ] Create HabitForm component (create new habits)
- [ ] Create HabitCard component (display habits)
- [ ] Implement create habit functionality
- [ ] Implement complete habit functionality
- [ ] Update dashboard after completion

**Learning Focus**: Forms, user interactions, state updates, API calls

**Estimated Time**: 8-12 hours

---

## Phase 6: Polish & PWA Features
**Goal**: Make it installable and production-ready

### 6.1 PWA Setup
- [ ] Create `manifest.json`
- [ ] Create service worker (`sw.js`)
- [ ] Add PWA icons
- [ ] Test PWA installation
- [ ] Test offline functionality

**Learning Focus**: Progressive Web Apps, service workers, offline-first patterns

### 6.2 CloudFront & Deployment
- [ ] Configure CloudFront distribution in Terraform
- [ ] Set up S3 bucket policy
- [ ] Create deployment scripts
- [ ] Deploy frontend to S3
- [ ] Configure CloudFront cache
- [ ] Test production deployment

**Learning Focus**: CDN concepts, deployment automation, production considerations

### 6.3 Error Handling & UX
- [ ] Add error boundaries in React
- [ ] Add loading states
- [ ] Add error messages
- [ ] Improve form validation
- [ ] Add success/feedback messages

**Learning Focus**: Error handling patterns, UX best practices

**Estimated Time**: 4-6 hours

---

## Phase 7: Testing & Refinement (Optional)
**Goal**: Test everything works and refine the experience

### 7.1 End-to-End Testing
- [ ] Test complete user flow (signup → create habit → complete → level up)
- [ ] Test error scenarios
- [ ] Test on mobile device
- [ ] Test offline functionality

### 7.2 Refinements
- [ ] Improve UI/UX based on testing
- [ ] Add animations/transitions
- [ ] Optimize performance
- [ ] Add helpful tooltips or onboarding

**Estimated Time**: 4-8 hours

---

## Total Estimated Time: 30-48 hours

## Learning Progression Summary

1. **Infrastructure** → Learn Terraform and AWS basics
2. **Authentication** → Learn Cognito and React auth patterns
3. **Backend** → Learn Lambda, API Gateway, DynamoDB
4. **Frontend** → Learn React patterns and API integration
5. **PWA** → Learn modern web app features
6. **Deployment** → Learn production deployment

## Tips for Learning

- **Don't skip phases**: Each builds on the previous
- **Test as you go**: Don't wait until the end to test
- **Read AWS docs**: When stuck, check official documentation
- **Experiment**: Try variations to understand why things work
- **Take notes**: Document what you learn in each phase
- **Ask questions**: Use me to explain concepts, not just fix code

## When to Ask for Help

- **Stuck for >30 minutes**: Ask for guidance or explanation
- **Errors you don't understand**: Share the error, I'll help debug
- **Concept confusion**: Ask "how does X work?" or "why do we do Y?"
- **Architecture questions**: "Should I use X or Y approach?"

## Next Steps

Start with **Phase 1.1** - set up your local development environment. Once that's done, move to **Phase 1.2** and begin with Terraform.

Good luck! 🚀

