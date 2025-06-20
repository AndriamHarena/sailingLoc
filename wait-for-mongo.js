import net from "net";
import { MongoClient } from "mongodb";

const delay = ms => new Promise(res => setTimeout(res, ms));
const host = "mongo";
const port = 27017;

const uriInit = "mongodb://mongo:27017";
const uriReplica = "mongodb://mongo:27017/?replicaSet=rs0";

async function waitForPortOpen() {
  for (let i = 0; i < 10; i++) {
    console.log(`🔎 Connexion à ${host}:${port}...`);
    try {
      await new Promise((resolve, reject) => {
        const socket = net.createConnection(port, host);
        socket.on("connect", () => {
          socket.end();
          resolve();
        });
        socket.on("error", reject);
      });
      console.log("✅ Port Mongo ouvert");
      return;
    } catch {
      console.log("⏳ Port fermé, retry...");
      await delay(3000);
    }
  }
  console.error("❌ Échec : port MongoDB injoignable.");
  process.exit(1);
}

async function checkReplicaSet() {
  const client = new MongoClient(uriInit);
  try {
    await client.connect();
    const admin = client.db("admin");
    const status = await admin.command({ replSetGetStatus: 1 }).catch(() => null);

    if (!status || status.ok !== 1) {
      console.log("🔁 Init replica set...");
      await admin.command({
        replSetInitiate: {
          _id: "rs0",
          members: [{ _id: 0, host: "mongo:27017" }],
        },
      });
    } else {
      console.log("✅ Replica déjà prêt");
    }
  } catch (err) {
    console.error("❌ Init replica : ", err.message);
  } finally {
    await client.close();
  }
}

async function waitForReplicaSet() {
  for (let i = 0; i < 10; i++) {
    const client = new MongoClient(uriReplica);
    try {
      await client.connect();
      const result = await client.db("admin").command({ ping: 1 });
      if (result.ok === 1) {
        console.log("✅ Replica set opérationnel");
        await client.close();
        return;
      }
    } catch (err) {
      console.log("⏳ Attente replica : ", err.message);
    } finally {
      await client.close();
    }
    await delay(5000);
  }
  console.error("❌ Timeout replica set");
  process.exit(1);
}

(async () => {
  await waitForPortOpen();
  await checkReplicaSet();
  await waitForReplicaSet();
})();
