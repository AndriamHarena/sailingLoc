db = db.getSiblingDB("admin");

try {
  const status = rs.status();
  print("✅ Replica set already initialized.");
} catch (e) {
  print("🔁 Initializing replica set...");
  rs.initiate({
    _id: "rs0",
    members: [{ _id: 0, host: "mongo:27017" }]
  });
}
