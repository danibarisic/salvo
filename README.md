Salvo! Java Backend with Vanilla JS and React Frontends

Vanilla JS served from "resources/static/web"
React located in "src/client"

Requirements

- Java 17+
- Maven or Gradle
- Node.js (v18+ recommended)
- npm (or yarn)

How to Run
Start the Java Backend.

bash/powershell:
./mvnw spring-boot:run
Or if using Gradle:
./gradlew bootRun

It will start the server on http://localhost:8080

Open Vanilla JS version with http://localhost:8080/web/index.html in the URL.

Open React version with:
bash/powershell
cd src/client
npm install
npm start

This will start React on http://localhost:3000 (Make sure CORS is enabled!).
