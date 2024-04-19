# Voice AI Assistant (React JS)

Turn your App smart with a conversational AI assistant and interactive voice UI **in less than 10 minutes**!

**No Code Changes! No Intent Definitions!** _Just add our magic button `<AiAssistantButton />`._

[![Sista Logo](./assets/sista-logo.png)](https://smart.sista.ai)

> Sista AI: 🤖 Your AI Integration Platform. ❤️

**Features at a Glance:**

-   **AI Assistant:** Answers any question
-   **UI Controller:** Performs any action
-   **Voice UI:** Speaks any language
-   **Auto Scraper:** Scrape any page
-   **Admin Panel:** Customizes any detail

## Demo

### Try it now!

Visit our [Demo](https://smart.sista.ai) click the button, and start talking... _Say "Turn on the light"!_

[![Sista Logo](./assets/sista-demo-one.png)](https://smart.sista.ai)

## Supported Projects

This package integrates with many React projects.

-   NextJS
-   Electron
-   Gatsby
-   Meteor
-   React Native
-   Remix
-   RedwoodJS
-   Parcel
-   Expo
-   BlitzJS

## Installation

To use [@sista/ai-assistant-react](https://www.npmjs.com/package/@sista/ai-assistant-react), install it in your React App.

##### Using npm:

```bash
npm install @sista/ai-assistant-react
```

##### Using yarn:

```bash
yarn add @sista/ai-assistant-react
```

<!-- ##### Using pnpm:
```bash
pnpm add @sista/ai-assistant-react
``` -->

## Setup

### 1. Import Provider

Import `AiAssistantProvider` and wrap your App at the root level.

```jsx
// ...
import { AiAssistantProvider } from "@sista/ai-assistant-react";

ReactDOM.render(
    <AiAssistantProvider apiKey="YOUR_API_KEY">   // << Wrap your app with this provider
      <App />
    </AiAssistantProvider>
  // ...
);
```

Get your **free** `API key` from the [Admin Panel](https://admin.sista.ai/applications) and replace `"YOUR_API_KEY"`.

### 2. Import Button

Import `AiAssistantButton` and add it wherever you want.

```js
// ...
import { AiAssistantButton } from "@sista/ai-assistant-react";

// ...
function MyComponent() {
  return (
    <div>
      // ...
      <AiAssistantButton />  // << Add the magic button anywhere
    </div>
  );
}
```

> 🎉 Congrats! Press the button, start talking, and enjoy!

---

### 3. Register Voice-Interactive Functions

To make your UI voice-interactive, simply register an `array` of `function signatures` to the **Sista AI model**.

```js
const sayHelloWorld = () => {
    console.log('Hello, World!');
};

// Define the functions to be voice-controlled
const interactiveFunctions = [
    {
        function: {
            handler: sayHelloWorld, // (required) pass a refference to your function
            description: 'Greets the user with Hello World :)', // (required) its important to include clear description (our smart AI automatically handles different variations.)
        },
    },
    // ... register additional functions here
];
```

For functions that accepts parameters:

```js
const sayHello = (name) => {
    console.log(`Hello ${name}!`);
};

// Define the functions to be voice-controlled
const interactiveFunctions = [
    {
        function: {
            handler: sayHello,
            description: 'Greets the user with their name.',
            // In case your function accepts parameters:
            parameters: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string', // set parameter type
                        description: "User's name.", // add parameter description
                    },
                },
                required: ['name'], // list required parameters
            },
        },
    },
];
```

Register the functions with `aiAssistant.registerFunctions(..);` inside a `useEffect` hook.

```js
const aiAssistant = useAiAssistant();
useEffect(() => {
    if (aiAssistant) {
        aiAssistant.registerFunctions(interactiveFunctions);
    }
}, [aiAssistant]);
```

> Just like that, your app is voice-interactive. Magic! :sparkles:

To customize the AI assistant's voice or feed information about your product, visit the [Admin Panel](https://admin.sista.ai/applications).

## Full Example: (Todo App)

For a voice-interactive todo app to `add` or `remove` tasks, the setup is:

```js
import React, { useEffect } from 'react';
import { useAiAssistant, AiAssistantButton } from '@sista/ai-assistant-react';

function TodoApp() {
    const addTask = (task) => {
        console.log(`Task added: ${task}`);
    };

    const removeTask = (task) => {
        console.log(`Task removed: ${task}`);
    };

    // ...

    // Initialize the aiAssistant instance
    const aiAssistant = useAiAssistant();

    useEffect(() => {
        // Define the voice-controlled functions
        const interactiveFunctions = [
            {
                function: {
                    handler: addTask,
                    description: 'Adds a new task.',
                    parameters: {
                        type: 'object',
                        properties: {
                            task: {
                                type: 'string',
                                description: 'Description of the task.',
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
                                description: 'Description of the task.',
                            },
                        },
                        required: ['task'],
                    },
                },
            },
        ];

        // Register the AI controlled functions
        if (aiAssistant) {
            aiAssistant.registerFunctions(interactiveFunctions);
        }
    }, [aiAssistant]);

    // ...

    return (
        <div>
            // ...
            <AiAssistantButton />
        </div>
    );
}

export default TodoApp;
```

---

## Configuration

`AiAssistantProvider` accepts the following props:

```jsx
<AiAssistantProvider
  apiKey="api-key"           // (required): Your API key.
  userId="user-id"           // (optional): Your end user ID (for analytics tracking).
  scrapeContent={true}       // (optional): Automatic page content scraping (Enabled by default).
  debug={false}              // (optional): Debug mode. (Disabled by default)
  apiUrl="api-url"           // (optional): For testing purposes.
>
  // ...
</AiAssistantProvider>
---

## Customization

### Button Color

Modify the colors of the `AiAssistantButton` at different states:

```js
const customStateColors = {
    STATE_IDLE: '#4a6cf6', // Bright Blue
    STATE_LISTENING_START: '#F64A7B', // Bright Pink
    STATE_THINKING_START: '#4ac2f6', // Sky Blue
    STATE_SPEAKING_START: '#4af67f', // Light Green
};

<AiAssistantButton stateColors={customStateColors} />;
```

### Button Style & Position

Pass a `style` object to adjust dimensions, position, and appearance:

```js
const customStyle = {
    // Positioning and layout properties
    position: 'relative', // Positioning of the button, 'absolute' or 'relative' to its normal position
    bottom: 'auto', // Distance from the bottom of its container (use with 'position: absolute')
    right: 'auto', // Distance from the right of its container (use with 'position: absolute')
    zIndex: 999, // Z-index for layering controls

    // Dimension properties
    width: '100px', // Button width
    height: '100px', // Button height

    // Font and color properties
    fontSize: '50px', // Font size of the icon/text inside the button
    color: '#FFF', // Color of the text/icon inside the button

    // Border properties
    border: 'none', // Border properties
    borderRadius: '20%', // Border radius to control the curvature of the button corners

    // Box model properties
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)', // Box shadow properties
    transition: 'background-color 0.3s ease-in-out', // Transition effect for hover or click events

    // Flexbox properties
    display: 'flex', // CSS display property
    justifyContent: 'center', // Aligns children (e.g., icon) horizontally
    alignItems: 'center', // Aligns children (e.g., icon) vertically
};

<AiAssistantButton style={customStyle} />;
```

For example: To override default positioning, set `position: 'relative'` and `bottom/right: 'auto'`. This allows custom placement within your container.

### Button Advanced Styling

Apply CSS classes for complex styling:

```js
.my-custom-button {
    padding: 10px 20px;
    transition: all 0.5s ease;

    /* Hover effect */
    &:hover {
        background-color: #365f8c;
        transform: scale(1.1);
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
        width: 100%;
        font-size: 14px;
    }
}

<AiAssistantButton className="my-custom-button" />
```

Use the `style` prop for inline adjustments or `className` for stylesheet-based customizations.

### Modify AI Responses

Customize AI assistant behavior via the [Admin Panel](https://admin.sista.ai/applications) by providing your `custom prompt` and `training data` in the AI Instruction.

By default, `AiAssistantProvider` supplies the AI model with the current page's content. To disable, set `scrapeContent` to false. Scraped content supplements any prompts from the admin panel.


### Change Assistant Voice

Change AI assistant's voice via the [Admin Panel](https://admin.sista.ai/applications) by selecting your preferred voice in the application settings.

[![Sista Logo](./assets/sista-admin-dark.png)](https://smart.sista.ai)

---

<a href="https://smart.sista.ai">
  <img src="./assets/sista-icon.png" alt="Sista Logo" width="100"/>
</a>

Unlock the Future with our advacned **Voice AI Assistant**: Embrace top-tier components:

-   Conversational AI Agents
-   Interactive Voice UI
-   Automatic page content scraping
-   Intelligent AI interface
-   Natural Language Understanding Engine
-   Text-to-Executable Translator (frontend & backend)
-   Audio-to-Text / Text-to-Audio Conversion
-   Intent Recognition and Handling
-   Contextual Response Generator
-   Custom Prompt Configuration
-   Analytics and Logging
-   Privacy and Security

## Diverse SDKs

Install across all platforms for a unified experience.

|                                                                                                      |                                                                                                           |                                                                                                      |                                                                                                     |                                                                                                      |                                                                                                        |
| :--------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------: |
|   [<img src="./assets/sdks/VUE.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)   |   [<img src="./assets/sdks/ANGULAR.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)    |  [<img src="./assets/sdks/EMBER.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)  | [<img src="./assets/sdks/SVELTE.svg" width="100px">](https://github.com/orgs/sista-ai/repositories) |  [<img src="./assets/sdks/NEXT.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)   |  [<img src="./assets/sdks/GATSBY.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)   |
|  [<img src="./assets/sdks/REMIX.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)  |     [<img src="./assets/sdks/DART.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)     |   [<img src="./assets/sdks/JS.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)    |  [<img src="./assets/sdks/IOS.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)   | [<img src="./assets/sdks/ANDROID.svg" width="100px">](https://github.com/orgs/sista-ai/repositories) |   [<img src="./assets/sdks/IONIC.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)   |
| [<img src="./assets/sdks/CORDOVA.svg" width="100px">](https://github.com/orgs/sista-ai/repositories) | [<img src="./assets/sdks/REACT-NATIVE.svg" width="100px">](https://github.com/orgs/sista-ai/repositories) | [<img src="./assets/sdks/FLUTTER.svg" width="100px">](https://github.com/orgs/sista-ai/repositories) |  [<img src="./assets/sdks/MAUI.svg" width="100px">](https://github.com/orgs/sista-ai/repositories)  | [<img src="./assets/sdks/XAMARIN.svg" width="100px">](https://github.com/orgs/sista-ai/repositories) | [<img src="./assets/sdks/CAPACITOR.svg" width="100px">](https://github.com/orgs/sista-ai/repositories) |

## Contributing

Your contributions are warmly welcomed! Let's collaborate 🤝

## License

Licensed under [CC BY-NC-ND 3.0](./LICENSE).

## Support

For issues, raise on Github or contact [support@sista.ai](mailto:support@sista.ai).
