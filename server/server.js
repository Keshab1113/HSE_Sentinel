// server.js
require("dotenv").config();

async function startServer() {
  // Use dynamic import for ES module
  const appModule = await import("./app.js");
  const app = appModule.default;
  
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);