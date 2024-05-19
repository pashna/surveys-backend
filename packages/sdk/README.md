# Anecdoteai Browser JS Library

[![npm package](https://img.shields.io/npm/v/@anecdoteai/sdk?style=flat-square)](https://www.npmjs.com/package/@anecdoteai/sdk)
[![MIT License](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](https://opensource.org/licenses/MIT)


## How to use this library

1. Install the Anecdoteai package inside your project using npm:

```bash
npm install -s @anecdoteai/sdk
```

2. Import @anecdoteai/sdk and initialize the widget in your main component (e.g., App.tsx or App.js):

```javascript
import anecdoteai from "@anecdoteai/sdk";

if (typeof window !== "undefined") {
  anecdoteai.init({
    environmentId: "your-environment-id",
    apiHost: "https://surveys.anecdoteai.com",
  });
}
```

Replace your-environment-id with your actual environment ID.

