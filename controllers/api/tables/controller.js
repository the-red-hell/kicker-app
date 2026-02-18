import console from "console";
import QRCode from "qrcode";
import { retrieveTableById, retrieveTables } from "../../../models/tables.js";
import { URLSearchParams } from "url";
import { possiblePositions, possibleTeams } from "../../../models/types.js";

const JOIN_PATH = "/game";

/**
 * Generates qr code for given table id, position, and team.
 *
 * @param {Request} req request with params tableId and query params position and team
 * @param {Response} res
 * @returns qr code image as PNG
 */
export const generateQRCode = async (req, res) => {
  const { tableId } = req.params;
  const { position, team } = req.query;
  try {
    // position doesn't exist
    if (!possiblePositions.includes(position)) {
      return res.status(400).json({ error: "Ungültige Position" });
    }
    // team doesn't exist
    if (!possibleTeams.includes(team)) {
      return res.status(400).json({ error: "Ungültiges Team" });
    }

    // table doesn't exist
    const table = await retrieveTableById(tableId);
    if (!table) {
      return res.status(404).json({ error: "Tisch nicht gefunden" });
    }

    const filename = `table-${tableId}-${team}-${position}.png`;
    const queryParams = new URLSearchParams({ position, team });
    const url = `${req.protocol}://${req.get("host")}${JOIN_PATH}/${tableId}?${queryParams.toString()}`;

    const image = await QRCode.toBuffer(url, {
      type: "png",
      width: 500,
      margin: 2,
    });

    // set headers for file download
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    return res.send(image);
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
