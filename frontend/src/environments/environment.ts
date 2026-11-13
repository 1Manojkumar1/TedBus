// Google sign-in configuration.
//
// OAuth client ID of type "Web application" from the Google Cloud Console
// (APIs & Services -> Credentials), with http://localhost:4200 and
// http://127.0.0.1:4200 as authorized JavaScript origins. The same value must
// be set as GOOGLE_CLIENT_ID in backend/.env so the API can verify the token.
//
// The client secret is deliberately absent: the browser receives an ID token
// from Google and the API verifies it, so no secret is exchanged.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId:
    '885582649344-l65klot6nncg7vbn7jnc9i1gacfeqk9e.apps.googleusercontent.com',
};
