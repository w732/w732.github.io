---
title: "qwen-native: A Single-File AI Coding Agent with Zero Dependencies"
date: 2026-03-25
tags: ["AI", "Python", "CLI", "Qwen", "Agent", "Open Source"]
---

I built a **2,800-line single-file Python CLI** that gives you a Claude Code / Cursor-like AI coding agent in your terminal — with zero pip dependencies, multi-agent support, and free-tier access via Qwen OAuth.

**Repository**: [github.com/w732/qwen_native](https://github.com/w732/qwen_native)

## Why?

AI coding assistants like Claude Code and Cursor are powerful, but they come with trade-offs: large binary downloads, paid subscriptions, vendor lock-in. I wanted something that:

- Runs with `python qwen-native.py` — no install, no build, no npm
- Works with **any OpenAI-compatible API** (Qwen, DeepSeek, OpenAI, OpenRouter, etc.)
- Supports **free-tier access** via Qwen OAuth (1,000 requests/day)
- Has a real agent loop with tool calling, not just a chat wrapper
- Fits in a single file I can understand and modify

## What It Does

```bash
# Login with your Qwen account (free, no API key needed)
python qwen-native.py --login

# Start coding
python qwen-native.py
```

You get a full-featured terminal agent:

```
  ╔═══════════════════════════════╗
  ║  ╔═╗ ╦ ╦╔═╗╔╗╔  ╔═╗╔═╗╔╦╗╔═╗║
  ║  ║═╬╗║║║║╣ ║║║  ║  ║ ║ ║║║╣ ║
  ║  ╚═╝╚╚╩╝╚═╝╝╚╝  ╚═╝╚═╝═╩╝╚═╝║
  ╚═══════════════════════════════╝

  >_ qwen-native
  dashscope | coder-model
  ~/my-project

> Fix the bug in auth.py where tokens expire too early

  ⊷ Read  src/auth.py
    ✓ (142 lines)
  ⊷ Edit  src/auth.py
    ✓
  ⊷ Bash  python -m pytest tests/test_auth.py
    ✓ (3 passed)

  Fixed the token expiry calculation in `refresh_token()` —
  was using seconds instead of milliseconds for the buffer.

  4.2s · ↑2.1k ↓890 · 3 tools
```

## Key Features

### 1. Zero Dependencies, Single File

The entire agent — API client, tool executor, OAuth flow, terminal UI — lives in one `.py` file using only the Python standard library. No `pip install`, no `requirements.txt`.

### 2. Multi-Provider Support

Works with any OpenAI-compatible API out of the box:

```bash
# Qwen (default, free tier available)
python qwen-native.py

# DeepSeek
python qwen-native.py --provider deepseek --api-key sk-xxx

# OpenAI
python qwen-native.py --provider openai --api-key sk-xxx

# Any compatible endpoint
python qwen-native.py --base-url http://localhost:8080/v1 --api-key xxx
```

Six providers are pre-configured: DashScope, OpenAI, DeepSeek, OpenRouter, ModelScope, and Anthropic.

### 3. Qwen OAuth (No API Key Needed)

```bash
python qwen-native.py --login
```

This opens your browser for Qwen account authorization using the OAuth Device Flow (RFC 8628). Once authorized, credentials are cached at `~/.qwen/oauth_creds.json` with automatic token refresh. No API key, no credit card — just your Qwen account.

### 4. Multi-Agent Parallel Execution

The agent can spawn sub-agents for complex tasks:

```
> Analyze the test coverage and find all TODO comments in this repo

  ◈ Agent  Analyze test coverage
      ↳ Agent(test coverage) → Bash ✓
      ↳ Agent(test coverage) → Grep ✓
  ◈ Agent  Find TODO comments          ← Runs in parallel
      ↳ Agent(TODO comments) → Grep ✓
    ✓

  Found 12 TODOs and test coverage is at 73%...
```

Each sub-agent gets its own independent conversation and tool set. When the model returns multiple Agent calls in one response, they execute concurrently via `ThreadPoolExecutor`. Sub-agents cannot spawn further agents (no infinite recursion).

### 5. 7 Built-in Tools

| Tool | What it does |
|---|---|
| **Bash** | Run shell commands (with timeout) |
| **Read** | Read files with line numbers |
| **Write** | Create/overwrite files |
| **Edit** | Exact string replacement in files |
| **Glob** | Find files by pattern |
| **Grep** | Search file contents (uses ripgrep if available) |
| **Agent** | Spawn independent sub-agents |

### 6. Interactive UI

- **Live slash command popup**: Type `/` to see all commands with instant filtering
- **Spinner animation**: Shows elapsed time while waiting for the model
- **CJK-aware cursor**: Correctly handles Chinese/Japanese/Korean wide characters
- **Command history**: Navigate with ↑/↓ arrow keys
- **Thinking display**: Model reasoning shown in gray, final answer in normal style

### 7. Project Init

```bash
python qwen-native.py --init
```

Scans your project structure and generates a `QWEN.md` file with project overview, tech stack, structure, setup instructions, and conventions. This file is automatically loaded as context in subsequent conversations.

## How It Works

The architecture is surprisingly simple for what it does:

```
User Input
    ↓
AgentLoop (while turn < maxTurns)
    ├─ Convert messages to OpenAI format
    ├─ Stream SSE from /v1/chat/completions
    ├─ Translate OpenAI chunks → unified events
    ├─ If tool_use → execute tools (parallel if multiple)
    ├─ Append results → next turn
    └─ If end_turn → return response
```

The key design decision is the **protocol translation layer**: `OpenAIClient._translate_openai_stream()` converts OpenAI's `ChatCompletionChunk` SSE format into Anthropic-style normalized events (`content_block_start`, `content_block_delta`, etc.). This means `AgentLoop` doesn't know or care which API it's talking to.

## Three Modes

```bash
# Interactive REPL (full UI)
python qwen-native.py

# One-shot (pipe-friendly)
python qwen-native.py -p "explain this function" > output.md

# NDJSON bridge (for programmatic use)
echo '{"type":"message","content":"hi"}' | python qwen-native.py --ndjson
```

## Credits

This project is based on [claude-code-sdk](https://github.com/SeifBenayed/claude-code-sdk) by [SeifBenayed](https://github.com/SeifBenayed), which reverse-engineered the Claude Code CLI into single-file, zero-dependency implementations. I rewrote the API layer from Anthropic to OpenAI-compatible, and added Qwen OAuth, multi-agent, interactive UI, and project init features.

The [Qwen Code](https://github.com/QwenLM/qwen-code) project by the Qwen team was also a key reference for understanding the DashScope OAuth flow and API integration patterns.

## Get Started

```bash
git clone https://github.com/w732/qwen_native
cd qwen_native
python qwen-native.py --login   # One-time: authorize with Qwen account
python qwen-native.py           # Start coding
```

That's it. One file, zero installs, free AI coding agent.
