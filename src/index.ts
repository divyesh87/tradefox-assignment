import express from "express";
import { config, PRICES } from "./constants";
import { setupRoutes } from "./routes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    serverTime: +new Date(),
  });
});

setupRoutes(app);

app.listen(config.server.port, () => {
  console.log(`Server is running on port ${config.server.port}`);
});
