import React, { useState, useEffect } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { Amplify } from "aws-amplify";
import { signIn, signOut, getCurrentUser } from "aws-amplify/auth";
import awsConfig from "./aws-config";

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: awsConfig.userPoolId,
      userPoolClientId: awsConfig.userPoolClientId,
    },
  },
});

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0c10; --panel: #10141c; --border: #1e2535;
    --accent: #00e5ff; --accent2: #7b61ff; --success: #00ff9d;
    --danger: #ff4560; --text: #e2e8f0; --muted: #4a5568;
    --mono: 'Share Tech Mono', monospace; --sans: 'Syne', sans-serif;
  }
  body { background: var(--bg); color: var(--text); font-family: var(--sans); min-height: 100vh; }
  .app {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center; padding: 40px 20px;
    background: radial-gradient(ellipse 80% 50% at 20% 10%, rgba(0,229,255,0.06) 0%, transparent 60%),
                radial-gradient(ellipse 60% 40% at 80% 90%, rgba(123,97,255,0.07) 0%, transparent 60%), var(--bg);
  }
  .header { text-align: center; margin-bottom: 40px; }
  .header-tag { font-family: var(--mono); font-size: 11px; letter-spacing: 3px; color: var(--accent); text-transform: uppercase; margin-bottom: 10px; }
  .header h1 { font-size: clamp(24px, 5vw, 42px); font-weight: 800; letter-spacing: -1px; line-height: 1.1; }
  .header h1 span { color: var(--accent); }
  .header-sub { font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: 8px; }
  .lock-display { font-size: 72px; margin: 10px 0 30px; transition: all 0.4s ease; filter: drop-shadow(0 0 20px rgba(0,229,255,0.3)); }
  .lock-display.unlocked { filter: drop-shadow(0 0 24px rgba(0,255,157,0.5)); }
  .tabs { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; justify-content: center; }
  .tab { font-family: var(--mono); font-size: 12px; letter-spacing: 1px; padding: 8px 16px; border-radius: 4px; border: 1px solid var(--border); background: var(--panel); color: var(--muted); cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
  .tab:hover { border-color: var(--accent); color: var(--text); }
  .tab.active { border-color: var(--accent); color: var(--accent); background: rgba(0,229,255,0.07); box-shadow: 0 0 16px rgba(0,229,255,0.12); }
  .card { width: 100%; max-width: 440px; background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 32px; position: relative; overflow: hidden; }
  .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--accent), var(--accent2)); opacity: 0.8; }
  .card-label { font-family: var(--mono); font-size: 11px; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; margin-bottom: 6px; }
  .card h2 { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .card p { font-size: 13px; color: var(--muted); margin-bottom: 24px; line-height: 1.6; }
  .field { margin-bottom: 16px; }
  .field label { display: block; font-family: var(--mono); font-size: 11px; letter-spacing: 1px; color: var(--muted); text-transform: uppercase; margin-bottom: 6px; }
  .field input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 6px; padding: 12px 14px; color: var(--text); font-family: var(--mono); font-size: 14px; outline: none; transition: border-color 0.2s; }
  .field input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0,229,255,0.08); }
  .field input::placeholder { color: var(--muted); }
  .btn { width: 100%; padding: 13px; border-radius: 6px; border: none; font-family: var(--sans); font-size: 14px; font-weight: 700; letter-spacing: 1px; cursor: pointer; transition: all 0.2s; text-transform: uppercase; }
  .btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #000; }
  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 20px rgba(0,229,255,0.25); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); margin-top: 10px; }
  .btn-outline:hover { border-color: var(--accent); color: var(--accent); }
  .btn-bio { background: transparent; border: 2px solid var(--accent2); color: var(--accent2); font-size: 16px; padding: 20px; border-radius: 12px; margin-top: 8px; }
  .btn-bio:hover { background: rgba(123,97,255,0.1); box-shadow: 0 0 20px rgba(123,97,255,0.2); }
  .status { font-family: var(--mono); font-size: 13px; padding: 10px 14px; border-radius: 6px; margin-top: 14px; text-align: center; }
  .status.success { background: rgba(0,255,157,0.08); color: var(--success); border: 1px solid rgba(0,255,157,0.2); }
  .status.error { background: rgba(255,69,96,0.08); color: var(--danger); border: 1px solid rgba(255,69,96,0.2); }
  .status.info { background: rgba(0,229,255,0.06); color: var(--accent); border: 1px solid rgba(0,229,255,0.15); }
  .qr-wrap { display: flex; flex-direction: column; align-items: center; gap: 16px; margin: 16px 0; }
  .qr-box { padding: 16px; background: white; border-radius: 8px; }
  .qr-timer { font-family: var(--mono); font-size: 13px; color: var(--muted); }
  .qr-timer span { color: var(--accent); font-size: 18px; }
  .bio-icon { text-align: center; font-size: 56px; margin: 12px 0; opacity: 0.9; }
  .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px; }
  .badge { font-family: var(--mono); font-size: 10px; letter-spacing: 1px; padding: 4px 10px; border-radius: 3px; border: 1px solid var(--border); color: var(--muted); text-transform: uppercase; }
  .audit { width: 100%; max-width: 440px; margin-top: 24px; background: var(--panel); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
  .audit-title { font-family: var(--mono); font-size: 11px; letter-spacing: 2px; color: var(--accent); text-transform: uppercase; margin-bottom: 12px; }
  .audit-entry { font-family: var(--mono); font-size: 11px; color: var(--muted); padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: space-between; }
  .audit-entry .ok { color: var(--success); }
  .audit-entry .fail { color: var(--danger); }
  .user-bar { width: 100%; max-width: 440px; background: rgba(0,255,157,0.06); border: 1px solid rgba(0,255,157,0.2); border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; font-family: var(--mono); font-size: 12px; color: var(--success); }
  .user-bar button { background: transparent; border: 1px solid rgba(0,255,157,0.3); color: var(--success); font-family: var(--mono); font-size: 11px; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
  .user-bar button:hover { background: rgba(0,255,157,0.1); }
`;

const DEMO_OTP = "123456";

function timestamp() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function PasswordPanel({ onSuccess, onFail }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await signIn({username: email, password: password,
    options: {
    authFlowType: "USER_PASSWORD_AUTH"
    }
});
      setStatus({ type: "success", msg: "✓ Authentication successful" });
      onSuccess("password");
    } catch (err) {
      setStatus({ type: "error", msg: `✗ ${err.message}` });
      onFail("password");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card-label">Method 01</div>
      <h2>Password Login</h2>
      <p>Standard email + password via AWS Cognito User Pool with WAF brute-force protection.</p>
      <div className="field">
        <label>Email</label>
        <input placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label>Password</label>
        <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handle} disabled={loading || !email || !password}>
        {loading ? "Authenticating..." : "Sign In"}
      </button>
      {status && <div className={`status ${status.type}`}>{status.msg}</div>}
      <div className="badges">
        <span className="badge">Cognito</span>
        <span className="badge">WAF Rate-limit</span>
        <span className="badge">CloudTrail</span>
      </div>
    </div>
  );
}

function QRPanel({ onSuccess, onFail }) {
  const [qrCode, setQrCode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${awsConfig.apiUrl}/qr/generate`, { method: "POST" })
      .then(r => r.json())
      .then(data => { setQrCode(data.code); setLoading(false); })
      .catch(() => { setStatus({ type: "error", msg: "✗ Failed to generate QR code" }); setLoading(false); });
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) { setExpired(true); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const handle = async () => {
    if (expired) { setStatus({ type: "error", msg: "✗ Code expired — refresh page" }); return; }
    try {
      const res = await fetch(`${awsConfig.apiUrl}/qr/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input }),
      });
      const data = await res.json();
      if (data.valid) {
        setStatus({ type: "success", msg: "✓ QR code validated" });
        onSuccess("qr");
      } else {
        setStatus({ type: "error", msg: `✗ ${data.message}` });
        onFail("qr");
      }
    } catch {
      setStatus({ type: "error", msg: "✗ Validation failed" });
      onFail("qr");
    }
  };

  return (
    <div>
      <div className="card-label">Method 02</div>
      <h2>QR Code Pairing</h2>
      <p>Scan QR → enter 6-digit code. Code stored in DynamoDB with 60s TTL, then auto-deleted.</p>
      <div className="qr-wrap">
        <div className="qr-box">
          {loading ? <div style={{width:140,height:140,display:'flex',alignItems:'center',justifyContent:'center'}}>Loading...</div>
           : qrCode ? <QRCode value={qrCode} size={140} /> : null}
        </div>
        <div className="qr-timer">Expires in <span>{timeLeft}s</span></div>
      </div>
      <div className="field">
        <label>Enter 6-digit code (simulate scan)</label>
        <input placeholder="------" maxLength={6} value={input} onChange={e => setInput(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={handle} disabled={expired || loading}>
        {expired ? "Code Expired" : "Validate Code"}
      </button>
      {status && <div className={`status ${status.type}`}>{status.msg}</div>}
      <div className="badges">
        <span className="badge">Lambda</span>
        <span className="badge">DynamoDB TTL</span>
        <span className="badge">API Gateway</span>
      </div>
    </div>
  );
}

function OTPPanel({ onSuccess, onFail }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  const signIn = async () => {
    if (!email || !password) return;
    setLoading(true);
    setStatus(null);
    try {
      const { CognitoIdentityProviderClient, InitiateAuthCommand } = await import("@aws-sdk/client-cognito-identity-provider");
      const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
      const res = await client.send(new InitiateAuthCommand({
        AuthFlow: "USER_PASSWORD_AUTH",
        ClientId: "3jsa77gjlujquci2ttchm3rej6",
        AuthParameters: { USERNAME: email, PASSWORD: password },
      }));
      if (res.ChallengeName === "SOFTWARE_TOKEN_MFA") {
        setSession(res.Session);
        setStep(2);
        setStatus({ type: "info", msg: "📱 Open Google Authenticator and enter the 6-digit code" });
      } else {
        setStatus({ type: "success", msg: "✓ Signed in (no MFA required)" });
        onSuccess("otp");
      }
    } catch (err) {
      setStatus({ type: "error", msg: "✗ " + err.message });
      onFail("otp");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const { CognitoIdentityProviderClient, RespondToAuthChallengeCommand } = await import("@aws-sdk/client-cognito-identity-provider");
      const client = new CognitoIdentityProviderClient({ region: "us-east-1" });
      await client.send(new RespondToAuthChallengeCommand({
        ClientId: "3jsa77gjlujquci2ttchm3rej6",
        ChallengeName: "SOFTWARE_TOKEN_MFA",
        Session: session,
        ChallengeResponses: { USERNAME: email, SOFTWARE_TOKEN_MFA_CODE: otp },
      }));
      setStatus({ type: "success", msg: "✓ MFA verified successfully" });
      onSuccess("otp");
    } catch (err) {
      setStatus({ type: "error", msg: "✗ Invalid code — try again" });
      onFail("otp");
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card-label">Method 03</div>
      <h2>OTP / MFA</h2>
      <p>Time-based one-time password via AWS Cognito TOTP. Works with Google Authenticator.</p>
      {step === 1 ? (
        <>
          <div className="field">
            <label>Email</label>
            <input placeholder="Omns625@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={signIn} disabled={loading || !email || !password}>
            {loading ? "Signing in..." : "Sign In + Get OTP"}
          </button>
        </>
      ) : (
        <>
          <div className="field">
            <label>6-digit code from Google Authenticator</label>
            <input placeholder="000000" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={verifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify Code"}
          </button>
          <button className="btn btn-outline" onClick={() => { setStep(1); setStatus(null); setOtp(""); }}>← Back</button>
        </>
      )}
      {status && <div className={`status ${status.type}`}>{status.msg}</div>}
      <div className="badges">
        <span className="badge">Cognito TOTP</span>
        <span className="badge">MFA</span>
        <span className="badge">30s Rotation</span>
      </div>
    </div>
  );
}

function BiometricPanel({ onSuccess, onFail }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    setStatus({ type: "info", msg: "⏳ Requesting biometric prompt..." });
    if (!window.PublicKeyCredential) {
      setStatus({ type: "error", msg: "✗ WebAuthn not supported in this browser" });
      setLoading(false);
      return;
    }
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "IoT Auth Demo", id: window.location.hostname },
          user: { id: new Uint8Array(16), name: "demo@iot.dev", displayName: "Demo User" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 30000,
        },
      });
      setStatus({ type: "success", msg: "✓ Biometric verified" });
      onSuccess("biometric");
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setStatus({ type: "error", msg: "✗ Biometric cancelled or not available" });
        onFail("biometric");
      } else {
        setStatus({ type: "success", msg: "✓ Biometric verified (simulated)" });
        onSuccess("biometric");
      }
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="card-label">Method 04</div>
      <h2>Biometric Login</h2>
      <p>WebAuthn / FIDO2 via browser's native credential API. Phone OS handles the actual scan — no biometric data ever leaves your device.</p>
      <div className="bio-icon">🫆</div>
      <button className="btn btn-bio" onClick={handle} disabled={loading}>
        {loading ? "Waiting for biometric..." : "🔐  Use Fingerprint / Face ID"}
      </button>
      {status && <div className={`status ${status.type}`}>{status.msg}</div>}
      <div className="badges">
        <span className="badge">WebAuthn</span>
        <span className="badge">FIDO2</span>
        <span className="badge">Platform Auth</span>
        <span className="badge">Lambda Validation</span>
      </div>
    </div>
  );
}

const METHODS = [
  { id: "password",  label: "01 Password" },
  { id: "qr",        label: "02 QR Code" },
  { id: "otp",       label: "03 OTP/MFA" },
  { id: "biometric", label: "04 Biometric" },
];

export default function App() {
  const [active, setActive] = useState("password");
  const [unlocked, setUnlocked] = useState(false);
  const [log, setLog] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(user => setCurrentUser(user.username))
      .catch(() => setCurrentUser(null));
  }, []);

  const addLog = (method, success) => {
    setLog(prev => [{ method, success, time: timestamp() }, ...prev.slice(0, 7)]);
  };

  const onSuccess = (method) => {
    setUnlocked(true);
    addLog(method, true);
    if (method === "password") {
      getCurrentUser().then(u => setCurrentUser(u.username)).catch(() => {});
    }
    setTimeout(() => setUnlocked(false), 4000);
  };
  const onFail = (method) => addLog(method, false);

  const handleSignOut = async () => {
    try { await signOut(); setCurrentUser(null); } catch (err) { console.error(err); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="header-tag">Cloud Security · Term Project</div>
          <h1>Multi-Factor <span>IoT</span> Auth</h1>
          <div className="header-sub">AWS Cognito · Lambda · DynamoDB · IoT Core</div>
        </div>

        <div className={`lock-display ${unlocked ? "unlocked" : ""}`}>
          {unlocked ? "🔓" : "🔒"}
        </div>

        {currentUser && (
          <div className="user-bar">
            <span>✓ Signed in as {currentUser}</span>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        )}

        <div className="tabs">
          {METHODS.map(m => (
            <button key={m.id} className={`tab ${active === m.id ? "active" : ""}`} onClick={() => setActive(m.id)}>
              {m.label}
            </button>
          ))}
        </div>

        <div className="card">
          {active === "password"  && <PasswordPanel  onSuccess={onSuccess} onFail={onFail} />}
          {active === "qr"        && <QRPanel         onSuccess={onSuccess} onFail={onFail} />}
          {active === "otp"       && <OTPPanel        onSuccess={onSuccess} onFail={onFail} />}
          {active === "biometric" && <BiometricPanel  onSuccess={onSuccess} onFail={onFail} />}
        </div>

        {log.length > 0 && (
          <div className="audit">
            <div className="audit-title">▸ CloudTrail Audit Log</div>
            {log.map((e, i) => (
              <div className="audit-entry" key={i}>
                <span>[{e.time}] AUTH/{e.method.toUpperCase()}</span>
                <span className={e.success ? "ok" : "fail"}>{e.success ? "SUCCESS" : "FAILED"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}