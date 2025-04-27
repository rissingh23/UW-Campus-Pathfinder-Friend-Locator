UW Campus Paths

A full-stack web application for University of Washington students to navigate campus faster and more efficiently, with real-time scheduling and friend-locator features.

Features

🗺️ Shortest Path Finder: Quickly find the fastest walking route between campus buildings using Dijkstra's Algorithm.
🧑‍🤝‍🧑 Friend Locator: View real-time friend locations on the map (planned feature).
🕐 Schedule Integration: Plan paths based on class schedules to minimize travel time during peak hours.
⚡ Fast Navigation: Sub-second route generation across 50+ campus buildings.
Tech Stack

Frontend: React, TypeScript, HTML, CSS
Backend (planned expansion): Node.js (Express) – for real-time updates (future work)
Pathfinding Algorithm: Dijkstra’s Algorithm for optimized routing.


How It Works

Users select their current location and destination from a dropdown menu.
The app computes the shortest path instantly and displays it visually on a campus map.
Friend locator functionality (planned) will allow users to opt-in and share their location securely with friends.
Installation

Clone the repository:
git clone https://github.com/your-username/uw-campus-paths.git
cd uw-campus-paths
Install dependencies and run:
cd client
npm install
npm run start
cd ..
cd server
npm install
npm run start
Open your browser and visit:
http://localhost:5173
(Assuming you are using Vite as your React framework.)
Future Improvements

🔔 Real-time notifications for route changes due to campus construction or event closures.
📍 Friend tracking with live updates using WebSockets.
📅 Integration with UW’s scheduling system for automated path planning based on class times.
🧠 Smarter routing with learning from historical path congestion data.
Screenshots
Credits

Developed by Rishabh Singh
License

This project is licensed under the MIT License.

