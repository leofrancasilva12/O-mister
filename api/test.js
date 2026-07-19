export default function handler(req, res) {
  console.log("[TEST] Endpoint chamado");
  return res.status(200).json({
    ok: true,
    message: "API working",
    timestamp: new Date().toISOString()
  });
}
