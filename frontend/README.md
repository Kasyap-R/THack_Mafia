# This is the Frontend for T-Hack Mafia in the TIAA Summer Intern Hackathon

## Directory Structure
- public/assets
    - For the storage of logos, images, etc.

- src/components
    - Reusable components like buttons and other UI elements

- src/pages
    - Components that represent entire pages, often contain multiple components from `src/components`

- src/services
    - TS files responsible for managing API calls. Also contain interfaces which define how we talk to and recieve data from these API's

- src/stores
    - Responsible for state management in our application using `zustand`
    - Keeps track of information like the current page the user is in, whether they are authenticated, etc.