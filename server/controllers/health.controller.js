import { getDBStatus } from "../database/db.js";
export const checkHealth = async (req, res) => {
  try {
    const dbStatus = getDBStatus();
    const healthStatus = {
      status: "OK",
      timestanp: Date.now().toIOString(),
      services: {
        database: {
          status: dbStatus.isConnected ? "healthy" : "unhealthy",
          details: {
            ...dbStatus,
            readyState: getReadyStateText(dbStatus.readyState),
          },
        },

        server: {
          status: "healthy",
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      },
    };
    const httpStatus =
      healthStatus.services.database.status === "healthy" ? 200 : 500;

    res.status(httpStatus).json(healthStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "ERROR",
      timestanp: Date.now().toIOString(),
      error: error.message,
    });
  }
};

const getReadyStateText = (state) => {
  switch (state) {
    case 0:
      return "CONNECTING";
    case 1:
      return "OPEN";
    case 2:
      return "CLOSING";
    case 3:
      return "CLOSED";
    default:
      return "UNKNOWN";
  }
};
