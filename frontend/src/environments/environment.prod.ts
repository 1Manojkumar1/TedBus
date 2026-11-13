// Production environment, used by `ng build` (see fileReplacements in
// angular.json). The API URL must be the deployed Render service; the service
// name in render.yaml is `tedbus-api`, so the host below matches that. If you
// rename the Render service or add a custom domain, update this file and
// redeploy the frontend.
export const environment = {
  production: true,
  apiUrl: 'https://tedbus-api.onrender.com/api',
  googleClientId:
    '885582649344-l65klot6nncg7vbn7jnc9i1gacfeqk9e.apps.googleusercontent.com',
};
