import { initEdgeStore } from "@edgestore/server";
import { initEdgeStoreClient } from "@edgestore/server/core";
import { createEdgeStoreExpressHandler } from "@edgestore/server/adapters/express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

// --- EXPRESS CONFIG ---

const PORT = process.env.PORT ?? 3001;

const app = express();

/**
 * Your express app is probably running in a different port than your frontend app.
 * To avoid CORS issues, we should use the cors middleware.
 */
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
/**
 * Edge Store uses cookies to store the context token.
 * We need to use the cookie parser middleware to parse the cookies.
 */
app.use(cookieParser());
/**
 * We need to have access to the json request body.
 * We can use the body parser middleware to parse the request.
 */
app.use(bodyParser.json());

// --- EDGESTORE ROUTER CONFIG ---

const es = initEdgeStore.create();

const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket({
    accept: ["image/*"],
  }),
});

export type EdgeStoreRouter = typeof edgeStoreRouter;

const backendClient = initEdgeStoreClient({
  router: edgeStoreRouter,
});

const handler = createEdgeStoreExpressHandler({
  logLevel: "debug",
  router: edgeStoreRouter,
});

// --- EXPRESS ROUTES ---

const router = express.Router();

router.get("/", (req, res) => {
  console.log(req), res.send("Hello from server!");
});

// set the get and post routes for the edgestore router
router.get("/edgestore/*", handler);
router.post("/edgestore/*", handler);

router.post("/server-upload", async (req, res) => {
  console.log(req.body);
  const text = req.body.text;
  await backendClient.publicFiles.upload({
    content: text,
  });
  res.send("ok");
});

router.get("/list-files", async (_req, res) => {
  const files = await backendClient.publicFiles.listFiles();
  res.json(files.data.map((file) => file.url));
});

router.post("/delete-file", async (req, res) => {
  const url = req.body.url;
  await backendClient.publicFiles.deleteFile({
    url,
  });
  res.send("ok");
});

app.use("/api", router);

// need this export to run in Vercel
export default app;

if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`⚡Server is running here 👉 http://localhost:${PORT}`);
  });
}
