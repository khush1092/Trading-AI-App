import { Router } from "express";
import { getStocks } from "./stocks.controller";
import { asyncHandler } from "../../utils/async-handler";

export const stocksRouter = Router();

stocksRouter.get("/", asyncHandler(getStocks));
