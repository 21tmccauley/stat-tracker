// Authentication service for the frontend

import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';

// Init Cognito User Pool
const poolData = { 
    UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};

const userPool = new CognitoUserPool(poolData);


export function signUp(email, password) {
    return new Promise((resolve, reject) => {
        // create an array of user attributes
        // email is required for most Cognito setups
        const attributeList = [
            new CognitoUserAttribute({
                Name: 'email',
                Value: email,
            })
        ];
        // signUp is async, so we wrap it in a Promise
        userPool.signUp(email, password, attributeList, null, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
         });
    })
}

export function signIn(email, password) {
    return new Promise((resolve, reject) => {
        const authenticationDetails = new AuthenticationDetails({
            Username: email,
            Password: password,
        });
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) => {
                resolve(result);
            },
            onFailure: (err) => {
                reject(err);
            },
        });
    });
}

export function signOut() {
    const cognitoUser = getCurrentUser();
    if (cognitoUser) {
        cognitoUser.signOut();
    }
}

export function getCurrentUser() {
    return userPool.getCurrentUser();
}

export function getCurrentSession() {
    return new Promise((resolve, reject) => {
        const cognitoUser = getCurrentUser();

        // check if there is a user signed in
        if (!cognitoUser) {
            reject (new Error('No user found'))
            return;
        }

        // getSession refreshes tokens if needed and returns the current session
        cognitoUser.getSession((err, session) => {
            if (err) {
                reject(err);
                return;
            }
            if (!session.isValid()) {
                reject(new Error('Invalid session'));
                return;
            }
            resolve(session);
        });
    });
}

export function confirmSignUp(email, code) {
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });
        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

export function forgotPassword(email) {
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });
        cognitoUser.forgotPassword({
            onSuccess: (result) => {
                resolve(result);
            },
            onFailure: (err) => {
                reject(err);
            }
        });
    });
}

export function confirmPassword(email, code, newPassword) {
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });
        cognitoUser.confirmPassword(code, newPassword, {
            onSuccess: (result) => {
                resolve(result);
            },
            onFailure: (err) => {
                reject(err);
            }
        });
    });
}