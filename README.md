# Sista: Voice UI Controller

🔊 Unleash the power of voice 🎤 in your React apps with `@sista/vuic-react` 🚀

This tiny, AI-powered library lets you build voice-enabled apps without any code changes!!

 All you need is 1 `config` file, informing our powerful AI model what `functions` it can call. 

Dive into this mini guide and discover how to integrate voice functionality seamlessly into your React projects in **less than 10 min**!

![Sista Logo](./assets/sista-logo.png)

## Supported Projects

This package can be integrated into a wide range of React-based projects, including:

- Create React App
- React Native
- Next.js
- Gatsby
- Electron
- Meteor
- Parcel
- Expo
- Remix
- Storybook
- RedwoodJS
- Blitz.js

## Installation

To use [@sista/vutic-reac](https://www.npmjs.com/package/@sista/vuic-react), install it in your React App.


##### Using npm:
```bash
npm install @sista/vuic-react
```

##### Using yarn:
```bash
yarn add @sista/vuic-react
```

##### Using pnpm:
```bash
pnpm add @sista/vuic-react
```

## Setup

### 1. Import the Provider

a. Import `VuicProvider`:

```jsx
import { VuicProvider } from "@sista/vuic-react";
```

b. Wrap your main component:

```jsx
<VuicProvider apiKey="YOUR_API_KEY">
  {/* Your main component */}
</VuicProvider>
```

c. Add your API KEY

Get your free `API key` from the [Admin Panel](https://admin.sista.ai/applications) and replace `"YOUR_API_KEY"`.


Example:

```jsx
// ...
import { VuicProvider } from "@sista/vuic-react";

ReactDOM.render(
  <React.StrictMode>
    <VuicProvider apiKey="YOUR_API_KEY"> // << Wrap your app with this
      <App />
    </VuicProvider>
  </React.StrictMode>,
  // ...
);
```

---

### 2. Import the Button

Import `VuicButton` and add it wherever you want in your component.

```js
// ...
import { VuicButton } from "@sista/vuic-react";

// ...
function MyComponent() {
  return (
    <div>
      {/* ... */}
      <VuicButton />
      {/* ... */}
    </div>
  );
}
```

🎉 Congratulations! Almost done. Now you can start talking with your app. Just press the button and enjoy the experience. 😊👍

---

### 3. Register Voice Controlled Functions

To voice-control your app, just specify the callable functions in a simple config object.

> Just like that, your app is voice-interactive. Magic! :sparkles:


```js
// Regular function
const sayHello = (name) => {
  console.log(`Hello ${name}!`);
};

// Define the functions to be voice-controller
const voiceControlledFunctions = [
  {
    function: {
      handler: sayHello, // pass your function
      description: "Greets the user with their name.", // add function description
      // In case your function accepts paraemters:
      parameters: {
        type: "object",
        properties: {
          name: { 
            type: "string", // set parameter type
            description: "User's name." // add parameter description
          },
        },
        required: ["name"], // list required parameters
      },
    },
  },
  // ... include additional functions here
];
```

Register the functions with `vuic.registerFunctions(voiceControlledFunctions);` inside a `useEffect` hook.

```js
  const vuic = useVuic();
  useEffect(() => {
    if (vuic) {
      vuic.registerFunctions(voiceControlledFunctions);
    }
  }, [vuic]);
```

## Full Example: (Todo App)

For a todo app with voice commands to add or remove tasks, the setup is:

```js
import React, { useEffect } from 'react';
// Import the useVuic hook from the vuic-react package
import { useVuic } from '@sista/vuic-react';

function TodoApp() {

  const addTask = (task) => {
    console.log(`Task added: ${task}`);
  };

  const removeTask = (task) => {
    console.log(`Task removed: ${task}`);
  };

  // Initialize the vuic instance
  const vuic = useVuic();

  useEffect(() => {
    // Define the voice-controlled functions
    const voiceControlledFunctions = [
      {
        function: {
          handler: addTask,
          description: 'Adds a new task.',
          parameters: {
            type: 'object',
            properties: {
              task: { 
                type: 'string', 
                description: 'Description of the task.' 
              },
            },
            required: ['task'],
          },
        },
      },
      {
        function: {
          handler: removeTask,
          description: 'Removes an existing task.',
          parameters: {
            type: 'object',
            properties: {
              task: { 
                type: 'string', 
                description: 'Description of the task.' 
              },
            },
            required: ['task'],
          },
        },
      },
    ];

    // Register the voice-controlled functions with the vuic instance
    if (vuic) {
      vuic.registerFunctions(voiceControlledFunctions);
    }
  }, [vuic]);

  return <div>{/* UI components */}</div>;
}

export default TodoApp;
```

---

## Customization

### Change Button Colors

You can modify the colors of the `VuicButton` for different states:

```js
    const colors = {
        STATE_IDLE: '#4a6cf6', // Default
        STATE_LISTENING_START: '#F64A7B', // Red
        STATE_THINKING_START: '#4ac2f6', // Blue
        STATE_SPEAKING_START: '#4af67f', // Green
    };

  <VuicButton buttonColors={colors} />
```


## Contributing

We welcome contributions to Sista Voice UI Controller! Please see our [contributing guide](LINK_TO_CONTRIBUTING_GUIDE).

## License

Sista Voice UI Controller is [MIT licensed](./LICENSE).

## Support

If you're having a problem with this package, please raise an issue on Github or contact us at [support@sista.ai](mailto:support@sista.ai).

<a href="https://vuic.sista.ai">
  <img src="./assets/sista-icon.png" alt="Sista Logo" width="100"/>
</a>