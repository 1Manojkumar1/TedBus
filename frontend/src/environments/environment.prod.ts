// Production environment, used by `ng build` (see fileReplacements in
// angular.json). This points at the deployed Render service; Render appended
// `-klsp` because `tedbus-api` was taken. If the service is renamed or gets a
// custom domain, update this file and redeploy the frontend.
export const environment = {
  production: true,
  apiUrl: 'https://tedbus-api-klsp.onrender.com/api',
  googleClientId:
    '885582649344-l65klot6nncg7vbn7jnc9i1gacfeqk9e.apps.googleusercontent.com',
};
