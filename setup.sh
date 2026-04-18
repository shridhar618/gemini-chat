#!/usr/bin/env bash
# ============================================================
# Lumina Chat — Setup Script
# Run: bash setup.sh
# ============================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════╗${NC}"
echo -e "${CYAN}║     Lumina Chat — Setup          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════╝${NC}"
echo ""

# ── 1. Check prerequisites ────────────────────────────────
echo -e "${CYAN}→ Checking prerequisites...${NC}"

if ! command -v python3 &>/dev/null; then
  echo -e "${RED}✗ Python 3 not found. Install from https://python.org${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version | cut -d' ' -f2)${NC}"

if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found. Install from https://nodejs.org${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

if ! command -v npm &>/dev/null; then
  echo -e "${RED}✗ npm not found.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

echo ""

# ── 2. Backend setup ──────────────────────────────────────
echo -e "${CYAN}→ Setting up backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
  python3 -m venv venv
  echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

source venv/bin/activate
pip install -r requirements.txt -q
echo -e "${GREEN}✓ Python dependencies installed${NC}"

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠  Created backend/.env — please add your GEMINI_API_KEY${NC}"
else
  echo -e "${GREEN}✓ .env already exists${NC}"
fi

deactivate
cd ..
echo ""

# ── 3. Frontend setup ─────────────────────────────────────
echo -e "${CYAN}→ Setting up frontend...${NC}"
cd frontend
npm install --silent
echo -e "${GREEN}✓ Node modules installed${NC}"
cd ..
echo ""

# ── 4. Done ───────────────────────────────────────────────
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ Setup complete!                       ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Edit ${YELLOW}backend/.env${NC} and set ${YELLOW}GEMINI_API_KEY=your_key${NC}"
echo -e "  2. Start backend:  ${CYAN}cd backend && source venv/bin/activate && python app.py${NC}"
echo -e "  3. Start frontend: ${CYAN}cd frontend && npm run dev${NC}"
echo -e "  4. Open: ${CYAN}http://localhost:5173${NC}"
echo ""
