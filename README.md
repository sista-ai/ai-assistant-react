# Sista: Voice UI Controller

🔊 Unleash the power of voice 🎤 in your React apps with `@sista/vuic-react` 🚀

This tiny, AI-powered library lets you build voice-enabled apps without any code changes!!

 All you need is 1 `config` file, informing our powerful AI model what `functions` it can call. 

Dive into this mini guide and discover how to integrate voice functionality seamlessly into your React projects in **less than 10 min**!

![Sista Logo](./assets/sista-logo.png)

## Installation

To use [@sista/vuic-react](https://www.npmjs.com/package/@sista/vuic-react), install it via `npm` or `yarn` or `pnpm` in your React App.

```bash
# install with npm
npm install @sista/vuic-react

# Or with yarn
yarn add @sista/vuic-react

# Or with pnpm
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

Replace `"YOUR_API_KEY"` with your actual API key. 

Obtain your FREE API key from the [admin dashboard](https://admin.sista.ai/applications). _(or visit admin.sista.ai)_


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

That's all it takes for users to start interacting with your app via voice commands. It works like magic :sparkles:


```js
// Regular function
const sayHello = (name) => {
  console.log(`Hello ${name}!`);
};

// Define the functions to be voice-controller
const voiceControlledFunctions = [
  {
    function: {
      handler: sayHello, // Function to be called
      name: "sayHello", // Function name
      description: "Greets the user with their name.", // Function description
      parameters: {
        type: "object", // Parameters type
        properties: {
          name: { 
            type: "string", // 'name' property type
            description: "User's name." // 'name' property description
          },
        },
        required: ["name"], // Required properties
      },
    },
  },
  // Include additional functions here
];
```

The `voiceControlledFunctions` array contains objects, each representing a function that can be activated by a voice command.


To register these functions, use the `vuic.registerFunctions(voiceControlledFunctions);` inside a `useEffect` hook to ensure it's done once the component is loaded.

```js
  const vuic = useVuic();
  useEffect(() => {
    if (vuic) {
      vuic.registerFunctions(voiceControlledFunctions);
    }
  }, [vuic]);
```

#### Full Example: Todo App

Consider a todo app where users can add or remove tasks using voice commands. The setup would look like this:

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
          name: 'addTask',
          description: 'Adds a new task.',
          parameters: {
            type: 'object',
            properties: {
              task: { type: 'string', description: 'Description of the task.' },
            },
            required: ['task'],
          },
        },
      },
      {
        function: {
          handler: removeTask,
          name: 'removeTask',
          description: 'Removes an existing task.',
          parameters: {
            type: 'object',
            properties: {
              task: { type: 'string', description: 'Description of the task.' },
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