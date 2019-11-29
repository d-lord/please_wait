# Dal stuff

Use `bash deploy.sh` to build a production copy, deploy it to S3 and invalidate the CloudFront cache.

If doing tricky redirection in Lambda@Edge, also upload `./please_wait.html` to the parent folder as a sibling of `please_wait/`. This only needs to be done once, not every deploy, as long as that file continues to exist.

Redirection logic:

- we want visitors to `/please_wait` or `/please_wait/` to receive the React app
- an existing Lambda@Edge will answer `/please_wait` by transparently serving `/please_wait.html`
- we want it to instead transparently serve `/please_wait/index.html`
- but if we create a file _named_ `/please_wait.html` which is just an HTML redirect to `/please_wait/`, then we can create a second rule...
- which matches on the trailing slash and transparently returns index.html under that slash...
- so we get this setup:
- visitor to `/please_wait` receives `/please_wait.html` which redirects them to `/please_wait/` which transparently serves `/please_wait/index.html` (the actual React app)
- a visitor to `/please_wait/` will skip the first step and go straight to being transparently served `/please_wait/index.html`

This kind of hurt to do and it's not going to feel any better in six months when I try to replicate it. \[dal 2019-11-29\]


# create-react-app stuff

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
