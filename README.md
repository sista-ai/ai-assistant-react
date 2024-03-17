# Sista: Voice UI Controller

Sista Voice UI Controller is a React package that provides a set of components and hooks to help you build voice-enabled applications with ease.

This documentation provides a concise guide on how to install, setup, and use the `@sista/vuic-react` library for integrating voice functionality into your React applications.

## Installation

Before you start using the `@sista/vuic-react` library, you need to install it. You can do this using either npm or yarn. Run one of the following commands in your project directory:

```bash
npm install @sista/vuic-react
```

or

```bash
yarn add @sista/vuic-react
```

## Setup

### 1. Initialize the SDK

First, wrap your app component with the `VuicProvider` component and provide it with your API key. This is typically done in your main entry file, like `index.js` or `index.tsx`.

```js
import React from "react";
import ReactDOM from "react-dom/client";
import { VuicProvider } from "@sista/vuic-react";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <VuicProvider apiKey={"YOUR_API_KEY"}>
      <App />
    </VuicProvider>
  </React.StrictMode>
);
```

Replace `"YOUR_API_KEY"` with your actual API key.

### 2. Import and Use the Voice Button

Within your application, import the `VuicButton` from the `@sista/vuic-react` package and add it to your component where you want the voice functionality to be accessible.

```js
// ...
import { VuicButton } from "@sista/vuic-react";

// ...

function MyComponent() {
  return (
    <div>
      {/* Other UI elements */}
      <VuicButton />
      {/* Other UI elements */}
    </div>
  );
}
```

### 3. Configuration

Lastly you'll need to define voice-activated functions by registering their signatures. This setup is vital for the voice UI to understand and execute commands.


#### Function Signature Structure

Before diving into an example, let's understand the structure of a functionSignatures object. This object describes the functions that your application can execute through voice commands, including their names, descriptions, parameters, and any other necessary details. Here’s the basic structure:

```js
const functionSignatures = [
  {
    type: 'function', // Indicates the type of signature
    function: {
      name: 'functionName', // The name of the function
      description: 'A brief description of what the function does',
      parameters: {
        type: 'object', // Parameters are passed as an object
        properties: {
          paramName: { // Each parameter's name
            type: 'string', // The type of the parameter (string, number, etc.)
            description: 'Description of the parameter', // A brief description of the parameter
          },
        },
        required: ['paramName'], // List of required parameters
      },
    },
  },
  // Add more function signatures as needed
];

```


#### Example: using a Todo App

In a todo application, you might want to allow users to add tasks through voice commands. Below is a streamlined example that includes defining the `addTask` function and registering it along with its signature:

```js
// ...
import { useVuic, useEffect } from '@sista/vuic-react';

function TodoApp() {
    // function to be voice activated by VUID
    const addTask = (taskDescription) => {
        console.log(`Added task: ${taskDescription}`);
    };

    // ...

    const vuic = useVuic();
    useEffect(() => {
        const functionSignatures = [
            {
                type: 'function',
                function: {
                    name: 'addTask',
                    description:
                        'Adds a task to the todo list with a given description.',
                    parameters: {
                        type: 'object',
                        properties: {
                            taskDescription: {
                                type: 'string',
                                description: 'The task description.',
                            },
                        },
                        required: ['taskDescription'],
                    },
                },
            },
        ];

        if (vuic) {
            vuic.registerFunctions(functionSignatures, { addTask });
        }
    }, [vuic]);

    return <div>{/* TodoApp UI elements here */}</div>;
```

 The `functionSignatures` object defines how `addTask` should be recognized and executed via voice commands. This function, along with its signature, is registered with the VUIC SDK using `useEffect` to ensure it's done once the component mounts.

## Basic Usage

The basic usage involves three key steps:

1. **Initiate the SDK (`VuicProvider`):** Wrap your app with `VuicProvider` and provide your API key to initialize the voice functionality.
2. **Import Voice Button (`<VuicButton />`):** Use the `VuicButton` component in your UI to give users the ability to interact with voice commands.
3. **Write Your Config File:** Define and register your voice-activated functions using `vuic.registerFunctions(functionSignatures, functionReferences);` to make them accessible through voice commands.


## Contributing

We welcome contributions to Sista Voice UI Controller! Please see our [contributing guide](LINK_TO_CONTRIBUTING_GUIDE) for more details.

## License

Sista Voice UI Controller is [MIT licensed](./LICENSE).

## Support

If you're having a problem with this package, please raise an issue on Github or contact us at [support@sista.ai](mailto:support@sista.ai).