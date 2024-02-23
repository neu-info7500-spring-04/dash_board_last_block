import express from "express";
import { gql, request } from "graphql-request";

const app = express();
const PORT = process.env.PORT || 3000;
const BITQUERY_API_URL = "https://graphql.bitquery.io/";

const BITQUERY_API_KEY = process.env.BITQUERY_API_KEY || "";

// the expected structure of your GraphQL response
interface BlockData {
  bitcoin: {
    blocks: Array<{
      height: number;
      timestamp: {
        time: string;
      };
    }>;
  };
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use((req, res, next) => {
  console.log(`Received request for ${req.url} from ${req.headers.origin}`);
  next();
});

const LAST_BLOCK_QUERY = gql`
  {
    bitcoin(network: bitcoin) {
      blocks(options: { desc: "height", limit: 1 }) {
        height
        timestamp {
          time(format: "%Y-%m-%d %H:%M:%S")
        }
      }
    }
  }
`;

app.get("/last-block", async (req, res) => {
  try {
    const headers = {
      "X-API-KEY": BITQUERY_API_KEY,
    };
    const data = await request<BlockData>(
      BITQUERY_API_URL,
      LAST_BLOCK_QUERY,
      {},
      headers
    );
    const lastBlock = data.bitcoin.blocks[0];
    const lastBlockTimeUTC = new Date(lastBlock.timestamp.time + "Z"); 
    const nowUTC = new Date(new Date().toISOString());

    // the difference in milliseconds
    const diff = nowUTC.getTime() - lastBlockTimeUTC.getTime();

    // the difference is always positive
    if (diff < 0) {
      return res
        .status(500)
        .json({ message: "Future time received for the last block" });
    }

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    res.status(200).json({
      lastBlockHeight: lastBlock.height,
      timeFromLastBlock: `${hours}h ${minutes}m ${seconds}s`,
    });
  } catch (error) {
    console.error("Error fetching last block:", error);
    res.status(500).json({ message: "Error fetching last block" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
