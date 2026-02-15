import console from "console";
import QRCode from "qrcode";
import {
  retrieveTableById,
  retrieveTables,
} from "../../../models/tables.js";
import { URLSearchParams } from "url";
import { possibleTablePositions } from "../../../models/types.js";

const JOIN_PATH = "/game/join";

/**
 * Generates qr code for given table id and position.
 *
 * @param {Request} req request with params tableId and pos
 * @param {Response} res
 * @returns qr code data and image as base64 string
 */
export const generateQRCode = async (req, res) => {
  const { tableId, pos } = req.params;
  try {
    // position doesn't exist
    if (!possibleTablePositions.includes(pos)) {
      return res.status(400).json({ error: "Ungültige Position" });
    }

    // table doesn't exist
    const table = await retrieveTableById(tableId);
    if (!table) {
      return res.status(404).json({ error: "Tisch nicht gefunden" });
    }

    const queryParams = new URLSearchParams({ tableId, pos });
    const url = `${req.protocol}://${req.get("host")}${JOIN_PATH}?${queryParams.toString()}`;
    const image = await QRCode.toDataURL(url);

    return res.json({ url, image });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return res.status(500).json({ error: "Interner Serverfehler" });
  }
};

export const getTables = async (req, res) => {
  try {
    const tables = await retrieveTables();
    return res.json(tables);
  } catch (error) {
    console.error("Error retrieving tables:", error);
    return res.status(500).json({ error: "Interner Serverfehler" });
  }
};
