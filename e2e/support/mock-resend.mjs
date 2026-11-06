// A local stand-in for the Resend API, used only by the browser tests. The application talks to it
// through the Resend SDK's own RESEND_BASE_URL setting, so the real route handler and SDK run
// unchanged and nothing leaves the machine. It is never deployed.
//
// Behaviour is chosen by the sender name in the email subject, so parallel tests don't share state:
//   name contains "e2e-reject"  -> 422 validation_error (provider refuses the message)
//   name contains "e2e-500"     -> 500 with a non-JSON body
//   name contains "e2e-slow"    -> answers after 15 s (longer than the handler's 10 s limit)
//   name contains "e2e-drop"    -> closes the connection without answering (network failure)
//   anything else               -> 200 { id }  ("accepted", which is not proof of inbox delivery)
//
// GET /__sent?name=<substring> lists accepted messages; GET /__health answers 200.
import http from "node:http";

const port = Number(process.env.MOCK_RESEND_PORT ?? 3101);
const sent = [];
let counter = 0;

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  if (req.method === "GET" && url.pathname === "/__health") return json(res, 200, { ok: true });
  if (req.method === "GET" && url.pathname === "/__sent") {
    const name = url.searchParams.get("name") ?? "";
    return json(
      res,
      200,
      sent.filter((m) => m.subject.includes(name)),
    );
  }
  if (req.method !== "POST" || url.pathname !== "/emails") return json(res, 404, { name: "not_found" });

  let raw = "";
  req.setEncoding("utf8");
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    let email;
    try {
      email = JSON.parse(raw);
    } catch {
      return json(res, 400, { name: "validation_error", message: "Invalid JSON", statusCode: 400 });
    }
    const auth = req.headers.authorization ?? "";
    if (!auth.startsWith("Bearer re_test_")) {
      return json(res, 401, { name: "missing_api_key", message: "Test key required", statusCode: 401 });
    }
    const subject = String(email.subject ?? "");
    if (subject.includes("e2e-reject")) {
      return json(res, 422, {
        name: "validation_error",
        message: "The test provider refused this message.",
        statusCode: 422,
      });
    }
    if (subject.includes("e2e-500")) {
      res.writeHead(500, { "content-type": "text/html" });
      return res.end("<h1>Internal error</h1>");
    }
    if (subject.includes("e2e-slow")) {
      const t = setTimeout(() => json(res, 200, { id: "late" }), 15_000);
      req.on("close", () => clearTimeout(t));
      return;
    }
    if (subject.includes("e2e-drop")) return req.socket.destroy();
    counter += 1;
    const id = `test-${counter}`;
    sent.push({
      id,
      from: email.from,
      to: email.to,
      reply_to: email.reply_to,
      subject,
      text: email.text,
      headers: email.headers,
    });
    return json(res, 200, { id });
  });
});

server.listen(port, "127.0.0.1", () => console.log(`[mock-resend] listening on 127.0.0.1:${port}`));
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => server.close(() => process.exit(0)));
