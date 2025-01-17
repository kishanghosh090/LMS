import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 1 second

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;

    // configure mongoose settings
    mongoose.set("strictQuery", true);
    mongoose.connection.on("connected", () => {
      this.isConnected = true;
      console.log("====================================");
      console.log("Database connection established");
      console.log("====================================");
    });
    mongoose.connection.on("error", () => {
      this.isConnected = false;
      console.log("====================================");
      console.log("Database connection error");
      console.log("====================================");
    });
    mongoose.connection.on("disconnected", async () => {
      this.isConnected = false;
      console.log("====================================");
      console.log("Database  disconnected");
      console.log("====================================");
      // TDOO: attempt to reconnection
      await this.handleDisconnection();
    });
    process.on("SIGTERM", async () => {
      await this.handleAppTermination();
    });
  }

  async connect() {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined");
      }
      const connectionOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000, // 5 seconds
        socketTimeoutMS: 45000, // 45 seconds
        family: 4, // use IPv4
      };

      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }
      await mongoose.connect(process.env.MONGO_URI, connectionOptions);
      this.retryCount = 0; // reset retry count on success
    } catch (error) {
      console.error(error.message);
      await this.handleConnectionError();
    }
  }
  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log("====================================");
      console.log(
        `Retrying connection attempt ${this.retryCount} in ${
          RETRY_INTERVAL / 1000
        } seconds...`
      );
      console.log("====================================");
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve;
        }, RETRY_INTERVAL);
      });
      return this.connect();
    } else {
      console.log(`FAILED TO CONNECT TO DATABASE ${MAX_RETRIES} TIMES`);
      process.exit(1);
    }
  }
  async handleDisconnection() {
    if (this.retryCount < MAX_RETRIES) {
      console.log(`Attempting to reconnect to database...`);
      this.connect();
    }
  }
  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
    } catch (error) {
      console.error("Error closing MongoDB connection:", error);
      process.exit(1);
    }
  }
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    };
  }
}

// create a singleton instance

const dbConnection = new DatabaseConnection();

// export the singleton instance
export default dbConnection.connect.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
