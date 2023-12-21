import { createEdgeStoreProvider } from "@edgestore/react";
import { type EdgeStoreRouter } from "../../../api/src";

const { EdgeStoreProvider, useEdgeStore } =
  createEdgeStoreProvider<EdgeStoreRouter>();

export { EdgeStoreProvider, useEdgeStore };
