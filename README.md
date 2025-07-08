# Avyls AI Website

## Project Description
Avyls AI Website is an AI-powered marketing campaign management web application. It enables users to create, manage, analyze, and deploy marketing campaigns with AI-generated content and real-time analytics. The dashboard provides campaign performance metrics, visualizations, and management tools, all integrated with user authentication and real-time data updates.

## Features
- User authentication (Firebase Auth)
- Create, view, and manage marketing campaigns
- AI-generated content (captions, ad copy, images)
- Real-time analytics and performance metrics
- Interactive charts and data visualizations
- Campaign deployment center
- Responsive, modern UI

## Tech Stack
| Technology         | Function/Role                                      |
|--------------------|----------------------------------------------------|
| React              | Frontend UI framework                              |
| React Router       | Client-side routing/navigation                     |
| Chart.js, Recharts | Data visualization and analytics                   |
| Lucide-react       | UI icons                                           |
| CSS                | Styling                                            |
| Vite               | Frontend build tool/dev server                     |
| Node.js/Express    | Backend API, business logic                        |
| Firebase Firestore | Real-time database for campaigns/users             |
| Firebase Auth      | User authentication                                |
| LangchainService   | AI/LLM orchestration for content generation        |
| Jest               | Testing framework                                  |
| JWT                | Authentication tokens                              |
| LocalStorage       | Client-side settings persistence                   |

## Prerequisites
- Node.js (v16 or higher)
- Firebase project (Firestore & Auth enabled)

## Installation & Setup
1. Clone the repository
   ```bash
   git clone https://github.com/your-username/avyls-ai-website.git
   cd avyls-ai-website
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Set up Firebase:
   - Create a Firebase project
   - Enable Firestore and Authentication
   - Copy your Firebase config to `src/config/firebase.js` and `server/config/firebase.js`
4. Start the development server
   ```bash
   npm run dev
   ```

## Testing
Run tests with:
```bash
npm test
```

## License
MIT
