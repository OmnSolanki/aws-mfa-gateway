# AWS Multi-Factor Authentication Gateway

A cloud-native multi-factor authentication (MFA) system deployed on AWS. Features four distinct authentication methods in a single React frontend, all backed by serverless AWS infrastructure.

---

## Project Overview

This project implements a serverless multi-factor authentication gateway on AWS, simulating real-world secure access control for cloud applications. Built as a term project for Cloud Security, it demonstrates how AWS services can be composed into a secure, scalable auth pipeline supporting four distinct authentication methods.

---

## Authentication Methods

| # | Method | Description |
|---|---|---|
| 01 | **Password** | Email + password via AWS Cognito User Pool with WAF brute-force protection |
| 02 | **QR Code** | Scan QR → enter 6-digit code stored in DynamoDB with 60s TTL auto-deletion |
| 03 | **OTP / MFA** | Time-based one-time password (TOTP) via Cognito + Google Authenticator |
| 04 | **Biometric** | WebAuthn / FIDO2 via browser native credential API (Face ID / Fingerprint) |

---

## Architecture

```
React Frontend (AWS Amplify)
        │
        ├── Password ──────────► AWS Cognito User Pool ──► WAF Rate Limiting
        │
        ├── QR Code ───────────► API Gateway ──► Lambda ──► DynamoDB (TTL 60s)
        │
        ├── OTP / MFA ─────────► Cognito TOTP ──► Google Authenticator (30s rotation)
        │
        └── Biometric ─────────► WebAuthn / FIDO2 ──► Lambda Validation
                                        │
                                   CloudTrail Audit Log
```

---

## AWS Services Used

- **AWS Amplify** — frontend hosting and CI/CD pipeline
- **AWS Cognito** — user pool, password auth, TOTP/MFA
- **AWS Lambda** — QR code generation, validation, biometric verification
- **Amazon DynamoDB** — QR code storage with 60-second TTL auto-expiry
- **Amazon API Gateway** — REST endpoints for QR and biometric flows
- **AWS IoT Core** — IoT device access control layer
- **AWS WAF** — brute-force and rate-limit protection on Cognito
- **AWS CloudTrail** — audit logging for all authentication events

---

## Key Features

- **Four auth methods** in a single unified UI with real-time audit log
- **60-second QR code expiry** — codes auto-deleted from DynamoDB via TTL
- **TOTP MFA** with 30-second rotation compatible with Google Authenticator
- **WebAuthn/FIDO2 biometric** — no biometric data ever leaves the user's device
- **CloudTrail audit trail** displayed live in the UI per auth attempt
- **WAF protection** against brute-force attacks on password login

---

## Tech Stack

**Frontend:** React, AWS Amplify, WebAuthn API, qrcode.react  
**Backend:** AWS Lambda (Node.js), Amazon DynamoDB, API Gateway  
**Auth:** AWS Cognito (User Pool, TOTP), WAF, FIDO2  
**Infra:** AWS Amplify CI/CD, CloudTrail, IoT Core  

---

## Project Structure

```
iot-auth-project/
│
├── frontend/
│   ├── src/
│   │   ├── App.js           # Main component with all 4 auth panels
│   │   └── aws-config.js    # Cognito + API config
│   └── package.json
│
├── amplify.yml              # Amplify build config
└── README.md
```

---

## Screenshots

> UI features a cyberpunk-themed dark interface with live CloudTrail audit log panel.

---

## Notes

- Deployed via AWS Amplify (deployment paused to manage AWS credits)
- Biometric method uses browser WebAuthn API — works on Chrome/Safari with Touch ID or Face ID enabled devices
- QR code flow requires backend Lambda endpoints to be active

---

## Tools & Services

`React` `AWS Amplify` `AWS Cognito` `AWS Lambda` `Amazon DynamoDB` `API Gateway` `AWS IoT Core` `AWS WAF` `CloudTrail` `WebAuthn` `FIDO2`