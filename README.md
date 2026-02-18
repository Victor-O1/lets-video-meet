🎥 LetsVideoMeet

Crystal-clear video calls. Instantly.

Live Demo:
👉 https://lets-video-meet-victor-o1s-projects.vercel.app/

LetsVideoMeet is a modern, browser-based video conferencing app built with Next.js and LiveKit. It supports HD video, real-time chat, screen sharing, and dynamic participant layouts — all with a sleek, glassmorphism-inspired UI.

✨ Features

🔐 Token-based room authentication

🎥 HD video calling

🎙️ Mute / unmute microphone

📷 Toggle camera on/off

🖥️ Screen sharing (with optional audio)

💬 Real-time chat via LiveKit data channels

👥 Dynamic participant grid layout

🗣️ Active speaker detection

⏱️ Call duration timer

📎 Invite link sharing

🎨 Modern UI with smooth animations

🛠️ Tech Stack

Framework: Next.js (App Router)

Language: TypeScript

Realtime Engine: LiveKit

UI Icons: Lucide React

Notifications: Sonner

Deployment: Vercel

🚀 Getting Started
1️⃣ Clone the repository
git clone https://github.com/your-username/lets-video-meet.git
cd lets-video-meet

2️⃣ Install dependencies
npm install

3️⃣ Setup environment variables

Create a .env.local file:

NEXT_PUBLIC_LIVEKIT_URL=your_livekit_server_url
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

You’ll need a LiveKit server (self-hosted or LiveKit Cloud).

4️⃣ Run the development server
npm run dev

Visit:

http://localhost:3000

🔐 Token API

The app uses a /api/token endpoint to generate room tokens securely using your LiveKit API credentials.

This ensures:

Users can only join valid rooms

Credentials are never exposed to the client

📦 Deployment

This project is deployed on Vercel:

🌍 Production URL:
https://lets-video-meet-victor-o1s-projects.vercel.app/

To deploy your own:

vercel

Make sure to add your environment variables in the Vercel dashboard.

🧠 How It Works

User enters room name + display name.

App fetches a signed token from /api/token.

Client connects to LiveKit server.

Local video & audio tracks are created and published.

Remote participants are dynamically rendered.

Data channels handle real-time chat messaging.

UI updates based on LiveKit room events.

🎨 UI Highlights

Glassmorphism design

Animated ambient background

Speaking indicators

Gradient-based controls

Responsive grid layout

📸 Screenshots

You can add screenshots here:

/public/screenshots/join.png
/public/screenshots/call.png

📄 License

MIT License

💡 Future Improvements

Waiting room support

Recording support

Virtual background

Breakout rooms

Mobile UI refinements

Authentication (Google/GitHub)
